import { FileX } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description?: string
  action?: React.ReactNode
  icon?: React.ElementType
}

export default function EmptyState({
  title = 'No data found',
  description = 'There are no items to display.',
  action,
  icon: Icon = FileX,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon size={28} className="text-slate-400" />
      </div>
      <h3 className="text-sm font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 mb-4 max-w-xs">{description}</p>
      {action}
    </div>
  )
}
