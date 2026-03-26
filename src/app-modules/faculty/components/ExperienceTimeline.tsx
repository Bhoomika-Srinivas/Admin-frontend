import { useState } from 'react'
import { Plus, Trash2, Briefcase } from 'lucide-react'
import type { WorkExperience } from '@/shared/types/models'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'

interface Props {
  experience: WorkExperience[]
  canEdit: boolean
  onChange: (updated: WorkExperience[]) => void
}

const emptyExp: Omit<WorkExperience, 'id'> = {
  position: '', institution: '', startYear: new Date().getFullYear(), description: ''
}

export default function ExperienceTimeline({ experience, canEdit, onChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<Omit<WorkExperience, 'id'>>(emptyExp)

  function handleAdd() {
    onChange([...experience, { ...form, id: `w${Date.now()}` }])
    setModalOpen(false)
    setForm(emptyExp)
  }

  function handleDelete(id: string) {
    onChange(experience.filter(e => e.id !== id))
  }

  const sorted = [...experience].sort((a, b) => b.startYear - a.startYear)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{experience.length} position{experience.length !== 1 ? 's' : ''}</p>
        {canEdit && (
          <button onClick={() => setModalOpen(true)} className="btn-primary text-xs py-1.5 px-3">
            <Plus size={13} /> Add Experience
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No experience details added yet.</div>
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-200" />
          <div className="space-y-6">
            {sorted.map(exp => (
              <div key={exp.id} className="relative flex gap-4">
                <div className="absolute -left-3.5 top-1.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white z-10" />
                <div className="flex-1 p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <Briefcase size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{exp.position}</p>
                        <p className="text-sm text-slate-600">{exp.institution}</p>
                        {exp.description && (
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {exp.startYear} – {exp.endYear ?? 'Present'}
                      </span>
                      {canEdit && (
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Experience" size="md">
        <div className="space-y-4">
          <FormField label="Position / Title" required>
            <input className="input-field" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} />
          </FormField>
          <FormField label="Institution / Organization" required>
            <input className="input-field" value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Year" required>
              <input type="number" className="input-field" value={form.startYear} onChange={e => setForm(f => ({ ...f, startYear: Number(e.target.value) }))} />
            </FormField>
            <FormField label="End Year" hint="Leave blank if current">
              <input type="number" className="input-field" value={form.endYear ?? ''} onChange={e => setForm(f => ({ ...f, endYear: e.target.value ? Number(e.target.value) : undefined }))} />
            </FormField>
          </div>
          <FormField label="Description" hint="Optional">
            <textarea className="input-field h-20 resize-none" value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleAdd} className="btn-primary">Add Experience</button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
