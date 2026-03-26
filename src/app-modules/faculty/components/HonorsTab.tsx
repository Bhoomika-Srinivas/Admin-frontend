import { useState } from 'react'
import { Plus, Trash2, Award } from 'lucide-react'
import type { Faculty, Honor } from '@/shared/types/models'
import { HonorSchema } from '@/app-modules/faculty/types'
import { useToast } from '@/shared/context/ToastContext'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import { useFormErrors } from '@/shared/hooks/useFormErrors'

interface Props {
  fac: Faculty
  canEdit: boolean
  persist: (changes: Partial<Faculty>) => void
}

const emptyHonor: Omit<Honor, 'id'> = {
  title: '', organization: '', year: new Date().getFullYear(), description: '',
}

export default function HonorsTab({ fac, canEdit, persist }: Props) {
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<Omit<Honor, 'id'>>(emptyHonor)
  const { errors, setErrors, validateField, clearErrors } = useFormErrors(HonorSchema)

  const honors = fac.honors ?? []

  function openModal() {
    setForm(emptyHonor)
    clearErrors()
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    clearErrors()
  }

  function handleAdd() {
    const parsed = HonorSchema.safeParse(form)
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>)
      return
    }
    clearErrors()
    persist({ honors: [...honors, { ...form, id: `h${Date.now()}` }] })
    closeModal()
    toast.success('Award added')
  }

  function handleDelete(id: string) {
    persist({ honors: honors.filter(h => h.id !== id) })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{honors.length} award{honors.length !== 1 ? 's' : ''}</p>
        {canEdit && (
          <button onClick={openModal} className="btn-primary text-xs py-1.5 px-3">
            <Plus size={13} /> Add Award
          </button>
        )}
      </div>

      {honors.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No awards added yet.</div>
      ) : (
        <div className="space-y-3">
          {[...honors].sort((a, b) => b.year - a.year).map(h => (
            <div key={h.id} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Award size={18} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{h.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{h.organization} · {h.year}</p>
                {h.description && <p className="text-xs text-slate-400 mt-1">{h.description}</p>}
              </div>
              {canEdit && (
                <button onClick={() => handleDelete(h.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg self-start">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title="Add Award / Honor" size="md">
        <div className="space-y-4">
          <FormField label="Award Title" required error={errors.title?.[0]}>
            <input className="input-field" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} onBlur={e => validateField('title', e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Organization" required error={errors.organization?.[0]}>
              <input className="input-field" value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} onBlur={e => validateField('organization', e.target.value)} />
            </FormField>
            <FormField label="Year" required error={errors.year?.[0]}>
              <input type="number" className="input-field" value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} onBlur={e => validateField('year', Number(e.target.value))} />
            </FormField>
          </div>
          <FormField label="Description" hint="Optional">
            <textarea className="input-field h-20 resize-none" value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={closeModal} className="btn-secondary">Cancel</button>
          <button onClick={handleAdd} className="btn-primary">Add Award</button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
