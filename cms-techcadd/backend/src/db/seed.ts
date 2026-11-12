import { randomBytes, randomUUID } from 'node:crypto'

import { execute, pool, queryOne } from './pool.js'
import { hashPassword } from '../modules/auth/auth.service.js'

/**
 * Creates the first administrator so the CMS is reachable. Idempotent — running
 * it twice leaves the existing account alone rather than resetting a password
 * someone has already changed. The Docker image runs it on every boot for that
 * reason.
 *
 * There is no built-in password. A default in source is a credential every
 * copy of this code shares; SEED_PASSWORD sets one, and without it a random
 * password is generated and printed once — the only time it is ever shown.
 */
const EMAIL = process.env.SEED_EMAIL ?? 'admin@example.com'
const NAME = process.env.SEED_NAME ?? 'XAI Admin'
/** What can be typed into the login form besides the email. */
const USERNAME = process.env.SEED_USERNAME ?? 'admin'
const PROVIDED = process.env.SEED_PASSWORD?.trim()

async function seed(): Promise<void> {
  // Either identifier colliding means an account is already here. Checked
  // together because both columns are unique: inserting on a match of one
  // would fail on the other anyway, with a raw SQL error instead of this note.
  const existing = await queryOne<{ id: string; username: string | null }>(
    'SELECT id, username FROM users WHERE email = ? OR username = ? LIMIT 1',
    [EMAIL, USERNAME],
  )

  if (existing) {
    if (!existing.username) {
      await execute('UPDATE users SET username = ? WHERE id = ?', [USERNAME, existing.id])
      console.log(`Backfilled username "${USERNAME}" for existing account <${EMAIL}>.`)
    } else {
      console.log('An account with that email or username already exists — nothing to do.')
    }
    return
  }

  const password = PROVIDED || randomBytes(12).toString('base64url')

  await execute(
    `INSERT INTO users (id, name, email, username, password_hash, role, active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'admin', 1, NOW(3), NOW(3))`,
    [randomUUID(), NAME, EMAIL, USERNAME, await hashPassword(password)],
  )

  console.log(`Created administrator: ${NAME} <${EMAIL}>`)
  console.log(`Username: ${USERNAME}`)
  if (PROVIDED) {
    console.log('Password: the value of SEED_PASSWORD.')
  } else {
    console.log(`Password: ${password}`)
    console.log('This generated password is shown once. Note it now.')
  }
  console.log('\nChange it after the first sign-in (Settings → Security).')
}

seed()
  .catch((error: unknown) => {
    console.error('Seed failed:', error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(() => pool.end())
