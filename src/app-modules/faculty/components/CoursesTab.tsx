import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Faculty, CourseTeaching } from '@/shared/types/models'
import { CourseTeachingSchema } from '@/app-modules/faculty/types'
import { useToast } from '@/shared/context/ToastContext'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import { useFormErrors } from '@/shared/hooks/useFormErrors'

interface Props {
  fac: Faculty
  canEdit: boolean
  persist: (changes: Partial<Faculty>) => void
}

const emptyCourse: Omit<CourseTeaching, 'id'> = { courseName: '', semester: 'Odd', program: '', academicYear: '' }

export default function CoursesTab({ fac, canEdit, persist }: Props) {
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<Omit<CourseTeaching, 'id'>>(emptyCourse)
  const { errors, setErrors, validateField, clearErrors } = useFormErrors(CourseTeachingSchema)

  const courses = fac.courses ?? []

  function openModal() {
    setForm(emptyCourse)
    clearErrors()
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    clearErrors()
  }

  function handleAdd() {
    const parsed = CourseTeachingSchema.safeParse(form)
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>)
      return
    }
    clearErrors()
    persist({ courses: [...courses, { ...form, id: `c${Date.now()}` }] })
    closeModal()
    toast.success('Course added')
  }

  function handleDelete(id: string) {
    persist({ courses: courses.filter(c => c.id !== id) })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{courses.length} course{courses.length !== 1 ? 's' : ''}</p>
        {canEdit && (
          <button onClick={openModal} className="btn-primary text-xs py-1.5 px-3">
            <Plus size={13} /> Add Course
          </button>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No courses added yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 px-4 font-medium text-slate-500">Course</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Program</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Semester</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Academic Year</th>
                {canEdit && <th className="w-12" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {courses.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-800">{c.courseName}</td>
                  <td className="py-3 px-4 text-slate-600">{c.program}</td>
                  <td className="py-3 px-4 text-slate-600">{c.semester}</td>
                  <td className="py-3 px-4 text-slate-600">{c.academicYear}</td>
                  {canEdit && (
                    <td className="py-3 px-2">
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title="Add Course" size="md">
        <div className="space-y-4">
          <FormField label="Course Name" required error={errors.courseName?.[0]}>
            <input className="input-field" value={form.courseName} onChange={e => setForm(f => ({ ...f, courseName: e.target.value }))} onBlur={e => validateField('courseName', e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Program" required hint="e.g. B.E CSE" error={errors.program?.[0]}>
              <input className="input-field" value={form.program} onChange={e => setForm(f => ({ ...f, program: e.target.value }))} onBlur={e => validateField('program', e.target.value)} />
            </FormField>
            <FormField label="Semester">
              <select className="input-field" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}>
                <option value="Odd">Odd</option>
                <option value="Even">Even</option>
              </select>
            </FormField>
          </div>
          <FormField label="Academic Year" required hint="e.g. 2024-25" error={errors.academicYear?.[0]}>
            <input className="input-field" value={form.academicYear} onChange={e => setForm(f => ({ ...f, academicYear: e.target.value }))} onBlur={e => validateField('academicYear', e.target.value)} />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={closeModal} className="btn-secondary">Cancel</button>
          <button onClick={handleAdd} className="btn-primary">Add Course</button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
