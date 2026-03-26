import {
  Users, BookOpen, Building2, Award, ClipboardList,
  Newspaper, Calendar, Briefcase, Activity
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StatCard from '@/shared/components/cards/StatCard'
import {
  mockStats, recentActivities, mockEvents, mockNews,
  mockFaculty, mockDepartments, mockAlumni, mockPlacements
} from '@/data/mockData'
import { useAuth } from '@/auth/AuthContext'
import { isSuperAdmin } from '@/shared/utils/permissions'

const activityIcons: Record<string, string> = {
  news: '📰', department: '🏢', event: '📅', user: '👤', placement: '💼', gallery: '🖼️'
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const firstName = user.name.split(' ').slice(-1)[0]
  const subtitle = isSuperAdmin(user)
    ? "Here's what's happening at BIET today."
    : `Viewing data for the ${user.department} department.`

  const statCards = [
    {
      title: 'Total Students',
      value: mockStats.totalStudents,
      icon: Users, color: 'blue' as const,
      change: 4.2, changeLabel: 'vs last year',
      path: '/admissions/students',
    },
    {
      title: 'Total Faculty',
      value: mockFaculty.length,
      icon: BookOpen, color: 'green' as const,
      change: 2.1, changeLabel: 'vs last year',
      path: '/academics/faculty',
    },
    {
      title: 'Departments',
      value: mockDepartments.filter(d => d.status === 'active').length,
      icon: Building2, color: 'purple' as const,
      path: '/departments',
    },
    {
      title: 'Alumni',
      value: mockAlumni.length,
      icon: Award, color: 'amber' as const,
      change: 6.8, changeLabel: 'vs last year',
      path: '/alumni',
    },
    {
      title: 'Pending Admissions',
      value: mockStats.pendingAdmissions,
      icon: ClipboardList, color: 'rose' as const,
      path: '/admissions/applications',
    },
    {
      title: 'Total News',
      value: mockNews.length,
      icon: Newspaper, color: 'cyan' as const,
      path: '/news',
    },
    {
      title: 'Total Events',
      value: mockEvents.length,
      icon: Calendar, color: 'amber' as const,
      path: '/events',
    },
    {
      title: 'Total Placements',
      value: mockPlacements.length,
      icon: Briefcase, color: 'green' as const,
      change: 12.4, changeLabel: 'vs last year',
      path: '/placements',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-bold text-slate-800">Welcome back, {firstName} 👋</h2>
        <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div
            key={s.title}
            onClick={() => navigate(s.path)}
            className="cursor-pointer rounded-xl transition-transform hover:-translate-y-0.5 hover:shadow-md"
          >
            <StatCard
              title={s.title}
              value={s.value}
              icon={s.icon}
              color={s.color}
              change={s.change}
              changeLabel={s.changeLabel}
            />
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="card lg:col-span-1">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Activity size={16} className="text-brand-600" />
            <h3 className="font-semibold text-slate-800 text-sm">Recent Activity</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {recentActivities.map(a => (
              <div key={a.id} className="px-5 py-3 flex gap-3">
                <span className="text-lg leading-none mt-0.5">{activityIcons[a.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 font-medium leading-snug">{a.action}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{a.user} · {a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card lg:col-span-1">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Calendar size={16} className="text-brand-600" />
            <h3 className="font-semibold text-slate-800 text-sm">Upcoming Events</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {mockEvents.slice(0, 5).map(event => (
              <div key={event.id} className="px-5 py-3">
                <p className="text-xs font-medium text-slate-700 leading-snug">{event.title}</p>
                <p className="text-xs text-slate-400 mt-1">
                  📅 {event.date} · 📍 {event.venue}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Latest News */}
        <div className="card lg:col-span-1">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Newspaper size={16} className="text-brand-600" />
            <h3 className="font-semibold text-slate-800 text-sm">Latest News</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {mockNews.slice(0, 5).map(news => (
              <div key={news.id} className="px-5 py-3">
                <p className="text-xs font-medium text-slate-700 leading-snug line-clamp-2">{news.title}</p>
                <p className="text-xs text-slate-400 mt-1">{news.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
