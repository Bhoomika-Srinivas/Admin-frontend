import type { Committee, User } from '@/shared/types/models'
import { auditService } from '@/core-modules/audit/api/auditApi'

const initialCommittees: Committee[] = [
  {
    id: '1',
    name: 'Academic Council',
    type: 'academic',
    chairperson: 'Dr. Rajesh Kumar',
    members: ['Prof. Anita', 'Dr. Prakash'],
    status: 'active',
    description: 'Oversees all academic matters.',
    createdAt: '2020-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Anti-Ragging Committee',
    type: 'administrative',
    chairperson: 'Dr. Latha Murthy',
    members: ['Prof. Kiran', 'Suresh Patil'],
    status: 'active',
    description: 'Monitors and prevents ragging activities.',
    createdAt: '2020-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Student Welfare Committee',
    type: 'student',
    chairperson: 'Prof. Uma Devi',
    members: ['Dr. Rakesh', 'Meena Desai'],
    status: 'active',
    description: 'Looks after student welfare and grievances.',
    createdAt: '2020-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Research & Innovation Cell',
    type: 'research',
    chairperson: 'Dr. Deepak Raj',
    members: ['Dr. Anitha Rao', 'Prof. Kiran'],
    status: 'active',
    description: 'Promotes research and innovation among students and faculty.',
    createdAt: '2021-01-01T00:00:00Z',
  },
  {
    id: '5',
    name: 'IQAC',
    type: 'academic',
    chairperson: 'Dr. Rajesh Kumar',
    members: ['Dr. Nagaraj', 'Prof. Suma'],
    status: 'active',
    description: 'Internal Quality Assurance Cell.',
    createdAt: '2020-01-01T00:00:00Z',
  },
]

const committees: Committee[] = [...initialCommittees]
let nextId = 100

export const committeeService = {
  getAll(): Committee[] {
    return [...committees]
  },

  getById(id: string): Committee | undefined {
    return committees.find(c => c.id === id)
  },

  create(data: Omit<Committee, 'id' | 'createdAt'>, actor: User): Committee {
    const newCommittee: Committee = {
      ...data,
      id: String(++nextId),
      createdAt: new Date().toISOString(),
    }
    committees.push(newCommittee)
    auditService.log(actor.id, actor.name, 'Committee Created', 'Committees', `"${newCommittee.name}"`)
    return newCommittee
  },

  update(id: string, data: Partial<Committee>, actor: User): Committee | null {
    const index = committees.findIndex(c => c.id === id)
    if (index === -1) return null

    const updated: Committee = { ...committees[index], ...data }
    committees[index] = updated
    auditService.log(actor.id, actor.name, 'Committee Updated', 'Committees', `"${updated.name}"`)
    return updated
  },

  delete(id: string, actor: User): boolean {
    const index = committees.findIndex(c => c.id === id)
    if (index === -1) return false
    const [removed] = committees.splice(index, 1)
    auditService.log(actor.id, actor.name, 'Committee Deleted', 'Committees', `"${removed.name}"`)
    return true
  },
}
