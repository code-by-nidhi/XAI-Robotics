import { Router } from 'express'

import { asyncHandler } from '../../http/errors.js'
import { requireAuth } from '../../middleware/auth.js'
import * as repo from './analytics.repo.js'

export const analyticsRouter = Router()

/*
  Every signed-in user. These are aggregate counts — page views, enquiries per
  day, which article is read most — with no visitor or lead in them, and the
  person who wrote an article is the one most likely to ask how it is doing.
*/
analyticsRouter.use(requireAuth)

/** Views over time, top pages, enquiries by service, publishing. ?range=7|30|90 */
analyticsRouter.get(
  '/overview',
  asyncHandler(async (req, res) => {
    res.json(await repo.overview(req.query.range))
  }),
)

/** Per-item views. ?range=7|30|90&type=blog|case_study&sort=range|total|published|title */
analyticsRouter.get(
  '/content',
  asyncHandler(async (req, res) => {
    res.json(
      await repo.contentPerformance({ range: req.query.range, type: req.query.type, sort: req.query.sort }),
    )
  }),
)
