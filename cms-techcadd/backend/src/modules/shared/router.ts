import { Router } from 'express'
import type { ZodType } from 'zod'

import { asyncHandler, badRequest, unauthorised } from '../../http/errors.js'
import { parseListParams, type ListParams, type ListResult } from '../../http/listParams.js'
import { requireParam } from '../../http/params.js'
import { requireAuth, requireRole } from '../../middleware/auth.js'
import type { UserRole } from '../auth/auth.service.js'
import { deleteSchema } from './content.schema.js'

export interface ContentRepo<C, P> {
  list(params: ListParams): Promise<ListResult<unknown>>
  get(id: string): Promise<unknown>
  create(input: C, signedInUserId: string): Promise<unknown>
  update(id: string, patch: P): Promise<unknown>
  remove(ids: string[]): Promise<void>
}

/**
 * The five endpoints of the CMS contract, for a content module.
 *
 * Every content type answers the same list / get / create / update / delete
 * with the same role gate, so the shape is built once: a module that wrote its
 * own would be one forgotten `requireRole` away from letting anyone signed in
 * delete it.
 */
export function contentRouter<C, P>(
  repo: ContentRepo<C, P>,
  schemas: { create: ZodType<C>; patch: ZodType<P> },
  writeRole: UserRole = 'editor',
): Router {
  const router = Router()

  router.use(requireAuth)

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      res.json(await repo.list(parseListParams(req)))
    }),
  )

  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      res.json(await repo.get(requireParam(req, 'id')))
    }),
  )

  router.post(
    '/',
    requireRole(writeRole),
    asyncHandler(async (req, res) => {
      if (!req.user) throw unauthorised()
      res.status(201).json(await repo.create(schemas.create.parse(req.body), req.user.userId))
    }),
  )

  router.patch(
    '/:id',
    requireRole(writeRole),
    asyncHandler(async (req, res) => {
      res.json(await repo.update(requireParam(req, 'id'), schemas.patch.parse(req.body)))
    }),
  )

  router.delete(
    '/',
    requireRole(writeRole),
    asyncHandler(async (req, res) => {
      const parsed = deleteSchema.safeParse(req.body)
      if (!parsed.success) throw badRequest('Provide the ids to delete.')
      await repo.remove(parsed.data.ids)
      res.status(204).end()
    }),
  )

  return router
}
