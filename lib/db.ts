import mysql, { type Pool } from "mysql2/promise";

const globalForDb = globalThis as typeof globalThis & { mysqlPool?: Pool };

export function getPool(): Pool {
  if (globalForDb.mysqlPool) {
    return globalForDb.mysqlPool;
  }

  const host = process.env.DB_HOST || "localhost";
  const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const database = process.env.DB_NAME || "xai_robotics";

  const pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    charset: "utf8mb4",
  });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.mysqlPool = pool;
  }

  return pool;
}

export type ServiceRequestInput = {
  name: string;
  email: string;
  phone: string;
  service: string;
  role?: string;
  message?: string;
  ip_address?: string | null;
};

export async function createServiceRequest(data: ServiceRequestInput) {
  const pool = getPool();

  // Ensure table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS service_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(190) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      service VARCHAR(150) NOT NULL,
      role VARCHAR(100) DEFAULT 'Service request',
      message TEXT,
      status VARCHAR(50) DEFAULT 'new',
      ip_address VARCHAR(45),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  const sql = `
    INSERT INTO service_requests (name, email, phone, service, role, message, status, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, 'new', ?)
  `;

  const values = [
    data.name.trim(),
    data.email.trim(),
    data.phone.trim(),
    data.service.trim(),
    data.role ? data.role.trim() : "Service request",
    data.message ? data.message.trim() : "",
    data.ip_address || null,
  ];

  const [result] = await pool.execute(sql, values);
  return result as { insertId: number; affectedRows: number };
}
