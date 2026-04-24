import { FileText, Edit2, Trash2, ExternalLink } from 'lucide-react'
import type { AcademicCalendar } from '@/shared/types/models'
import clsx from 'clsx'

interface CalendarCardProps {
  item: AcademicCalendar
  onEdit: () => void
  onDelete: () => void
}

const TYPE_CLS: Record<AcademicCalendar['type'], string> = {
  CURRENT:  'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  HISTORIC: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
}

const AUTHORITY_CLS: Record<AcademicCalendar['authority'], string> = {
  VTU:       'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
  INSTITUTE: 'bg-brand-50 text-brand-700 ring-1 ring-brand-200',
}

const PROGRAM_CLS: Record<AcademicCalendar['program'], string> = {
  UG: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  PG: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
}

export default function CalendarCard({ item, onEdit, onDelete }: CalendarCardProps) {
  return (
    <div className="card p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Icon + action buttons */}
      <div className="flex items-start justify-between gap-2">
        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
          <FileText size={16} className="text-brand-600" />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Title + description */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 leading-snug">{item.title}</p>
        {item.description && (
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', TYPE_CLS[item.type])}>
          {item.type === 'CURRENT' ? 'Current' : 'Historic'}
        </span>
        <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', AUTHORITY_CLS[item.authority])}>
          {item.authority}
        </span>
        <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', PROGRAM_CLS[item.program])}>
          {item.program}
        </span>
      </div>

      {/* Footer: semester/date + view link */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Sem {item.semester} •{' '}
          {new Date(item.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
        </span>
        {item.fileUrl && (
          <a
            href={item.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-brand-600 hover:text-brand-700 font-medium"
          >
            <ExternalLink size={11} /> View
          </a>
        )}
      </div>
    </div>
  )
}
