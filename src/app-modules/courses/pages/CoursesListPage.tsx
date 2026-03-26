import { useParams, useNavigate } from 'react-router-dom'
import { BookOpen, FlaskConical, Star, Layers, FileText, Download } from 'lucide-react'
import { getCourses, getDept, getProgram, type Course } from '@/data/coursesData'
import CourseBreadcrumb from '../components/CourseBreadcrumb'
import clsx from 'clsx'

// ─── Type badge ───────────────────────────────────────────────────────────────
const typeConfig: Record<Course['type'], { label: string; className: string; icon: React.ElementType }> = {
  Theory:  { label: 'Theory',  className: 'bg-blue-100 text-blue-700',    icon: BookOpen    },
  Lab:     { label: 'Lab',     className: 'bg-emerald-100 text-emerald-700', icon: FlaskConical },
  Elective:{ label: 'Elective',className: 'bg-amber-100 text-amber-700',  icon: Star        },
  Project: { label: 'Project', className: 'bg-purple-100 text-purple-700', icon: Layers      },
  Seminar: { label: 'Seminar', className: 'bg-rose-100 text-rose-700',    icon: FileText    },
}

function TypeBadge({ type }: { type: Course['type'] }) {
  const cfg = typeConfig[type]
  const Icon = cfg.icon
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', cfg.className)}>
      <Icon size={10} />
      {cfg.label}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CoursesListPage() {
  const { programId, deptId, semester, batch } = useParams<{
    programId: string
    deptId: string
    semester: string
    batch: string
  }>()
  const navigate = useNavigate()

  const sem     = Number(semester)
  const program = getProgram(programId ?? '')
  const dept    = program ? getDept(program, deptId ?? '') : undefined
  const courses = (program && dept) ? getCourses(program.id, dept.id, sem) : []

  if (!program || !dept || isNaN(sem)) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Invalid selection.</p>
        <button onClick={() => navigate('/academics/courses')} className="btn-secondary mt-4">
          Back to Programs
        </button>
      </div>
    )
  }

  // Decode batch label (dashes back to original)
  const batchLabel = batch?.replace(/-(?=\d{2}$)/, '-') ?? batch ?? ''

  // Computed summaries
  const totalCredits  = courses.reduce((s, c) => s + c.credits, 0)
  const totalHours    = courses.reduce((s, c) => s + c.hoursPerWeek, 0)
  const theoryCredits = courses.filter(c => c.type === 'Theory' || c.type === 'Elective').reduce((s, c) => s + c.credits, 0)
  const labCredits    = courses.filter(c => c.type === 'Lab').reduce((s, c) => s + c.credits, 0)
  const projCredits   = courses.filter(c => c.type === 'Project' || c.type === 'Seminar').reduce((s, c) => s + c.credits, 0)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <CourseBreadcrumb items={[
        { label: program.name,   to: `/academics/courses/${program.id}` },
        { label: dept.shortName, to: `/academics/courses/${program.id}/${dept.id}` },
        { label: `Sem ${sem}`,   to: `/academics/courses/${program.id}/${dept.id}/${sem}` },
        { label: batchLabel },
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">
            {dept.shortName} · Semester {sem} · Batch {batchLabel}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {program.fullName} · {dept.name}
          </p>
        </div>
        <button className="btn-secondary text-sm flex-shrink-0">
          <Download size={14} />
          Export PDF
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Courses',       value: courses.length,           color: 'text-brand-700',   bg: 'bg-brand-50' },
          { label: 'Total Credits',        value: totalCredits,             color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Hours / Week',         value: totalHours,               color: 'text-purple-700',  bg: 'bg-purple-50' },
          { label: 'Theory / Lab / Proj',  value: `${theoryCredits}/${labCredits}/${projCredits}`, color: 'text-amber-700', bg: 'bg-amber-50' },
        ].map(s => (
          <div key={s.label} className={`card p-4 ${s.bg}`}>
            <p className={`text-xs font-medium ${s.color} opacity-75`}>{s.label}</p>
            <p className={`text-2xl font-display font-bold ${s.color} mt-1`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Course table */}
      {courses.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen size={36} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No courses configured</p>
          <p className="text-xs text-slate-400 mt-1">
            Courses for {dept.shortName} Semester {sem} have not been added yet.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Course List</p>
            <p className="text-xs text-slate-400">{courses.length} courses · {totalCredits} credits</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wide w-8">#</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">Code</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Course Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide w-20">Credits</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide w-24">Hrs/Week</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Faculty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {courses.map((course, i) => (
                  <tr key={course.code} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-5 text-slate-400 text-xs">{i + 1}</td>
                    <td className="py-3.5 px-4">
                      <code className={clsx(
                        'text-xs font-mono px-2 py-0.5 rounded font-medium',
                        typeConfig[course.type].className
                      )}>
                        {course.code}
                      </code>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{course.name}</td>
                    <td className="py-3.5 px-4">
                      <TypeBadge type={course.type} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-sm font-bold text-slate-700">{course.credits}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-sm text-slate-500">{course.hoursPerWeek}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {course.faculty ?? <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Footer totals */}
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td colSpan={4} className="py-3 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Total
                  </td>
                  <td className="py-3 px-4 text-center font-display font-bold text-slate-800">{totalCredits}</td>
                  <td className="py-3 px-4 text-center font-display font-bold text-slate-800">{totalHours}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Type legend */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="font-medium">Legend:</span>
        {(Object.keys(typeConfig) as Course['type'][]).map(type => (
          <TypeBadge key={type} type={type} />
        ))}
      </div>
    </div>
  )
}
