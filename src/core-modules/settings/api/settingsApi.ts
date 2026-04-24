import { gqlRequest } from '@/api/graphqlClient'
import type { SystemSetting } from '../types'
import { LIST_SETTINGS } from '../graphql/settings.query'
import { UPDATE_SETTINGS_BULK, UPDATE_SETTING } from '../graphql/settings.mutation'

interface GqlSetting {
  key: string
  value: string
  category: 'security' | 'operational'
  sensitivity: 'high' | 'low'
  updated_by?: string
  updated_at?: string
}

function mapSetting(raw: GqlSetting): SystemSetting {
  return {
    key:         raw.key,
    value:       raw.value,
    category:    raw.category,
    sensitivity: raw.sensitivity,
    updatedBy:   raw.updated_by,
    updatedAt:   raw.updated_at,
  }
}

export const settingsService = {
  async getAll(): Promise<SystemSetting[]> {
    const data = await gqlRequest<{ listSettings: GqlSetting[] }>(LIST_SETTINGS)
    return (data.listSettings ?? []).map(mapSetting)
  },

  async getByCategory(category: 'security' | 'operational'): Promise<SystemSetting[]> {
    const data = await gqlRequest<{ listSettings: GqlSetting[] }>(LIST_SETTINGS, { category })
    return (data.listSettings ?? []).map(mapSetting)
  },

  async update(key: string, value: string): Promise<void> {
    await gqlRequest(UPDATE_SETTING, { key, value })
  },

  async updateBulk(settings: Record<string, string>): Promise<void> {
    await gqlRequest(UPDATE_SETTINGS_BULK, { settings: JSON.stringify(settings) })
  },
}
