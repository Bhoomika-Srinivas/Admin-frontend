import { useState, useEffect } from 'react'
import { useParams, NavLink } from 'react-router-dom'
import {
  Users, GraduationCap, BookOpen, Microscope,
  Settings2, Building2, CalendarDays, ArrowRight, Activity,
} from 'lucide-react'

import { useDeptContext } from '@/app-modules/departments/context/DepartmentContext'
import { eventService } from '@/app-modules/events/api/eventsApi'
import { departmentActivityService } from '@/app-modules/departments/api/deptActivitiesApi'
import { facultyService } from '@/app-modules/faculty/api/facultyApi'
import { deptAboutService } from '@/app-modules/departments/api/deptAboutApi'
import type { DepartmentActivity, Event } from '@/shared/types/models'

export default function DeptDashboardPage() {
  const { deptId = '' } = useParams<{ deptId: string }>()
  const dept = useDeptContext()
  const b = `/departments/${deptId}`

  const [upcomingEvents, setUpcomingEvents]     = useState<Event[]>([])
  const [facultyCount, setFacultyCount]         = useState(0)
  const [recentActivities, setRecentActivities] = useState<DepartmentActivity[]>([])
  const [activityCount, setActivityCount]       = useState(0)
  const [deptLogo, setDeptLogo]                 = useState('')

  useEffect(() => {
    Promise.all([
      eventService.getAll({ department: dept.shortName, status: 'upcoming', approvalStatus: 'approved' }),
      eventService.getAll({ level: 'institutional',     status: 'upcoming', approvalStatus: 'approved' }),
    ]).then(([deptEvents, instEvents]) => {
      const seen = new Set<string>()
      const merged = [...deptEvents, ...instEvents].filter(e => {
        if (seen.has(e.id)) return false
        seen.add(e.id); return true
      })
      setUpcomingEvents(merged.slice(0, 5))
    }).catch(() => setUpcomingEvents([]))
  }, [dept.shortName])

  useEffect(() => {
    facultyService.getAll({ deptId })
      .then(all => setFacultyCount(all.length))
      .catch(() => setFacultyCount(0))
  }, [deptId])

  useEffect(() => {
    deptAboutService.getIntroduction(deptId)
      .then(intro => setDeptLogo(intro.logo ?? ''))
      .catch(() => setDeptLogo(''))
  }, [deptId])

  useEffect(() => {
    departmentActivityService.getAll(deptId).then(items => {
      setActivityCount(items.length)
      setRecentActivities(items.slice(-5).reverse())
    }).catch(() => { setRecentActivities([]); setActivityCount(0) })
  }, [deptId])

  const stats = [
    { icon: Users,         label: 'Faculty',        value: facultyCount,          color: 'bg-brand-500'   },
    { icon: GraduationCap, label: 'Students',        value: dept.totalStudents,    color: 'bg-emerald-500' },
    { icon: CalendarDays,  label: 'Upcoming Events', value: upcomingEvents.length, color: 'bg-amber-500'   },
    { icon: Activity,      label: 'Activities',      value: activityCount,         color: 'bg-violet-500'  },
  ]

  const quickLinks = [
    { to: `${b}/info/about`,        icon: Building2,    label: 'Department Info',    description: 'Vision, mission & SWOT',            color: 'bg-brand-600'   },
    { to: `${b}/people/faculty`,    icon: Users,        label: 'People',             description: 'Faculty, staff & accreditations',   color: 'bg-indigo-500'  },
    { to: `${b}/research/details`,  icon: Microscope,   label: 'Research',           description: 'Publications, grants & patents',    color: 'bg-violet-500'  },
    { to: `${b}/academics/courses`, icon: BookOpen,     label: 'Academics',          description: 'Courses, timetable & materials',    color: 'bg-emerald-500' },
    { to: `${b}/activities/events`, icon: CalendarDays, label: 'Student Activities', description: 'Events, placements & achievements', color: 'bg-amber-500'   },
    { to: `${b}/settings/branding`, icon: Settings2,    label: 'Settings',           description: 'Branding & layout',                 color: 'bg-slate-500'   },
  ]

  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {deptLogo ? (
            <img src={deptLogo} alt={dept.shortName} className="w-10 h-10 rounded-xl object-contain bg-slate-50 border border-slate-100 shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-display font-semibold text-sm text-slate-600 shrink-0">
              {dept.shortName.slice(0, 2)}
            </div>
          )}
          <div>
            <h2 className="text-base font-display font-semibold text-slate-800 leading-snug tracking-wide">{dept.name}</h2>
            <p className="text-slate-400 text-[11px] mt-0.5 tracking-wide">HOD: {dept.hod} &nbsp;·&nbsp; Est. {dept.established}</p>
          </div>
        </div>
        <span className="shrink-0 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold tracking-wide">
          {dept.shortName}
        </span>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="card flex items-center gap-3 py-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-display font-bold text-slate-800 leading-tight">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Access (left) + Upcoming Events (right) ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Quick Access */}
        <div className="lg:col-span-3">
          <p className="text-sm font-semibold text-slate-700 mb-3">Quick Access</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {quickLinks.map(link => (
              <NavLink key={link.to} to={link.to}
                className="card flex flex-col gap-3 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 group">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${link.color}`}>
                  <link.icon size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-700 transition-colors leading-tight">
                    {link.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug hidden sm:block">{link.description}</p>
                </div>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-700">Upcoming Events</p>
            <NavLink to={`${b}/activities/events`}
              className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 font-medium">
              View all <ArrowRight size={11} />
            </NavLink>
          </div>
          <div className="card p-0 overflow-hidden divide-y divide-slate-100">
            {upcomingEvents.length === 0 ? (
              <div className="py-10 flex flex-col items-center justify-center text-center px-4">
                <CalendarDays size={28} className="text-slate-200 mb-2" />
                <p className="text-xs text-slate-400">No upcoming events</p>
              </div>
            ) : upcomingEvents.map(event => (
              <div key={event.id} className="flex items-start gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold text-amber-500 uppercase leading-none">
                    {new Date(event.date).toLocaleDateString('en', { month: 'short' })}
                  </span>
                  <span className="text-base font-bold text-amber-700 leading-none">
                    {new Date(event.date).getDate()}
                  </span>
                </div>
                <div className="min-w-0 py-0.5">
                  <p className="text-sm font-medium text-slate-800 truncate leading-tight">{event.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{event.venue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Activity — full-width horizontal timeline ───────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700">Recent Activity</p>
          <NavLink to={`${b}/activities/activities`}
            className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 font-medium">
            View all <ArrowRight size={11} />
          </NavLink>
        </div>
        {recentActivities.length === 0 ? (
          <div className="card py-8 flex flex-col items-center justify-center text-center">
            <Activity size={28} className="text-slate-200 mb-2" />
            <p className="text-xs text-slate-400">No activities recorded yet</p>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="flex overflow-x-auto divide-x divide-slate-100" style={{ scrollbarWidth: 'none' }}>
              {recentActivities.map((item, i) => (
                <div key={item.id} className="flex-shrink-0 w-52 p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                      Activity {i + 1}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
