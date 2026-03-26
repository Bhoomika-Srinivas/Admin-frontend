import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Faculty, ResearchProject } from '@/shared/types/models'
import { ResearchProjectSchema } from '@/app-modules/faculty/types'
import { useToast } from '@/shared/context/ToastContext'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import { useFormErrors } from '@/shared/hooks/useFormErrors'
import clsx from 'clsx'

interface Props {
  fac: Faculty
  canEdit: boolean
  persist: (changes: Partial<Faculty>) => void
}

const emptyProject: Omit<ResearchProject, 'id'> = {
  title: '', fundingAgency: '', amount: '', startYear: new Date().getFullYear(), status: 'ongoing',
}

export default function ProjectsTab({ fac, canEdit, persist }: Props) {
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<Omit<ResearchProject, 'id'>>(emptyProject)
  const { errors, setErrors, validateField, clearErrors } = useFormErrors(ResearchProjectSchema)

  const projects = fac.projects ?? []

  function openModal() {
    setForm(emptyProject)
    clearErrors()
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    clearErrors()
  }

  function handleAdd() {
    const parsed = ResearchProjectSchema.safeParse(form)
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>)
      return
    }
    clearErrors()
    persist({ projects: [...projects, { ...form, id: `r${Date.now()}` }] })
    closeModal()
    toast.success('Project added')
  }

  function handleDelete(id: string) {
    persist({ projects: projects.filter(p => p.id !== id) })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        {canEdit && (
          <button onClick={openModal} className="btn-primary text-xs py-1.5 px-3">
            <Plus size={13} /> Add Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No projects added yet.</div>
      ) : (
        <div className="space-y-3">
          {projects.map(p => (
            <div key={p.id} className="p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{p.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{p.fundingAgency}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {p.amount && <span className="text-xs text-emerald-700 font-medium">{p.amount}</span>}
                    <span className="text-xs text-slate-400">{p.startYear}{p.endYear ? ` – ${p.endYear}` : ' – Present'}</span>
                    <span className={clsx(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      p.status === 'ongoing' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                    )}>
                      {p.status}
                    </span>
                  </div>
                </div>
                {canEdit && (
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title="Add Research Project" size="md">
        <div className="space-y-4">
          <FormField label="Project Title" required error={errors.title?.[0]}>
            <input className="input-field" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} onBlur={e => validateField('title', e.target.value)} />
          </FormField>
          <FormField label="Funding Agency" required error={errors.fundingAgency?.[0]}>
            <input className="input-field" value={form.fundingAgency} onChange={e => setForm(f => ({ ...f, fundingAgency: e.target.value }))} onBlur={e => validateField('fundingAgency', e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Amount" hint="Optional">
              <input className="input-field" value={form.amount ?? ''} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="e.g. ₹10 Lakhs" />
            </FormField>
            <FormField label="Status">
              <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ResearchProject['status'] }))}>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Year" required error={errors.startYear?.[0]}>
              <input type="number" className="input-field" value={form.startYear} onChange={e => setForm(f => ({ ...f, startYear: Number(e.target.value) }))} onBlur={e => validateField('startYear', Number(e.target.value))} />
            </FormField>
            <FormField label="End Year" hint="Optional" error={errors.endYear?.[0]}>
              <input type="number" className="input-field" value={form.endYear ?? ''} onChange={e => setForm(f => ({ ...f, endYear: e.target.value ? Number(e.target.value) : undefined }))} />
            </FormField>
          </div>
        </div>
        <ModalFooter>
          <button onClick={closeModal} className="btn-secondary">Cancel</button>
          <button onClick={handleAdd} className="btn-primary">Add Project</button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
