import { useNavigate } from 'react-router-dom'
import { BookOpen, ChevronRight, Clock, Layers } from 'lucide-react'
import { useCourses } from '@/app-modules/courses/hooks/useCourses'

export default function CoursesProgramsPage() {
  const navigate = useNavigate()
  const { programs } = useCourses()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-display font-bold text-slate-800">Academic Programs</h2>
        <p className="text-sm text-slate-500">Select a program to browse its courses</p>
      </div>

      {/* Program cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {programs.map(program => (
          <button
            key={program.id}
            onClick={() => navigate(`/academics/courses/${program.id}`)}
            className={`card p-5 text-left hover:-translate-y-1 hover:shadow-lg transition-all duration-200 border-2 ${program.borderColor} group`}
          >
            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl ${program.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <BookOpen size={22} className={program.textColor} />
            </div>

            {/* Program name */}
            <div className="mb-3">
              <span className={`text-2xl font-display font-bold ${program.textColor}`}>
                {program.name}
              </span>
              <p className="text-sm text-slate-600 mt-0.5 leading-snug">{program.fullName}</p>
            </div>

            {/* Meta */}
            <div className="space-y-1.5 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Clock size={12} />
                <span>{program.duration}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers size={12} />
                <span>{program.maxSemesters} Semesters</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen size={12} />
                <span>{program.departments.length} Department{program.departments.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Arrow */}
            <div className={`flex items-center gap-1 mt-4 text-xs font-medium ${program.textColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
              <span>Browse courses</span>
              <ChevronRight size={13} />
            </div>
          </button>
        ))}
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Programs',    value: programs.length },
          { label: 'Departments', value: programs.reduce((s, p) => s + p.departments.length, 0) },
          { label: 'Total Semesters', value: programs.reduce((s, p) => s + p.maxSemesters * p.departments.length, 0) },
          { label: 'Active Batches',  value: programs.reduce((s, p) => s + p.batches.length, 0) },
        ].map(stat => (
          <div key={stat.label} className="card p-4">
            <p className="text-xs text-slate-500">{stat.label}</p>
            <p className="text-2xl font-display font-bold text-slate-800 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
