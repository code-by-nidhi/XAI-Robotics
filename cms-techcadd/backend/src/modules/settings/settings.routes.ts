import { Router } from 'express'

import { asyncHandler, unauthorised } from '../../http/errors.js'
import { requireAuth, requireRole } from '../../middleware/auth.js'
import * as repo from './settings.repo.js'
import { settingsPatchSchema } from './settings.schema.js'

export const settingsRouter = Router()

settingsRouter.use(requireAuth)

/** A singleton, so there is no id in the path and no list endpoint. */
settingsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    if (!req.user) throw unauthorised()
    res.json(await repo.get({ name: req.user.name, email: req.user.email }))
  }),
)

settingsRouter.patch(
  '/',
  // Site-wide settings, including whether search engines may index the site
  // and where lead alerts go — not an editor's to change.
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    if (!req.user) throw unauthorised()
    const patch = settingsPatchSchema.parse(req.body)
    res.json(await repo.update(patch, { name: req.user.name, email: req.user.email }))
  }),
)
