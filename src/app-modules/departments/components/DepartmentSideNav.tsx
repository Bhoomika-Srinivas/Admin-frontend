import { useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { ChevronDown, ChevronRight, Building2, Users, BookOpen, GraduationCap, Microscope, Settings2, LayoutDashboard, ShieldCheck } from 'lucide-react'
import clsx from 'clsx'

type NavLeaf = { label: string; path: string }
type NavGroup = { label: string; icon: React.ReactNode; items: NavLeaf[] }

function buildGroups(deptId: string): NavGroup[] {
  const b = `/departments/${deptId}`
  return [
    {
      label: 'Department Info', icon: <Building2 size={15} />,
      items: [
        { label: 'Introduction',         path: `${b}/info/introduction` },
        { label: 'About',                path: `${b}/info/about` },
        { label: 'HOD Profile',          path: `${b}/info/hod` },
        { label: 'Distinguished Alumni', path: `${b}/info/alumni` },
      ],
    },
    {
      label: 'People', icon: <Users size={15} />,
      items: [
        { label: 'Faculty',          path: `${b}/people/faculty` },
        { label: 'Staff',            path: `${b}/people/staff` },
        { label: 'Accreditations',   path: `${b}/people/accreditations` },
      ],
    },
    {
      label: 'Research', icon: <Microscope size={15} />,
      items: [
        { label: 'Faculty Research', path: `${b}/research/details` },
        { label: 'PhD Guides',       path: `${b}/research/phd` },
        { label: 'Publications',     path: `${b}/research/publications` },
        { label: 'Grants',           path: `${b}/research/grants` },
        { label: 'Patents',          path: `${b}/research/patents` },
      ],
    },
    {
      label: 'Academics', icon: <BookOpen size={15} />,
      items: [
        { label: 'Courses',              path: `${b}/academics/courses` },
        { label: 'Timetable',            path: `${b}/academics/timetable` },
        { label: 'Learning Materials',   path: `${b}/academics/materials` },
        { label: 'Innovative Teaching',  path: `${b}/academics/teaching` },
        { label: 'Result Analysis',      path: `${b}/academics/results` },
      ],
    },
    {
      label: 'Students & Activities', icon: <GraduationCap size={15} />,
      items: [
        { label: 'Events',        path: `${b}/activities/events` },
        { label: 'Placements',    path: `${b}/activities/placements` },
        { label: 'Achievements',  path: `${b}/activities/achievements` },
        { label: 'Activities',    path: `${b}/activities/activities` },
        { label: 'Newsletter',    path: `${b}/activities/newsletter` },
        { label: 'Photo Gallery', path: `${b}/activities/gallery` },
      ],
    },
    {
      label: 'Settings', icon: <Settings2 size={15} />,
      items: [
        { label: 'Branding & Layout', path: `${b}/settings/branding` },
      ],
    },
  ]
}

function NavSection({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="text-slate-400">{group.icon}</span>
          {group.label}
        </span>
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>
      {open && (
        <ul className="mb-1">
          {group.items.map(item => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    'block pl-8 pr-3 py-1.5 text-sm rounded-lg transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800',
                  )
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function DepartmentSideNav() {
  const { deptId } = useParams<{ deptId: string }>()
  if (!deptId) return null
  const groups = buildGroups(deptId)
  return (
    <nav className="space-y-1">
      {/* Dashboard link */}
      <NavLink
        to={`/departments/${deptId}`}
        end
        className={({ isActive }) =>
          clsx(
            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors mb-1',
            isActive
              ? 'bg-brand-50 text-brand-700 font-semibold'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800',
          )
        }
      >
        <LayoutDashboard size={15} className="shrink-0" />
        Dashboard
      </NavLink>
      {groups.map(g => <NavSection key={g.label} group={g} />)}

      {/* Audit Logs */}
      <NavLink
        to={`/departments/${deptId}/audit-logs`}
        className={({ isActive }) =>
          clsx(
            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors mt-1',
            isActive
              ? 'bg-brand-50 text-brand-700 font-semibold'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800',
          )
        }
      >
        <ShieldCheck size={15} className="shrink-0" />
        Audit Logs
      </NavLink>
    </nav>
  )
}
