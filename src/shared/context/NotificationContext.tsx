import { createContext, useContext, useState, useEffect } from 'react'
import { notificationService } from '@/core-modules/notifications/api/notificationsApi'

interface NotificationContextValue {
  unreadCount: number
  refresh: () => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function NotificationProvider({
  children,
  userId,
}: {
  children: React.ReactNode
  userId: string
}) {
  const [unreadCount, setUnreadCount] = useState<number>(0)

  const refresh = () => {
    setUnreadCount(notificationService.getUnreadCount(userId))
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return (
    <NotificationContext.Provider value={{ unreadCount, refresh }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationProvider>')
  return ctx
}
