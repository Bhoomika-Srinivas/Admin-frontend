import { useRef } from 'react'
import { FileText } from 'lucide-react'
import type { Faculty } from '@/shared/types/models'
import { useToast } from '@/shared/context/ToastContext'
import { validateDocumentFile } from '@/shared/utils/validateFile'

interface Props {
  fac: Faculty
  canEdit: boolean
  persist: (changes: Partial<Faculty>) => void
}

export default function CvTab({ fac, canEdit, persist }: Props) {
  const toast = useToast()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateDocumentFile(file)
    if (err) { toast.error(err); e.target.value = ''; return }
    persist({ cvUrl: file.name })
    toast.success(`CV "${file.name}" uploaded`)
  }

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
        {fac.cvUrl ? (
          <div className="space-y-3">
            <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mx-auto">
              <FileText size={28} className="text-red-500" />
            </div>
            <p className="text-sm font-medium text-slate-700">{fac.cvUrl}</p>
            <p className="text-xs text-slate-400">CV file uploaded</p>
            {canEdit && (
              <button onClick={() => inputRef.current?.click()} className="btn-secondary text-sm mt-2">
                Replace CV
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto">
              <FileText size={28} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">No CV uploaded yet</p>
            {canEdit && (
              <button onClick={() => inputRef.current?.click()} className="btn-primary text-sm">
                Upload CV (PDF)
              </button>
            )}
          </div>
        )}
        <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
      </div>
    </div>
  )
}
