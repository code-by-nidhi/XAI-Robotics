import type { ExecuteValues, PoolConnection, ResultSetHeader } from 'mysql2/promise'

/**
 * INSERT / UPDATE from a column → value record.
 *
 * Column names come only from the modules' field maps, never from a request,
 * so interpolating them is safe; every value is bound. The connection is the
 * transaction's when there is one, so parent and children commit together.
 */
export async function insertRow(
  connection: PoolConnection,
  table: string,
  id: string,
  values: Record<string, unknown>,
): Promise<void> {
  const columns = Object.keys(values)
  await connection.execute<ResultSetHeader>(
    `INSERT INTO ${table} (id, ${columns.join(', ')}, created_at, updated_at)
     VALUES (?, ${columns.map(() => '?').join(', ')}, NOW(3), NOW(3))`,
    [id, ...Object.values(values)] as ExecuteValues,
  )
}

export async function updateRow(
  connection: PoolConnection,
  table: string,
  id: string,
  values: Record<string, unknown>,
): Promise<void> {
  const columns = Object.keys(values)
  if (columns.length === 0) return
  await connection.execute<ResultSetHeader>(
    `UPDATE ${table} SET ${columns.map((c) => `${c} = ?`).join(', ')}, updated_at = NOW(3) WHERE id = ?`,
    [...Object.values(values), id] as ExecuteValues,
  )
}

/** Zips a field map's output into the record the helpers above take. */
export function record(...parts: { columns: string[]; values: unknown[] }[]): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const { columns, values } of parts) {
    columns.forEach((column, index) => {
      out[column] = values[index]
    })
  }
  return out
}
