import { randomUUID } from 'node:crypto'
import type { ExecuteValues, PoolConnection, ResultSetHeader } from 'mysql2/promise'

import { toStorableId } from '../../db/ids.js'
import { execute, query, queryOne, transaction, type Row } from '../../db/pool.js'
import { notFound } from '../../http/errors.js'
import type { ListParams, ListResult } from '../../http/listParams.js'
import { columnsFor, type FieldMap } from '../shared/fields.js'
import { listRows, placeholders } from '../shared/list.js'
import { insertRow, record, updateRow } from '../shared/write.js'
import type {
  EnquiryBulk,
  EnquiryInput,
  EnquiryNoteInput,
  EnquiryPatch,
  PublicEnquiry,
} from './enquiries.schema.js'

const SORTABLE: Record<string, string> = {
  name: 'e.name',
  email: 'e.email',
  company: 'e.company',
  service: 'e.service',
  status: 'e.status',
  createdAt: 'e.created_at',
  updatedAt: 'e.updated_at',
}

const FILTERABLE: Record<string, string> = {
  status: 'e.status',
  service: 'e.service',
  assigneeId: 'e.assignee_id',
  createdAt: 'e.created_at',
  updatedAt: 'e.updated_at',
}

const FIELDS: FieldMap = {
  name: { column: 'name', kind: 'text' },
  email: { column: 'email', kind: 'text' },
  phone: { column: 'phone', kind: 'optional' },
  company: { column: 'company', kind: 'optional' },
  service: { column: 'service', kind: 'optional' },
  subject: { column: 'subject', kind: 'optional' },
  message: { column: 'message', kind: 'text' },
  status: { column: 'status', kind: 'text' },
  assigneeId: { column: 'assignee_id', kind: 'optional' },
}

function toEnquiry(row: Row, notes: unknown[]): unknown {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    company: row.company ?? undefined,
    service: row.service ?? undefined,
    subject: row.subject ?? undefined,
    message: row.message ?? '',
    status: row.status,
    assigneeId: row.assignee_id ?? undefined,
    assignee: row.assignee_id ? { id: row.assignee_id, name: row.assignee_name } : undefined,
    ip: row.ip ?? undefined,
    userAgent: row.user_agent ?? undefined,
    notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const SELECT = 'e.*, u.name AS assignee_name'
const FROM = 'FROM enquiries e LEFT JOIN users u ON u.id = e.assignee_id'

/** One query for the whole page rather than one per enquiry. */
async function loadNotes(ids: string[]): Promise<Map<string, unknown[]>> {
  const map = new Map<string, unknown[]>()
  if (ids.length === 0) return map
  for (const id of ids) map.set(id, [])

  const rows = await query<Row>(
    `SELECT id, enquiry_id, author, body, created_at FROM enquiry_notes
      WHERE enquiry_id IN (${placeholders(ids)}) ORDER BY created_at`,
    ids,
  )
  for (const row of rows) {
    map.get(row.enquiry_id as string)?.push({
      id: row.id,
      author: row.author,
      body: row.body,
      createdAt: row.created_at,
    })
  }
  return map
}

export async function list(params: ListParams): Promise<ListResult<unknown>> {
  // Archived enquiries are out of the way unless asked
  // for (by status, or status=all), so "clear the inbox" does not mean
  // "delete the record".
  const filters = { ...params.filters }
  const everything = filters.status === 'all'
  if (everything) delete filters.status
  const { rows, total } = await listRows({ ...params, filters }, {
    from: FROM,
    select: SELECT,
    sortable: SORTABLE,
    filterable: FILTERABLE,
    searchColumns: ['e.name', 'e.email', 'e.phone', 'e.company', 'e.message'],
    fallbackSort: { column: 'e.created_at', dir: 'desc' },
    where: filters.status || everything ? undefined : { sql: "e.status <> 'archived'", params: [] },
  })

  const notes = await loadNotes(rows.map((row) => row.id as string))
  return {
    items: rows.map((row) => toEnquiry(row, notes.get(row.id as string) ?? [])),
    total,
    page: params.page,
    pageSize: params.pageSize,
  }
}

/** One enquiry. Opening a new one in the CMS marks it read. */
export async function get(id: string, markRead = false): Promise<unknown> {
  if (markRead) {
    await execute("UPDATE enquiries SET status = 'read', updated_at = NOW(3) WHERE id = ? AND status = 'new'", [id])
  }
  const row = await queryOne<Row>(`SELECT ${SELECT} ${FROM} WHERE e.id = ? LIMIT 1`, [id])
  if (!row) throw notFound('Enquiry')
  const notes = await loadNotes([id])
  return toEnquiry(row, notes.get(id) ?? [])
}

/**
 * Reconciles the note timeline against what the client sent.
 *
 * Notes are append-only: the drawer posts the existing array plus one new
 * entry. Deleting and reinserting would rewrite every `created_at`, so
 * existing rows are left untouched and only genuinely new notes are inserted.
 */
async function writeNotes(
  connection: PoolConnection,
  enquiryId: string,
  notes: EnquiryNoteInput[],
): Promise<void> {
  const existing = await query<{ id: string }>('SELECT id FROM enquiry_notes WHERE enquiry_id = ?', [enquiryId])
  const known = new Set(existing.map((row) => row.id))

  for (const note of notes) {
    if (note.id && known.has(note.id)) continue
    await connection.execute<ResultSetHeader>(
      `INSERT INTO enquiry_notes (id, enquiry_id, author, body, created_at) VALUES (?, ?, ?, ?, ?)`,
      [
        toStorableId(note.id),
        enquiryId,
        note.author,
        note.body,
        // Honour a supplied timestamp so an import keeps its history.
        note.createdAt ? new Date(note.createdAt) : new Date(),
      ] as ExecuteValues,
    )
  }
}

export async function create(input: EnquiryInput): Promise<unknown> {
  const id = randomUUID()
  await transaction(async (connection) => {
    await insertRow(connection, 'enquiries', id, record(columnsFor(FIELDS, input)))
    await writeNotes(connection, id, input.notes)
  })
  return get(id)
}

export async function update(id: string, patch: EnquiryPatch): Promise<unknown> {
  const existing = await queryOne<Row>('SELECT id FROM enquiries WHERE id = ? LIMIT 1', [id])
  if (!existing) throw notFound('Enquiry')

  await transaction(async (connection) => {
    await updateRow(connection, 'enquiries', id, record(columnsFor(FIELDS, patch)))
    if (patch.notes !== undefined) await writeNotes(connection, id, patch.notes)
  })
  return get(id)
}

/**
 * Applies one change to many enquiries.
 *
 * The list offers reassign / restatus over a selection; doing that as N round
 * trips would be both slow and non-atomic.
 */
export async function bulkUpdate(input: EnquiryBulk): Promise<number> {
  const values = record(columnsFor(FIELDS, { status: input.status, assigneeId: input.assigneeId }))
  const columns = Object.keys(values)
  if (columns.length === 0) return 0

  await execute(
    `UPDATE enquiries SET ${columns.map((c) => `${c} = ?`).join(', ')}, updated_at = NOW(3)
      WHERE id IN (${placeholders(input.ids)})`,
    [...Object.values(values), ...input.ids],
  )
  return input.ids.length
}

export async function remove(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  // enquiry_notes cascades.
  await query(`DELETE FROM enquiries WHERE id IN (${placeholders(ids)})`, ids)
}

/* ------------------------------------------------------------------ */
/* The website's contact form                                           */
/* ------------------------------------------------------------------ */

/**
 * Whether this exact message already arrived in the last ten minutes.
 *
 * A double-click or a resubmitted form is accepted without a second record —
 * the visitor sees success either way, and the inbox does not fill with twins.
 */
export async function isRecentDuplicate(email: string, message: string): Promise<boolean> {
  const row = await queryOne<Row>(
    `SELECT id FROM enquiries
      WHERE email = ? AND message = ? AND created_at > NOW(3) - INTERVAL 10 MINUTE LIMIT 1`,
    [email, message],
  )
  return Boolean(row)
}

export async function createFromWebsite(
  input: PublicEnquiry,
  origin: { ip?: string; userAgent?: string },
): Promise<{ id: string }> {
  const id = randomUUID()
  await transaction((connection) =>
    insertRow(connection, 'enquiries', id, {
      ...record(
        columnsFor(FIELDS, {
          name: input.name,
          email: input.email,
          phone: input.phone,
          company: input.company,
          service: input.service,
          message: input.message,
          // Every public submission starts at the beginning of the pipeline.
          status: 'new',
        }),
      ),
      subject: input.company
        ? `Website enquiry from ${input.company}`
        : input.role
          ? `Website enquiry · ${input.role}`
          : 'Website enquiry',
      ip: origin.ip?.slice(0, 45) ?? null,
      user_agent: origin.userAgent?.slice(0, 255) ?? null,
    }),
  )
  return { id }
}
