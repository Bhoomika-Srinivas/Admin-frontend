import { useState, useEffect } from 'react'
import { Bell, CheckCheck, BellOff } from 'lucide-react'
import { notificationService, type AppNotification } from '@/core-modules/notifications/api/notificationsApi'
import { useAuth } from '@/auth/AuthContext'
import { useNotifications } from '@/shared/context/NotificationContext'
import { format } from 'date-fns'
import clsx from 'clsx'

const typeStyles: Record<AppNotification['type'], { dot: string; bg: string }> = {
  approval: { dot: 'bg-emerald-500', bg: 'bg-emerald-50' },
  rejection: { dot: 'bg-red-500',     bg: 'bg-red-50' },
  conflict:  { dot: 'bg-amber-500',   bg: 'bg-amber-50' },
  update:    { dot: 'bg-blue-500',    bg: 'bg-blue-50' },
  info:      { dot: 'bg-slate-400',   bg: 'bg-slate-50' },
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const { refresh } = useNotifications()
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  function load() {
    setNotifications(notificationService.getForUser(user.id))
  }

  useEffect(() => { load() }, [user.id])

  function handleMarkRead(id: string) {
    notificationService.markRead(id)
    load()
    refresh()
  }

  function handleMarkAllRead() {
    notificationService.markAllRead(user.id)
    load()
    refresh()
  }

  const unread = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Notifications</h2>
          <p className="text-sm text-slate-500">
            {unread > 0 ? `${unread} unread notification${unread !== 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary text-xs gap-1.5">
            <CheckCheck size={14} />
            Mark all as read
          </button>
        )}
      </div>

      <div className="card divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <BellOff size={32} className="mb-3 opacity-40" />
            <p className="text-sm font-medium">No notifications yet</p>
          </div>
        ) : (
          notifications.map(n => {
            const styles = typeStyles[n.type]
            return (
              <div
                key={n.id}
                className={clsx(
                  'flex items-start gap-4 px-5 py-4 transition-colors',
                  !n.read && styles.bg
                )}
              >
                <div className="relative mt-1 flex-shrink-0">
                  <Bell size={18} className="text-slate-400" />
                  <span className={clsx('absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white', styles.dot)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={clsx('text-sm font-medium', !n.read ? 'text-slate-800' : 'text-slate-600')}>
                    {n.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1.5">
                    {format(new Date(n.timestamp), 'MMM d, yyyy · h:mm a')}
                  </p>
                </div>
                {!n.read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="flex-shrink-0 text-xs text-brand-600 hover:text-brand-700 font-medium mt-1"
                  >
                    Mark read
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
