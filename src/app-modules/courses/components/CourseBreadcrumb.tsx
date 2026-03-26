import { ChevronRight, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export interface BreadcrumbItem {
  label: string
  to?: string
}

export default function CourseBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const navigate = useNavigate()

  return (
    <nav className="flex items-center flex-wrap gap-1 text-sm mb-1">
      <button
        onClick={() => navigate('/academics/courses')}
        className="flex items-center gap-1 text-slate-400 hover:text-brand-600 transition-colors"
      >
        <Home size={12} />
        <span>Courses</span>
      </button>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight size={13} className="text-slate-300" />
          {item.to ? (
            <button
              onClick={() => navigate(item.to!)}
              className="text-slate-500 hover:text-brand-600 transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-slate-800 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
