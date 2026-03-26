import { useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, Building2 } from 'lucide-react'
import { getProgram } from '@/data/coursesData'
import CourseBreadcrumb from '../components/CourseBreadcrumb'

export default function DepartmentsPage() {
  const { programId } = useParams<{ programId: string }>()
  const navigate = useNavigate()

  const program = getProgram(programId ?? '')

  if (!program) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Program not found.</p>
        <button onClick={() => navigate('/academics/courses')} className="btn-secondary mt-4">
          Back to Programs
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <CourseBreadcrumb items={[{ label: program.name }]} />

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${program.color} flex items-center justify-center flex-shrink-0`}>
          <Building2 size={22} className={program.textColor} />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">{program.name} — Departments</h2>
          <p className="text-sm text-slate-500">{program.fullName} · {program.duration} · {program.maxSemesters} Semesters</p>
        </div>
      </div>

      {/* Department list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {program.departments.map(dept => (
          <button
            key={dept.id}
            onClick={() => navigate(`/academics/courses/${program.id}/${dept.id}`)}
            className={`card p-5 text-left hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 border-2 ${program.borderColor} group flex items-center gap-4`}
          >
            {/* Short name badge */}
            <div className={`w-12 h-12 rounded-xl ${program.color} flex items-center justify-center flex-shrink-0 font-display font-bold text-sm ${program.textColor}`}>
              {dept.shortName}
            </div>

            {/* Dept info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-800 text-sm leading-snug">{dept.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{program.maxSemesters} semesters · {program.batches.length} batches</p>
            </div>

            <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}
