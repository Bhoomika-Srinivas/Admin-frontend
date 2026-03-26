import clsx from 'clsx'
import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: number
  changeLabel?: string
  color?: 'blue' | 'green' | 'amber' | 'purple' | 'rose' | 'cyan'
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  purple: 'bg-purple-50 text-purple-600',
  rose: 'bg-rose-50 text-rose-600',
  cyan: 'bg-cyan-50 text-cyan-600',
}

export default function StatCard({ title, value, icon: Icon, change, changeLabel, color = 'blue' }: StatCardProps) {
  const isPositive = (change ?? 0) >= 0

  return (
    <div className="card p-5 flex gap-4 items-start hover:shadow-card-hover transition-shadow">
      <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', colorMap[color])}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 font-medium mb-1 truncate">{title}</p>
        <p className="text-2xl font-display font-bold text-slate-800">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {change !== undefined && (
          <div className={clsx(
            'flex items-center gap-1 mt-1.5 text-xs font-medium',
            isPositive ? 'text-emerald-600' : 'text-red-500'
          )}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{Math.abs(change)}%</span>
            {changeLabel && <span className="text-slate-400 font-normal">{changeLabel}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
