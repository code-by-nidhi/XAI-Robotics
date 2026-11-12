import { Router } from 'express'

import { asyncHandler, badRequest } from '../../http/errors.js'
import { parseListParams } from '../../http/listParams.js'
import { requireParam } from '../../http/params.js'
import { requireAuth, requireRole } from '../../middleware/auth.js'
import { deleteSchema } from '../shared/content.schema.js'
import * as repo from './applications.repo.js'
import { applicationPatchSchema } from './applications.schema.js'
import { readCv } from './cv-storage.js'

export const applicationsRouter = Router()

/*
  Admin for the whole module, reading included — the same reasoning as
  enquiries: an application is a person's contact details and CV, sent to the
  company, not to everyone with a CMS login. It does not sit behind the
  enquiries password; that gate is specific to the sales inbox.
*/
applicationsRouter.use(requireAuth, requireRole('admin'))

applicationsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await repo.list(parseListParams(req)))
  }),
)

applicationsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await repo.get(requireParam(req, 'id'), true))
  }),
)

/**
 * The CV itself.
 *
 * Sent as an attachment with the cleaned original name, and with headers that
 * stop a browser rendering it inline on this origin: a crafted "PDF" should be
 * a download, never a page.
 */
applicationsRouter.get(
  '/:id/cv',
  asyncHandler(async (req, res) => {
    const cv = await repo.cvFor(requireParam(req, 'id'))
    const bytes = await readCv(cv.key)
    res.setHeader('Content-Type', cv.mime)
    res.setHeader('Content-Length', String(bytes.length))
    res.setHeader('Content-Disposition', `attachment; filename="${cv.filename.replace(/"/g, '')}"`)
    res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox")
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Cache-Control', 'private, no-store')
    res.end(bytes)
  }),
)

applicationsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await repo.update(requireParam(req, 'id'), applicationPatchSchema.parse(req.body)))
  }),
)

applicationsRouter.delete(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = deleteSchema.safeParse(req.body)
    if (!parsed.success) throw badRequest('Provide the ids to delete.')
    await repo.remove(parsed.data.ids)
    res.status(204).end()
  }),
)
