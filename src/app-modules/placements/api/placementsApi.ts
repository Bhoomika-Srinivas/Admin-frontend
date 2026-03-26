import type { Placement, User } from '@/shared/types/models'
import { mockPlacements } from '@/data/mockData'
import { auditService } from '@/core-modules/audit/api/auditApi'

const placements: Placement[] = [...mockPlacements]
let nextId = 100

export const placementService = {
  getAll(): Placement[] {
    return [...placements]
  },

  getById(id: string): Placement | undefined {
    return placements.find(p => p.id === id)
  },

  create(data: Omit<Placement, 'id' | 'createdAt'>, actor: User): Placement {
    const newPlacement: Placement = {
      ...data,
      id: String(++nextId),
      createdAt: new Date().toISOString(),
    }
    placements.push(newPlacement)
    auditService.log(actor.id, actor.name, 'Placement Created', 'Placements', `"${newPlacement.company}"`)
    return newPlacement
  },

  update(id: string, data: Partial<Placement>, actor: User): Placement | null {
    const index = placements.findIndex(p => p.id === id)
    if (index === -1) return null

    const updated: Placement = { ...placements[index], ...data }
    placements[index] = updated
    auditService.log(actor.id, actor.name, 'Placement Updated', 'Placements', `"${updated.company}"`)
    return updated
  },

  delete(id: string, actor: User): boolean {
    const index = placements.findIndex(p => p.id === id)
    if (index === -1) return false
    const [removed] = placements.splice(index, 1)
    auditService.log(actor.id, actor.name, 'Placement Deleted', 'Placements', `"${removed.company}"`)
    return true
  },
}
