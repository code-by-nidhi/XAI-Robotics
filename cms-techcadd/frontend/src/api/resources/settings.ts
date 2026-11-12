import type { SiteSettings, SiteSettingsPatch } from '../../types'
import { request } from '../client'

/**
 * Settings is a singleton, not a collection, so it does not use the generic
 * `Resource` contract — there is nothing to list, create or delete.
 */
export const settingsApi = {
  get(): Promise<SiteSettings> {
    return request<SiteSettings>('/settings')
  },

  /**
   * Only the groups sent are written, and each is merged over what is stored —
   * every card on the settings page saves its own group.
   */
  update(patch: SiteSettingsPatch): Promise<SiteSettings> {
    return request<SiteSettings>('/settings', { method: 'PATCH', body: patch })
  },
}
