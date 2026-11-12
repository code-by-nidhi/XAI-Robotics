import { execute, queryOne, type Row } from '../../db/pool.js'
import { parseJson } from '../shared/fields.js'
import {
  SETTINGS_GROUPS,
  SETTINGS_SCHEMAS,
  type SettingsGroup,
  type SettingsPatch,
  type SettingsValues,
} from './settings.schema.js'

/** The settings row's fixed primary key — there is only ever one. */
const SINGLETON_ID = 1

/**
 * What a group reads as before anyone has saved it.
 *
 * The XAI Robotics website's own values (lib/cms.ts there, FALLBACK_SITE), so
 * a fresh install shows the same business details the site shipped with
 * rather than blanks. The site prints `address` and `city` as its two
 * location lines (HQ, then lab).
 */
const DEFAULTS: SettingsValues = {
  general: {
    siteName: 'XAI Robotics',
    tagline: 'Machines that perceive, reason and move',
    contactEmail: 'hello@xairobotics.com',
    phone: '',
    address: 'HQ — San Francisco, CA',
    city: 'LAB — Munich, DE',
    hours: '',
    responseTime: 'within 48 hours',
  },
  social: { linkedin: '', facebook: '', x: '', youtube: '', instagram: '' },
  seo: {
    defaultTitle: 'XAI Robotics — Machines that perceive, reason and move',
    defaultDescription:
      'XAI Robotics engineers autonomous humanoids, manipulators, quadrupeds and aerial systems powered by embodied intelligence.',
    allowIndexing: true,
  },
  email: { alertEmail: '', sendInquiryAlerts: true, sendApplicationAlerts: true },
}

/**
 * Stored values over the defaults, field by field.
 *
 * A field that no longer validates — a rule tightened after it was saved —
 * falls back on its own rather than failing the whole group, so the settings
 * page and the website both keep working while someone fixes it.
 */
function merge<K extends SettingsGroup>(group: K, stored: unknown): SettingsValues[K] {
  const base = DEFAULTS[group] as Record<string, unknown>
  const raw = stored && typeof stored === 'object' ? (stored as Record<string, unknown>) : {}
  const shape = SETTINGS_SCHEMAS[group].shape as Record<string, { safeParse(v: unknown): { success: boolean; data?: unknown } }>
  const out: Record<string, unknown> = {}
  for (const key of Object.keys(base)) {
    const parsed = key in raw ? shape[key]!.safeParse(raw[key]) : { success: false }
    out[key] = parsed.success ? parsed.data : base[key]
  }
  return out as SettingsValues[K]
}

async function loadRow(): Promise<Row | undefined> {
  return queryOne<Row>('SELECT general, social, seo, email FROM settings WHERE id = ? LIMIT 1', [SINGLETON_ID])
}

/** Every group, complete. */
export async function load(): Promise<SettingsValues> {
  const row = await loadRow()
  const values = {} as Record<SettingsGroup, unknown>
  for (const group of SETTINGS_GROUPS) values[group] = merge(group, parseJson(row?.[group], {}))
  return values as SettingsValues
}

interface Profile {
  name: string
  email: string
}

export async function get(profile: Profile): Promise<unknown> {
  // The migration seeds the row, so this only happens if it was deleted by
  // hand. Recreating it beats failing every request on the settings page.
  if (!(await loadRow())) {
    await execute(
      `INSERT INTO settings (id, general, social, seo, email, created_at, updated_at)
       VALUES (?, '{}', '{}', '{}', '{}', NOW(3), NOW(3))`,
      [SINGLETON_ID],
    )
  }
  // Identity comes from the session, not the settings row: storing it would
  // let it drift out of step with the user account it describes.
  return { ...(await load()), profile }
}

/**
 * Merges each sent group over what is stored.
 *
 * Each settings card saves on its own, so a request that carries only
 * `{ email: { alertEmail } }` must not reset the alert switches beside it.
 */
export async function update(patch: SettingsPatch, profile: Profile): Promise<unknown> {
  const current = await load()
  const assignments: string[] = []
  const params: unknown[] = []

  for (const group of SETTINGS_GROUPS) {
    const sent = patch[group]
    if (sent === undefined) continue
    assignments.push(`${group} = ?`)
    params.push(JSON.stringify({ ...current[group], ...sent }))
  }

  if (assignments.length > 0) {
    await execute(`UPDATE settings SET ${assignments.join(', ')}, updated_at = NOW(3) WHERE id = ?`, [
      ...params,
      SINGLETON_ID,
    ])
  }
  return get(profile)
}

/** What the website may read: everything but where alerts are sent. */
export async function publicSite(): Promise<Omit<SettingsValues, 'email'>> {
  const { general, social, seo } = await load()
  return { general, social, seo }
}

/** Where alerts go, and whether they are on. */
export async function alertSettings(): Promise<SettingsValues['email']> {
  return (await load()).email
}
