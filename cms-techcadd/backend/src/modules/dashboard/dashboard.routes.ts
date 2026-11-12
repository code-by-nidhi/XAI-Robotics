import { Router, type Request } from 'express'

import { asyncHandler } from '../../http/errors.js'
import { requireAuth } from '../../middleware/auth.js'
import { ENQUIRIES_LOCK_COOKIE } from '../enquiries/enquiries-lock.js'
import * as dashboard from './dashboard.repo.js'
import * as searchRepo from './search.repo.js'

/**
 * Whether this request may see lead data: the same two gates as /api/enquiries
 * — an admin account, and the enquiries password cleared in this browser.
 */
const canSeeLeads = (req: Request) =>
  req.user?.role === 'admin' && req.signedCookies?.[ENQUIRIES_LOCK_COOKIE] === '1'

export const dashboardRouter = Router()

dashboardRouter.use(requireAuth)

dashboardRouter.get(
  '/summary',
  asyncHandler(async (req, res) => {
    res.json(await dashboard.summary(canSeeLeads(req)))
  }),
)

export const searchRouter = Router()

searchRouter.use(requireAuth)

searchRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const term = String(req.query.q ?? '').trim()

    // Two characters is the shortest that narrows anything; a single letter
    // would scan every table to return noise.
    if (term.length < 2) {
      res.json({ groups: [] })
      return
    }

    res.json({ groups: await searchRepo.search(term.slice(0, 100), canSeeLeads(req)) })
  }),
)
