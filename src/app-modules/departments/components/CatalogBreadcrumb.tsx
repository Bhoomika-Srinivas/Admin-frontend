import { useNavigate } from 'react-router-dom'
import { ChevronRight, LayoutGrid } from 'lucide-react'

interface Crumb {
  label: string
  to?: string
}

export default function CatalogBreadcrumb({ items }: { items: Crumb[] }) {
  const navigate = useNavigate()
  return (
    <nav className="flex items-center gap-1 text-sm flex-wrap">
      <button
        onClick={() => navigate('/academics/catalog')}
        className="flex items-center gap-1.5 text-slate-500 hover:text-brand-600 transition-colors"
      >
        <LayoutGrid size={13} />
        <span>Programs</span>
      </button>
      {items.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight size={13} className="text-slate-300" />
          {crumb.to ? (
            <button
              onClick={() => navigate(crumb.to!)}
              className="text-slate-500 hover:text-brand-600 transition-colors"
            >
              {crumb.label}
            </button>
          ) : (
            <span className="text-slate-700 font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
