import { contentRouter } from '../shared/router.js'
import * as repo from './case_studies.repo.js'
import { caseStudyPatchSchema, caseStudySchema } from './case_studies.schema.js'

export const caseStudiesRouter = contentRouter(repo, {
  create: caseStudySchema,
  patch: caseStudyPatchSchema,
})
