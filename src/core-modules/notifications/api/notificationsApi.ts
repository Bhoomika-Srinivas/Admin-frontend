export interface AppNotification {
  id: string
  userId: string
  title: string
  message: string
  type: 'approval' | 'rejection' | 'conflict' | 'update' | 'info'
  read: boolean
  timestamp: string
}

let notifications: AppNotification[] = [
  {
    id: '1',
    userId: '2',
    title: 'Event Approved',
    message: 'Your event "IEEE Student Chapter Workshop" has been approved by the admin.',
    type: 'approval',
    read: false,
    timestamp: '2024-03-09T10:20:00Z',
  },
  {
    id: '2',
    userId: '2',
    title: 'System Maintenance Scheduled',
    message: 'The admin portal will undergo scheduled maintenance on March 15, 2024 from 2:00 AM to 4:00 AM.',
    type: 'info',
    read: false,
    timestamp: '2024-03-08T08:00:00Z',
  },
  {
    id: '3',
    userId: '2',
    title: 'Department Profile Updated',
    message: 'The CSE department profile has been successfully updated with the latest faculty count.',
    type: 'update',
    read: false,
    timestamp: '2024-03-07T15:30:00Z',
  },
]

let nextId = 10

export const notificationService = {
  getForUser(userId: string): AppNotification[] {
    return notifications.filter(n => n.userId === userId).reverse()
  },

  getUnreadCount(userId: string): number {
    return notifications.filter(n => n.userId === userId && !n.read).length
  },

  add(n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): AppNotification {
    const notification: AppNotification = {
      ...n,
      id: String(++nextId),
      read: false,
      timestamp: new Date().toISOString(),
    }
    notifications.push(notification)
    return notification
  },

  markRead(id: string): void {
    const notification = notifications.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  },

  markAllRead(userId: string): void {
    notifications.forEach(n => {
      if (n.userId === userId) {
        n.read = true
      }
    })
  },
}
