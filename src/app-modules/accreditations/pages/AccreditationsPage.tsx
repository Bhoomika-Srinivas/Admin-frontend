import { useNavigate } from 'react-router-dom'
import { Award } from 'lucide-react'
import { ACCREDITATION_TYPES, TYPE_META } from '../config'
import type { AccreditationType } from '@/shared/types/models'

export default function AccreditationsPage() {
  const navigate = useNavigate()

  function go(type: AccreditationType) {
    navigate(`/accreditations/${type.toLowerCase()}`)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-display font-bold text-slate-800">Accreditation / Ranking</h2>
        <p className="text-sm text-slate-500">Select a type to manage documents and records</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACCREDITATION_TYPES.map(type => {
          const meta = TYPE_META[type]
          return (
            <button
              key={type}
              onClick={() => go(type)}
              className={`card p-6 text-left hover:shadow-md transition-all group flex items-start gap-4 border ${meta.color}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}>
                <Award size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg">{meta.label}</p>
                <p className="text-sm text-slate-500 mt-0.5 leading-tight">{meta.description}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
