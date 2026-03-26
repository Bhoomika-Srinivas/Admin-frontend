import type { News, User } from '@/shared/types/models'
import { mockNews } from '@/data/mockData'
import { auditService } from '@/core-modules/audit/api/auditApi'

let newsItems: News[] = mockNews.map(n => ({ ...n }))
let nextId = 100

function sorted(list: News[]): News[] {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return b.date.localeCompare(a.date)
  })
}

export const newsService = {
  getAll(): News[] {
    return sorted(newsItems)
  },

  getById(id: string): News | undefined {
    return newsItems.find(n => n.id === id)
  },

  create(data: Omit<News, 'id' | 'createdAt'>, actor: User): News {
    const item: News = { ...data, id: String(++nextId), createdAt: new Date().toISOString() }
    newsItems.push(item)
    auditService.log(actor.id, actor.name, 'News Created', 'News', `"${item.title}"`)
    return item
  },

  update(id: string, data: Partial<News>, actor: User): News | null {
    const idx = newsItems.findIndex(n => n.id === id)
    if (idx === -1) return null
    newsItems[idx] = { ...newsItems[idx], ...data }
    auditService.log(actor.id, actor.name, 'News Updated', 'News', `"${newsItems[idx].title}"`)
    return newsItems[idx]
  },

  delete(id: string, actor: User): boolean {
    const idx = newsItems.findIndex(n => n.id === id)
    if (idx === -1) return false
    const [removed] = newsItems.splice(idx, 1)
    auditService.log(actor.id, actor.name, 'News Deleted', 'News', `"${removed.title}"`)
    return true
  },

  togglePin(id: string, actor: User): News | null {
    const idx = newsItems.findIndex(n => n.id === id)
    if (idx === -1) return null
    newsItems[idx] = { ...newsItems[idx], pinned: !newsItems[idx].pinned }
    auditService.log(actor.id, actor.name, newsItems[idx].pinned ? 'News Pinned' : 'News Unpinned', 'News', `"${newsItems[idx].title}"`)
    return newsItems[idx]
  },
}
