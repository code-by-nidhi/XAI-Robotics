import { contentRouter } from '../shared/router.js'
import * as repo from './blogs.repo.js'
import { blogPatchSchema, blogSchema } from './blogs.schema.js'

// The signed-in user becomes the author when the form names none.
export const blogsRouter = contentRouter(repo, { create: blogSchema, patch: blogPatchSchema })
