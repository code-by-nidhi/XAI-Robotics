import { contentRouter } from '../shared/router.js'
import * as repo from './portfolio.repo.js'
import { portfolioPatchSchema, portfolioSchema } from './portfolio.schema.js'

export const portfolioRouter = contentRouter(repo, {
  create: portfolioSchema,
  patch: portfolioPatchSchema,
})
