import { randomBytes } from 'node:crypto'
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'

import { config } from '../../config.js'
import { notFound, unprocessable } from '../../http/errors.js'

/**
 * Private storage for CVs sent with job applications:
 *   <PRIVATE_DIR>/applications/YYYY/MM/<32 hex>.<ext>
 *
 * Nothing serves this directory. A CV is a person's address, phone number and
 * work history, sent to the company rather than published, so the only way to
 * read one is GET /api/applications/:id/cv, behind an admin session. The
 * stored name is random and the extension comes from the file's content, so
 * nothing the applicant chose ends up in a path.
 */
export const CV_MAX_BYTES = 5 * 1024 * 1024

const root = () => resolve(config.PRIVATE_DIR, 'applications')

/**
 * Accepted by content, not by name or declared type, both of which the
 * uploader controls. A .docx is a zip, so its magic bytes alone would also
 * admit any zip; the extension narrows it, as on the Zaavi site.
 */
const KINDS = [
  {
    ext: 'pdf',
    mime: 'application/pdf',
    matches: (bytes: Buffer) => bytes.subarray(0, 5).toString('latin1') === '%PDF-',
  },
  {
    ext: 'docx',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    matches: (bytes: Buffer, name: string) => bytes.readUInt32BE(0) === 0x504b0304 && /\.docx$/i.test(name),
  },
  {
    ext: 'doc',
    mime: 'application/msword',
    matches: (bytes: Buffer) =>
      bytes.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])),
  },
]

/** A display name for the download: the applicant's, minus anything risky. */
const cleanName = (name: string) =>
  name
    .normalize('NFKD')
    .replace(/[^\w.\- ]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120) || 'cv'

export interface StoredCv {
  key: string
  filename: string
  mime: string
  size: number
}

export async function saveCv(file: { buffer: Buffer; originalname: string; size: number } | undefined): Promise<StoredCv> {
  if (!file || file.size === 0) throw unprocessable({ cv: 'Attach your resume.' })
  if (file.size > CV_MAX_BYTES) throw unprocessable({ cv: 'Your resume must be 5 MB or smaller.' })

  const kind = file.buffer.length >= 8 ? KINDS.find((k) => k.matches(file.buffer, file.originalname)) : undefined
  if (!kind) throw unprocessable({ cv: 'Upload your resume as a PDF or Word document.' })

  const now = new Date()
  const key = [
    String(now.getUTCFullYear()),
    String(now.getUTCMonth() + 1).padStart(2, '0'),
    `${randomBytes(16).toString('hex')}.${kind.ext}`,
  ].join('/')

  const target = join(root(), ...key.split('/'))
  await mkdir(dirname(target), { recursive: true })
  // 'wx': never overwrite. A collision on 128 random bits is not a real case,
  // and if it were, failing beats replacing someone else's CV.
  await writeFile(target, file.buffer, { flag: 'wx' })

  const base = cleanName(file.originalname).replace(/\.[^.]+$/, '')
  return { key, filename: `${base}.${kind.ext}`, mime: kind.mime, size: file.buffer.length }
}

/**
 * The file for a stored key.
 *
 * The key comes from the database, but it is checked against the exact shape
 * saveCv writes anyway, so a tampered row cannot turn this into a way to read
 * any file the process can see.
 */
function pathFor(key: string): string {
  if (!/^\d{4}\/\d{2}\/[a-f0-9]{32}\.(pdf|docx|doc)$/.test(key)) throw notFound('CV')
  return join(root(), ...key.split('/'))
}

export async function readCv(key: string): Promise<Buffer> {
  try {
    return await readFile(pathFor(key))
  } catch {
    throw notFound('CV')
  }
}

export async function deleteCv(key: string): Promise<void> {
  try {
    await unlink(pathFor(key))
  } catch {
    // Already gone; the row going away is what matters.
  }
}
