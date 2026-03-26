import clsx from 'clsx'

type Variant = 'green' | 'blue' | 'yellow' | 'red' | 'gray' | 'purple'

const variantClasses: Record<Variant, string> = {
  green: 'bg-emerald-100 text-emerald-700',
  blue: 'bg-blue-100 text-blue-700',
  yellow: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-slate-100 text-slate-600',
  purple: 'bg-purple-100 text-purple-700',
}

interface BadgeProps {
  variant?: Variant
  children: React.ReactNode
  className?: string
}

export default function Badge({ variant = 'gray', children, className }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  )
}

export function statusVariant(status: string): Variant {
  const map: Record<string, Variant> = {
    active: 'green',
    published: 'green',
    completed: 'green',
    graduated: 'green',
    inactive: 'gray',
    archived: 'gray',
    draft: 'yellow',
    upcoming: 'blue',
    ongoing: 'purple',
    cancelled: 'red',
  }
  return map[status] ?? 'gray'
}
