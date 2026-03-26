import { useState } from 'react'
import { Plus, Trash2, GraduationCap } from 'lucide-react'
import type { Education } from '@/shared/types/models'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'

interface Props {
  education: Education[]
  canEdit: boolean
  onChange: (updated: Education[]) => void
}

const emptyEd: Omit<Education, 'id'> = {
  degree: '', institution: '', year: new Date().getFullYear(), specialization: ''
}

export default function EducationTimeline({ education, canEdit, onChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<Omit<Education, 'id'>>(emptyEd)

  function handleAdd() {
    onChange([...education, { ...form, id: `e${Date.now()}` }])
    setModalOpen(false)
    setForm(emptyEd)
  }

  function handleDelete(id: string) {
    onChange(education.filter(e => e.id !== id))
  }

  const sorted = [...education].sort((a, b) => b.year - a.year)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{education.length} qualification{education.length !== 1 ? 's' : ''}</p>
        {canEdit && (
          <button onClick={() => setModalOpen(true)} className="btn-primary text-xs py-1.5 px-3">
            <Plus size={13} /> Add Education
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No education details added yet.</div>
      ) : (
        <div className="relative pl-6">
          {/* Timeline line */}
          <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-200" />

          <div className="space-y-6">
            {sorted.map(ed => (
              <div key={ed.id} className="relative flex gap-4">
                {/* Dot */}
                <div className="absolute -left-3.5 top-1.5 w-3 h-3 rounded-full bg-brand-500 ring-4 ring-white flex-shrink-0 z-10" />
                <div className="flex-1 p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <GraduationCap size={16} className="text-brand-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{ed.degree}</p>
                        <p className="text-sm text-slate-600">{ed.institution}</p>
                        {ed.specialization && (
                          <p className="text-xs text-slate-400 mt-0.5">{ed.specialization}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-bold text-brand-700">{ed.year}</span>
                      {canEdit && (
                        <button
                          onClick={() => handleDelete(ed.id)}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Education" size="md">
        <div className="space-y-4">
          <FormField label="Degree" required hint="e.g. Ph.D in Computer Science">
            <input className="input-field" value={form.degree} onChange={e => setForm(f => ({ ...f, degree: e.target.value }))} />
          </FormField>
          <FormField label="Institution" required>
            <input className="input-field" value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Year of Completion" required>
              <input type="number" className="input-field" value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} />
            </FormField>
            <FormField label="Specialization" hint="Optional">
              <input className="input-field" value={form.specialization ?? ''} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} />
            </FormField>
          </div>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleAdd} className="btn-primary">Add Education</button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
