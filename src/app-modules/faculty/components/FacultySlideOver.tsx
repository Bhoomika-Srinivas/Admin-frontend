import { X, FileText, Mail, Building2 } from 'lucide-react'
import type { Faculty } from '@/shared/types/models'
import Badge, { statusVariant } from '@/shared/components/common/Badge'

interface Props {
  faculty: Faculty
  onClose: () => void
}

export default function FacultySlideOver({ faculty: f, onClose }: Props) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl z-50 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Faculty Profile</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* Avatar + Name */}
          <div className="flex flex-col items-center text-center gap-3 pt-2">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center shrink-0 border border-slate-200">
              {f.profileImage ? (
                <img src={f.profileImage} alt={f.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-brand-600">
                  {f.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-slate-800">{f.name}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{f.designation}</p>
            </div>
            <Badge variant={statusVariant(f.status)}>{f.status}</Badge>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Building2 size={15} className="text-slate-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Department</p>
                <p className="text-sm font-medium text-slate-700">{f.department}</p>
              </div>
            </div>

            {f.email && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Mail size={15} className="text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <a href={`mailto:${f.email}`} className="text-sm font-medium text-brand-600 hover:underline">
                    {f.email}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* CV */}
          {f.cvUrl && (
            <a href={f.cvUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-3 p-4 border border-emerald-200 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors group">
              <FileText size={18} className="text-emerald-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-emerald-800">View / Download CV</p>
                <p className="text-xs text-emerald-600 truncate">{f.name} — Resume</p>
              </div>
            </a>
          )}

        </div>
      </div>
    </>
  )
}
