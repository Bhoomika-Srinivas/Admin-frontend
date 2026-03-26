export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: string
  module: string
  details?: string
  timestamp: string
}

const logs: AuditLog[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Dr. Rajesh Kumar',
    action: 'Event Approved',
    module: 'Events',
    details: '"Synergy 2024 - Annual Technical Fest"',
    timestamp: '2024-03-09T10:15:00Z',
  },
  {
    id: '2',
    userId: '2',
    userName: 'Prof. Anita Sharma',
    action: 'Department Updated',
    module: 'Departments',
    details: 'Computer Science & Engineering',
    timestamp: '2024-03-09T09:45:00Z',
  },
  {
    id: '3',
    userId: '2',
    userName: 'Prof. Anita Sharma',
    action: 'Faculty Added',
    module: 'Faculty',
    details: '"Dr. Anitha Rao"',
    timestamp: '2024-03-08T16:30:00Z',
  },
  {
    id: '4',
    userId: '1',
    userName: 'Dr. Rajesh Kumar',
    action: 'User Created',
    module: 'Users',
    details: '"Prof. Anita Sharma"',
    timestamp: '2024-03-07T11:00:00Z',
  },
  {
    id: '5',
    userId: '1',
    userName: 'Dr. Rajesh Kumar',
    action: 'News Published',
    module: 'News',
    details: '"BIET Ranked Among Top Engineering Colleges in Karnataka"',
    timestamp: '2024-03-07T08:20:00Z',
  },
  {
    id: '6',
    userId: '2',
    userName: 'Prof. Anita Sharma',
    action: 'Event Created',
    module: 'Events',
    details: '"Industry Expert Workshop on Cloud Computing"',
    timestamp: '2024-03-06T14:55:00Z',
  },
]

let nextId = 200

export const auditService = {
  getLogs(): AuditLog[] {
    return [...logs].reverse()
  },

  log(
    userId: string,
    userName: string,
    action: string,
    module: string,
    details?: string,
  ): AuditLog {
    const entry: AuditLog = {
      id: String(++nextId),
      userId,
      userName,
      action,
      module,
      details,
      timestamp: new Date().toISOString(),
    }
    logs.push(entry)
    return entry
  },
}
