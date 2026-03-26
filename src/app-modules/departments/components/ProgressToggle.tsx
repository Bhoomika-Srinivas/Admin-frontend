import { CheckCircle2, Circle } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}

export default function ProgressToggle({ label, checked, onChange }: Props) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left"
    >
      {checked
        ? <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
        : <Circle size={18} className="text-slate-300 shrink-0" />}
      <span className={clsx('text-sm', checked ? 'text-emerald-700 font-medium' : 'text-slate-600')}>
        {label}
      </span>
    </button>
  )
}
