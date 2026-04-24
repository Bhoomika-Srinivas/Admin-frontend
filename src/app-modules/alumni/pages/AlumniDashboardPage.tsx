import { useMemo } from 'react'
import {
  Calendar,
  Users,
  Clock,
  Star,
} from 'lucide-react'
import { useAlumniEvents, useCommittee, useCoordinators } from '../hooks/useAlumni'
import { Link } from 'react-router-dom'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  color: 'blue' | 'green' | 'amber' | 'purple' | 'rose'
  to: string
}

function StatCard({ title, value, icon: Icon, color, to }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
  }

  return (
    <Link to={to} className="card p-5 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-2xl font-display font-bold text-slate-800 mt-1">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${colorClasses[color]} group-hover:scale-105 transition-transform`}>
          <Icon size={20} />
        </div>
      </div>
    </Link>
  )
}

export default function AlumniDashboardPage() {
  const { events, loading: eventsLoading } = useAlumniEvents()
  const { members, loading: committeeLoading } = useCommittee()
  const { coordinators, loading: coordinatorsLoading } = useCoordinators()

  const stats = useMemo(() => {
    const upcomingEvents = events.filter(e => {
      const eventDate = new Date(e.date)
      return eventDate >= new Date() && e.status === 'published'
    }).length

    return [
      { title: 'Total Events', value: events.length, icon: Calendar, color: 'blue' as const, to: '/alumni/events' },
      { title: 'Upcoming Events', value: upcomingEvents, icon: Clock, color: 'amber' as const, to: '/alumni/events' },
      { title: 'Committee Members', value: members.length, icon: Users, color: 'purple' as const, to: '/alumni/committee' },
      { title: 'Coordinators', value: coordinators.length, icon: Users, color: 'rose' as const, to: '/alumni/coordinators' },
    ]
  }, [events, members, coordinators])

  const loading = eventsLoading || committeeLoading || coordinatorsLoading

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card p-8 text-center text-slate-400">Loading…</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-800">Alumni Management</h1>
        <p className="text-sm text-slate-500 mt-1">Manage alumni events, distinguished alumni, committee, and communications.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map(stat => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link to="/alumni/events" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Manage Events</p>
                <p className="text-xs text-slate-500">Create and manage alumni events</p>
              </div>
            </Link>
            <Link to="/alumni/distinguished" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Star size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Distinguished Alumni</p>
                <p className="text-xs text-slate-500">Add notable alumni from each department</p>
              </div>
            </Link>
            <Link to="/alumni/committee" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <Users size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Executive Committee</p>
                <p className="text-xs text-slate-500">Manage committee members</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {events.slice(0, 3).map(event => (
              <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-lg">🎓</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{event.title}</p>
                  <p className="text-xs text-slate-500">{event.date} • {event.department}</p>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-sm text-slate-400 italic">No events yet. <Link to="/alumni/events" className="text-brand-600">Add your first event</Link>.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
