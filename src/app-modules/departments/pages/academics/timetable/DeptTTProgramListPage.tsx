import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, ChevronRight, Plus } from 'lucide-react'
import { deptBatchService } from '@/app-modules/departments/api/deptAcademicsApi'
import { useDepartmentSectionAsync } from '@/app-modules/departments/hooks/useDepartmentSection'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'

export default function DeptTTProgramListPage() {
  const { deptId, programType } = useParams<{ deptId: string; programType: string }>()
  const navigate = useNavigate()

  const { data: allBatches } = useDepartmentSectionAsync(
    () => deptBatchService.getAll(deptId!, programType)
  )

  const programs = [...new Set(allBatches.map(b => b.program))].filter(Boolean).sort()

  const [modalOpen, setModalOpen] = useState(false)
  const [newProgram, setNewProgram] = useState('')

  function handleNavigate(prog: string) {
    navigate(`/departments/${deptId}/academics/timetable/${programType}/${encodeURIComponent(prog)}`)
  }

  function handleAdd() {
    if (!newProgram.trim()) return
    handleNavigate(newProgram.trim().toUpperCase())
  }

  const base = `/departments/${deptId}/academics/timetable`

  return (
    <div className="space-y-5">
      <nav className="flex items-center gap-1 text-sm">
        <button onClick={() => navigate(base)} className="text-slate-500 hover:text-brand-600">Timetable</button>
        <ChevronRight size={13} className="text-slate-300" />
        <span className="text-slate-700 font-medium">{programType}</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-display font-bold text-slate-800">{programType} Programs</h3>
          <p className="text-sm text-slate-500">{programs.length} program{programs.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setNewProgram(''); setModalOpen(true) }} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> Add Program
        </button>
      </div>

      {programs.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-center">
          <Clock size={28} className="text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-600">No programs yet</p>
          <p className="text-xs text-slate-400 mt-1">Add a program to get started.</p>
          <button onClick={() => { setNewProgram(''); setModalOpen(true) }} className="btn-primary mt-4 flex items-center gap-1.5">
            <Plus size={14} /> Add Program
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map(prog => (
            <button
              key={prog}
              onClick={() => handleNavigate(prog)}
              className="card p-5 text-left hover:shadow-md hover:border-brand-200 transition-all group flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                <Clock size={18} className="text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base text-brand-700">{prog}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {allBatches.filter(b => b.program === prog).length} batch{allBatches.filter(b => b.program === prog).length !== 1 ? 'es' : ''}
                </p>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 shrink-0" />
            </button>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Program">
        <div className="space-y-4">
          <FormField label="Program Name" required hint='e.g. "BE", "MCA", "MBA"'>
            <input
              className="input-field uppercase"
              placeholder="BE"
              value={newProgram}
              onChange={e => setNewProgram(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              autoFocus
            />
          </FormField>
          <p className="text-xs text-slate-400">This will take you to the semester view.</p>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleAdd} className="btn-primary">Continue</button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
