import { query, queryOne, type Row } from '../../db/pool.js'
import { buildFilters, resolveSort, type ListParams } from '../../http/listParams.js'

export interface ListQuery {
  /** `FROM <table> <alias>` plus any joins the select needs. */
  from: string
  select: string
  sortable: Record<string, string>
  filterable: Record<string, string>
  /** Columns the search box matches with LIKE. */
  searchColumns: string[]
  fallbackSort: { column: string; dir: 'asc' | 'desc' }
  /** A fixed condition from the caller, never from the query string. */
  where?: { sql: string; params: unknown[] }
}

/**
 * One page of rows plus the total, for the CMS list contract.
 *
 * Every content list is the same four steps — whitelisted filters, a LIKE
 * search, a whitelisted sort, a page — and writing them out per module is how
 * one of them ends up interpolating a sort column the others whitelist.
 */
export async function listRows(
  params: ListParams,
  spec: ListQuery,
): Promise<{ rows: Row[]; total: number }> {
  const { sql: filterSql, params: filterParams } = buildFilters(params.filters, spec.filterable)
  const { column, dir } = resolveSort(params.sort, spec.sortable, spec.fallbackSort)

  const searchSql = params.search
    ? ` AND (${spec.searchColumns.map((c) => `${c} LIKE ?`).join(' OR ')})`
    : ''
  const like = `%${params.search ?? ''}%`
  const searchParams = params.search ? spec.searchColumns.map(() => like) : []

  const fixedSql = spec.where ? ` AND ${spec.where.sql}` : ''
  const fixedParams = spec.where?.params ?? []

  const where = `WHERE 1=1${fixedSql}${filterSql}${searchSql}`
  const whereParams = [...fixedParams, ...filterParams, ...searchParams]

  const totalRow = await queryOne<{ total: number }>(
    `SELECT COUNT(*) AS total ${spec.from} ${where}`,
    whereParams,
  )

  const offset = (params.page - 1) * params.pageSize
  const rows = await query<Row>(
    `SELECT ${spec.select} ${spec.from} ${where} ORDER BY ${column} ${dir} LIMIT ? OFFSET ?`,
    [...whereParams, params.pageSize, offset],
  )

  return { rows, total: Number(totalRow?.total ?? 0) }
}

export const placeholders = (values: readonly unknown[]) => values.map(() => '?').join(',')
