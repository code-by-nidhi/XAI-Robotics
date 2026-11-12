import { randomUUID } from 'node:crypto'
import { execute, pool, queryOne } from './pool.js'
import { hashPassword } from '../modules/auth/auth.service.js'

/**
 * Resets the password for an existing admin user, or creates one if none exists.
 *
 * Usage:
 *   npm run db:reset-admin <username> <new_password>
 *   SEED_USERNAME=admin SEED_PASSWORD=YourNewPassword npm run db:reset-admin
 *
 * A password must be provided explicitly (argument or SEED_PASSWORD) — there is
 * no built-in default, so a real credential never ends up hardcoded in source.
 */
function requirePassword(value: string | undefined): string {
  if (!value) {
    console.error(
      '\nNo password provided. Usage:\n' +
        '  npm run db:reset-admin <username> <new_password>\n' +
        '  SEED_PASSWORD=YourNewPassword npm run db:reset-admin\n',
    )
    process.exit(1)
  }
  return value
}

const args = process.argv.slice(2)
const USERNAME = (args[0] ?? process.env.SEED_USERNAME ?? 'admin').trim().toLowerCase()
const PASSWORD = requirePassword(args[1] ?? process.env.SEED_PASSWORD)
const EMAIL = process.env.SEED_EMAIL ?? 'admin@example.com'
const NAME = process.env.SEED_NAME ?? 'XAI Admin'

async function resetAdmin(): Promise<void> {
  const user = await queryOne<{ id: string; username: string | null; email: string }>(
    'SELECT id, username, email FROM users WHERE username = ? OR email = ? LIMIT 1',
    [USERNAME, EMAIL],
  )

  const newHash = await hashPassword(PASSWORD)

  if (user) {
    await execute(
      'UPDATE users SET username = ?, password_hash = ?, active = 1, updated_at = NOW(3) WHERE id = ?',
      [USERNAME, newHash, user.id],
    )
    console.log(`\nSuccessfully updated password for user "${USERNAME}" (${user.email}).`)
  } else {
    await execute(
      `INSERT INTO users (id, name, email, username, password_hash, role, active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'admin', 1, NOW(3), NOW(3))`,
      [randomUUID(), NAME, EMAIL, USERNAME, newHash],
    )
    console.log(`\nCreated new administrator account: ${NAME} <${EMAIL}>`)
  }

  console.log(`Username: ${USERNAME}`)
  console.log('Role: admin\n')
}

resetAdmin()
  .catch((error: unknown) => {
    console.error('Failed to reset admin credentials:', error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(() => pool.end())
