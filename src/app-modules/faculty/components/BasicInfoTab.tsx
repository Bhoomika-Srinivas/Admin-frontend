import { useState } from 'react'
import { Save } from 'lucide-react'
import type { Faculty } from '@/shared/types/models'
import { FacultySchema } from '@/app-modules/faculty/types'
import { useToast } from '@/shared/context/ToastContext'
import FormField from '@/shared/components/forms/FormField'
import { useFormErrors } from '@/shared/hooks/useFormErrors'
import clsx from 'clsx'

interface Props {
  fac: Faculty
  canEdit: boolean
  persist: (changes: Partial<Faculty>) => void
}

export default function BasicInfoTab({ fac, canEdit, persist }: Props) {
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const { errors, setErrors, validateField, clearErrors } = useFormErrors(FacultySchema)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = {
      name:           fd.get('name') as string,
      email:          fd.get('email') as string,
      phone:          fd.get('phone') as string || undefined,
      officeLocation: fd.get('officeLocation') as string || undefined,
      specialization: fd.get('specialization') as string,
      qualification:  fd.get('qualification') as string,
      experience:     Number(fd.get('experience')),
      designation:    fac.designation,
      department:     fac.department,
    }
    const parsed = FacultySchema.safeParse(data)
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>)
      return
    }
    clearErrors()
    setSaving(true)
    persist(data)
    await new Promise(r => setTimeout(r, 200))
    setSaving(false)
    toast.success('Profile saved')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Full Name" required error={errors.name?.[0]}>
          <input name="name" className="input-field" defaultValue={fac.name} readOnly={!canEdit} onBlur={canEdit ? e => validateField('name', e.target.value) : undefined} />
        </FormField>
        <FormField label="Email" required error={errors.email?.[0]}>
          <input name="email" type="email" className="input-field" defaultValue={fac.email} readOnly={!canEdit} onBlur={canEdit ? e => validateField('email', e.target.value) : undefined} />
        </FormField>
        <FormField label="Phone" error={errors.phone?.[0]}>
          <input name="phone" className="input-field" defaultValue={fac.phone ?? ''} readOnly={!canEdit} onBlur={canEdit ? e => validateField('phone', e.target.value || undefined) : undefined} />
        </FormField>
        <FormField label="Office Location">
          <input name="officeLocation" className="input-field" defaultValue={fac.officeLocation ?? ''} readOnly={!canEdit} />
        </FormField>
        <FormField label="Qualification" required error={errors.qualification?.[0]}>
          <input name="qualification" className="input-field" defaultValue={fac.qualification} readOnly={!canEdit} onBlur={canEdit ? e => validateField('qualification', e.target.value) : undefined} />
        </FormField>
        <FormField label="Experience (years)" error={errors.experience?.[0]}>
          <input name="experience" type="number" className="input-field" defaultValue={fac.experience} readOnly={!canEdit} onBlur={canEdit ? e => validateField('experience', Number(e.target.value)) : undefined} />
        </FormField>
      </div>
      <FormField label="Specialization" error={errors.specialization?.[0]}>
        <input name="specialization" className="input-field" defaultValue={fac.specialization} readOnly={!canEdit} onBlur={canEdit ? e => validateField('specialization', e.target.value) : undefined} />
      </FormField>
      {canEdit && (
        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving} className={clsx('btn-primary', saving && 'opacity-70')}>
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Basic Info'}
          </button>
        </div>
      )}
    </form>
  )
}
