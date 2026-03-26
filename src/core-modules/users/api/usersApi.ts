import type { User } from '@/shared/types/models'
import { mockUsers } from '@/data/mockData'
import { auditService } from '@/core-modules/audit/api/auditApi'

const users: User[] = [...mockUsers]
let nextId = 100

export const userService = {
  getAll(): User[] {
    return [...users]
  },

  getById(id: string): User | undefined {
    return users.find(u => u.id === id)
  },

  create(data: Omit<User, 'id' | 'createdAt'>, actor: User): User {
    const newUser: User = {
      ...data,
      id: String(++nextId),
      createdAt: new Date().toISOString(),
    }
    users.push(newUser)
    auditService.log(actor.id, actor.name, 'User Created', 'Users', `"${newUser.name}"`)
    return newUser
  },

  update(id: string, data: Partial<User>, actor: User): User | null {
    const index = users.findIndex(u => u.id === id)
    if (index === -1) return null

    const updated: User = { ...users[index], ...data }
    users[index] = updated
    auditService.log(actor.id, actor.name, 'User Updated', 'Users', `"${updated.name}"`)
    return updated
  },

  delete(id: string, actor: User): boolean {
    const index = users.findIndex(u => u.id === id)
    if (index === -1) return false
    const [removed] = users.splice(index, 1)
    auditService.log(actor.id, actor.name, 'User Deleted', 'Users', `"${removed.name}"`)
    return true
  },
}
