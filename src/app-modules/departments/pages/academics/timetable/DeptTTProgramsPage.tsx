import { useParams, useNavigate } from 'react-router-dom'
import { Clock, ChevronRight } from 'lucide-react'

const PROGRAM_TYPES = [
  {
    id: 'UG',
    label: 'Under Graduate',
    hint: 'BE, BTech, BSc, BCA…',
    color: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-500' },
  },
  {
    id: 'PG',
    label: 'Post Graduate',
    hint: 'MCA, MTech, MBA, MSc…',
    color: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: 'text-purple-500' },
  },
]

export default function DeptTTProgramsPage() {
  const { deptId } = useParams<{ deptId: string }>()
  const navigate   = useNavigate()

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-display font-bold text-slate-800">Timetable</h3>
        <p className="text-sm text-slate-500">Select program type to continue</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PROGRAM_TYPES.map(pt => (
          <button
            key={pt.id}
            onClick={() => navigate(`/departments/${deptId}/academics/timetable/${pt.id}`)}
            className={`card p-6 text-left hover:shadow-md transition-all group flex items-start gap-4 border ${pt.color.border}`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${pt.color.bg}`}>
              <Clock size={22} className={pt.color.icon} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`font-bold text-lg ${pt.color.text}`}>{pt.id}</p>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 shrink-0" />
              </div>
              <p className="text-sm font-medium text-slate-700 mt-0.5">{pt.label}</p>
              <p className="text-xs text-slate-400 mt-1">{pt.hint}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
