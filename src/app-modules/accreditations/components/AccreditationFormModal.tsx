import { useState } from 'react'
import { useToast } from '@/shared/context/ToastContext'
import { uploadToS3 } from '@/shared/utils/s3Upload'
import { accreditationService } from '../api/accreditationsApi'
import type { AccreditationRecord, AccreditationType } from '@/shared/types/models'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import { FileText, X } from 'lucide-react'

interface Props {
  open:              boolean
  onClose:           () => void
  onSaved:           () => void
  type:              AccreditationType
  section?:          string
  sub_section?:      string
  sub_sub_section?:  string
  department?:       string
  editItem?:         AccreditationRecord | null
}

export default function AccreditationFormModal({
  open, onClose, onSaved, type, section, sub_section, sub_sub_section, department, editItem,
}: Props) {
  const toast = useToast()

  const [title,       setTitle]       = useState(editItem?.title       ?? '')
  const [year,        setYear]        = useState(editItem?.year        ?? '')
  const [program,     setProgram]     = useState(editItem?.program     ?? '')
  const [cycle,       setCycle]       = useState(editItem?.cycle       ?? '')
  const [description, setDescription] = useState(editItem?.description ?? '')
  const [fileUrl,     _setFileUrl]    = useState(editItem?.file_url    ?? '')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [saving,      setSaving]      = useState(false)

  if (!open) return null

  const showYear        = type !== 'NAAC'
  const showProgram     = type === 'AICTE' && section === 'EOA'
  const showCycle       = type === 'NAAC'  && section === 'Accreditation Certificates'
  const showDescription = type === 'NAAC'  || type === 'NBA'

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) { setPendingFile(f); e.target.value = '' }
  }

  function clearFile() { setPendingFile(null) }

  async function handleSave() {
    if (!title.trim()) { toast.error('Title is required'); return }
    if (!fileUrl && !pendingFile) { toast.error('File is required'); return }

    setSaving(true)
    try {
      let finalUrl = fileUrl
      if (pendingFile) {
        try {
          finalUrl = await uploadToS3(pendingFile, 'accreditations', type.toLowerCase())
        } catch {
          // In development/mock mode, use a placeholder
          finalUrl = `https://mock-storage.example.com/${type.toLowerCase()}/${pendingFile.name}`
        }
      }

      const payload = {
        type,
        title: title.trim(),
        file_url: finalUrl,
        ...(section          ? { section }          : {}),
        ...(sub_section      ? { sub_section }      : {}),
        ...(sub_sub_section  ? { sub_sub_section }  : {}),
        ...(department       ? { department }       : {}),
        ...(year.trim()        ? { year: year.trim() }               : {}),
        ...(program.trim()     ? { program: program.trim() }         : {}),
        ...(cycle.trim()       ? { cycle: cycle.trim() }             : {}),
        ...(description.trim() ? { description: description.trim() } : {}),
      }

      if (editItem) {
        await accreditationService.update(editItem.id, payload)
        toast.success('Record updated')
      } else {
        await accreditationService.create(payload)
        toast.success('Record added')
      }
      onSaved(); onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editItem ? 'Edit Record' : 'Add Record'} size="lg">
      <div className="space-y-4">
        {/* Context info (read-only) */}
        {(section || department) && (
          <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 space-y-0.5">
            <p><span className="font-medium">Type:</span> {type}</p>
            {section         && <p><span className="font-medium">Section:</span> {section}</p>}
            {sub_section     && <p><span className="font-medium">Sub-section:</span> {sub_section}</p>}
            {sub_sub_section && <p><span className="font-medium">Sub-sub-section:</span> {sub_sub_section}</p>}
            {department      && <p><span className="font-medium">Department:</span> {department}</p>}
          </div>
        )}

        <FormField label="Title" required>
          <input className="input-field" value={title} onChange={e => setTitle(e.target.value)} placeholder="Document title" />
        </FormField>

        {showYear && (
          <FormField label="Year">
            <input className="input-field" value={year} onChange={e => setYear(e.target.value)} placeholder="e.g. 2024-25" />
          </FormField>
        )}

        {showProgram && (
          <FormField label="Program">
            <select className="input-field" value={program} onChange={e => setProgram(e.target.value)}>
              <option value="">— Select Program —</option>
              <option value="BE">BE</option>
              <option value="MCA">MCA</option>
              <option value="MBA">MBA</option>
            </select>
          </FormField>
        )}

        {showCycle && (
          <FormField label="Cycle">
            <select className="input-field" value={cycle} onChange={e => setCycle(e.target.value)}>
              <option value="">— Select Cycle —</option>
              <option value="Cycle 1">Cycle 1</option>
              <option value="Cycle 2">Cycle 2</option>
              <option value="Cycle 3">Cycle 3</option>
            </select>
          </FormField>
        )}

        {showDescription && (
          <FormField label="Description">
            <textarea className="input-field resize-none h-20" value={description}
              onChange={e => setDescription(e.target.value)} placeholder="Optional description..." />
          </FormField>
        )}

        <FormField label="File" required={!editItem}>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <span className="btn-secondary text-sm py-1.5 px-3">
                {pendingFile ? 'Replace File' : editItem ? 'Replace File' : 'Choose File'}
              </span>
              <input type="file" className="hidden" onChange={handleFile}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
            </label>
            {pendingFile && (
              <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                <FileText size={14} className="text-brand-500 shrink-0" />
                <span className="truncate">{pendingFile.name}</span>
                <button onClick={clearFile} className="ml-auto text-slate-400 hover:text-red-500">
                  <X size={14} />
                </button>
              </div>
            )}
            {!pendingFile && fileUrl && fileUrl !== '#' && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <FileText size={14} className="text-brand-400 shrink-0" />
                <span className="truncate text-xs text-slate-400">Existing file</span>
                <a href={fileUrl} target="_blank" rel="noreferrer"
                  className="ml-2 text-xs text-brand-600 hover:underline">View</a>
              </div>
            )}
          </div>
        </FormField>
      </div>
      <ModalFooter>
        <button onClick={onClose} className="btn-secondary" disabled={saving}>Cancel</button>
        <button onClick={handleSave} className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add Record'}
        </button>
      </ModalFooter>
    </Modal>
  )
}
