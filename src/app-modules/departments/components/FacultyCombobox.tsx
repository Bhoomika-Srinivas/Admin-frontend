import { useState, useMemo, useRef, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'
import type { Faculty } from '@/shared/types/models'
import clsx from 'clsx'

interface Props {
  facultyList: Faculty[]
  value: string                               // facultyId
  onChange: (id: string, dept: string) => void
  placeholder?: string
}

export default function FacultyCombobox({ facultyList, value, onChange, placeholder = 'Search faculty by name or department…' }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen]   = useState(false)
  const ref               = useRef<HTMLDivElement>(null)

  const selected = facultyList.find(f => f.id === value)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return !q ? facultyList : facultyList.filter(
      f => f.name.toLowerCase().includes(q) || f.department.toLowerCase().includes(q),
    )
  }, [facultyList, query])

  function select(f: Faculty) {
    onChange(f.id, f.department)
    setQuery('')
    setOpen(false)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    setOpen(true)
    if (!e.target.value) onChange('', '')
  }

  return (
    <div ref={ref} className="relative">
      <div
        className={clsx(
          'input-field flex items-center gap-2 cursor-text',
          open && 'ring-2 ring-brand-500 border-brand-500',
        )}
        onClick={() => setOpen(true)}
      >
        {selected && !open ? (
          <>
            <span className="flex-1 text-sm">{selected.name}</span>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange('', ''); setQuery('') }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <input
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400"
              placeholder={selected ? selected.name : placeholder}
              value={open ? query : ''}
              onChange={handleInputChange}
              onFocus={() => setOpen(true)}
            />
            <ChevronDown size={14} className="text-slate-400 shrink-0" />
          </>
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-400">No faculty found</p>
          ) : (
            filtered.map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => select(f)}
                className={clsx(
                  'w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-brand-50 transition-colors',
                  f.id === value && 'bg-brand-50',
                )}
              >
                <span className="text-sm font-medium text-slate-800">{f.name}</span>
                <span className="text-xs text-slate-400 ml-2 shrink-0">{f.department}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
