import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { blogsApi, redirectsApi } from '../../api'
import { settingsApi } from '../../api/resources/settings'
import type { SiteSettingsPatch } from '../../types'
import { createResourceHooks } from '../shared/createResourceHooks'

export const redirectHooks = createResourceHooks('redirects', redirectsApi)

export function useSettings() {
  return useQuery({ queryKey: ['settings'], queryFn: () => settingsApi.get() })
}

export function useUpdateSettings() {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (patch: SiteSettingsPatch) => settingsApi.update(patch),
    onSuccess: (next) => client.setQueryData(['settings'], next),
  })
}

export interface SitemapEntry {
  path: string
  type: 'Blog'
  updatedAt: string
}

/**
 * The sitemap is derived from published content rather than stored, so it can
 * never drift out of step with what is actually live.
 */
export function useSitemap() {
  return useQuery({
    queryKey: ['seo', 'sitemap'],
    queryFn: async (): Promise<SitemapEntry[]> => {
      const params = { page: 1, pageSize: 500, filters: { status: 'published' } }

      const blogs = await blogsApi.list(params)

      // Site pages and service pages are fixed in the website's code now, so
      // the CMS has no record of them to list.
      return blogs.items
        .map((b) => ({
          path: `/blog/${b.slug}`,
          type: 'Blog' as const,
          updatedAt: b.updatedAt,
        }))
        .sort((a, b) => a.path.localeCompare(b.path))
    },
  })
}
