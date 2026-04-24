import { useState, useRef } from 'react'
import { Edit2, FileText, ExternalLink, Loader2, Save, Upload, Shield, Users } from 'lucide-react'
import { rulesRegulationsService } from '../api/academicsApi'
import { useRulesRegulations } from '../hooks/useAcademics'
import type { RulesRegulations } from '../types'
import { useToast } from '@/shared/context/ToastContext'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import { uploadToS3 } from '@/shared/utils/s3Upload'
import { validatePdfOrTextFile } from '@/shared/utils/validateFile'

type Section = 'serviceRules' | 'attendance' | 'discipline'

// Maps each section to the file and text keys in RulesRegulations
const FILE_KEY: Record<Section, keyof RulesRegulations> = {
  serviceRules: 'serviceRulesFile',
  attendance:   'attendanceFile',
  discipline:   'disciplineFile',
}
const TEXT_KEY: Record<Section, keyof RulesRegulations> = {
  serviceRules: 'serviceRulesText',
  attendance:   'attendance',
  discipline:   'discipline',
}

const SECTION_META: {
  key: Section
  title: string
  description: string
  icon: React.ElementType
  textLabel: string
  textPlaceholder: string
}[] = [
  {
    key: 'serviceRules',
    title: 'Service Rules',
    description: 'Official service rules — upload a PDF/TXT or enter the content directly',
    icon: FileText,
    textLabel: 'Service Rules Text',
    textPlaceholder: 'Enter service rules content…',
  },
  {
    key: 'attendance',
    title: 'Attendance Policy',
    description: 'Attendance requirements — upload a PDF/TXT or enter the policy directly',
    icon: Users,
    textLabel: 'Attendance Policy Text',
    textPlaceholder: 'Enter attendance policy…',
  },
  {
    key: 'discipline',
    title: 'Discipline Policy',
    description: 'Code of conduct — upload a PDF/TXT or enter the policy directly',
    icon: Shield,
    textLabel: 'Discipline Policy Text',
    textPlaceholder: 'Enter discipline policy…',
  },
]

export default function RulesRegulationsPage() {
  const toast = useToast()
  const { data, setData, loading } = useRulesRegulations()
  const [editSection, setEditSection] = useState<Section | null>(null)
  // Unified form state — same shape for all three sections
  const [editFileUrl, setEditFileUrl] = useState('')
  const [editText, setEditText]       = useState('')
  const [saving, setSaving]           = useState(false)
  const [uploading, setUploading]     = useState(false)
  const fileRef                       = useRef<HTMLInputElement>(null)

  function openEdit(section: Section) {
    setEditFileUrl((data?.[FILE_KEY[section]] as string) ?? '')
    setEditText((data?.[TEXT_KEY[section]] as string) ?? '')
    setEditSection(section)
  }

  function closeModal() { setEditSection(null) }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validatePdfOrTextFile(file)
    if (err) { toast.error(err); return }
    setUploading(true)
    try {
      const url = await uploadToS3(file, 'rules-regulations', editSection ?? 'singleton')
      setEditFileUrl(url)
      toast.success('File uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleSave() {
    if (!editSection) return
    setSaving(true)
    try {
      const input: Partial<Omit<RulesRegulations, 'documentId' | 'updatedAt'>> = {
        [FILE_KEY[editSection]]: editFileUrl || undefined,
        [TEXT_KEY[editSection]]: editText    || undefined,
      }
      const updated = await rulesRegulationsService.update(input)
      setData(updated)
      toast.success('Saved')
      closeModal()
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  function sectionPreview(key: Section) {
    const fileUrl = data?.[FILE_KEY[key]] as string | undefined
    const text    = data?.[TEXT_KEY[key]] as string | undefined
    if (!fileUrl && !text) {
      return <p className="mt-1.5 text-sm text-slate-400 italic">Not set</p>
    }
    return (
      <div className="mt-2 space-y-1.5">
        {fileUrl && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700"
          >
            <FileText size={13} />
            {fileUrl.split('/').pop()}
            <ExternalLink size={11} />
          </a>
        )}
        {text && (
          <div
            className="text-sm text-slate-600 line-clamp-2"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        )}
      </div>
    )
  }

  const activeMeta = SECTION_META.find(s => s.key === editSection)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Rules &amp; Regulations</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage institutional policies — upload a document or enter content directly
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-brand-500" />
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {SECTION_META.map(({ key, title, description, icon: Icon }) => (
            <div key={key} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={16} className="text-brand-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800">{title}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{description}</p>
                    {sectionPreview(key)}
                  </div>
                </div>
                <button
                  onClick={() => openEdit(key)}
                  className="btn-secondary flex items-center gap-2 shrink-0 text-sm"
                >
                  <Edit2 size={14} /> Edit
                </button>
              </div>
            </div>
          ))}

          {data?.updatedAt && (
            <p className="text-xs text-slate-400 text-right">
              Last updated {new Date(data.updatedAt).toLocaleString('en-IN')}
            </p>
          )}
        </div>
      )}

      {/* Edit Modal — same layout for all three sections */}
      <Modal
        open={editSection !== null}
        onClose={closeModal}
        title={activeMeta ? `Edit ${activeMeta.title}` : ''}
        size="lg"
      >
        <div className="space-y-5">
          {/* File upload */}
          <FormField label="Upload File" hint="PDF or TXT, max 2 MB">
            <div className="space-y-2">
              {editFileUrl && (
                <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                  <FileText size={14} className="text-brand-500 shrink-0" />
                  <span className="truncate text-xs text-slate-600 flex-1">
                    {editFileUrl.split('/').pop()}
                  </span>
                  <a
                    href={editFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:text-brand-700 shrink-0"
                  >
                    <ExternalLink size={13} />
                  </a>
                  <button
                    type="button"
                    onClick={() => setEditFileUrl('')}
                    className="text-slate-400 hover:text-red-500 shrink-0 text-xs"
                  >
                    Remove
                  </button>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploading ? 'Uploading…' : editFileUrl ? 'Replace File' : 'Upload PDF / TXT'}
              </button>
            </div>
          </FormField>

          {/* Divider */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="flex-1 border-t border-slate-200" />
            <span>or enter content directly</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Text area */}
          {activeMeta && (
            <FormField label={activeMeta.textLabel} hint="Plain text or HTML">
              <textarea
                className="input-field resize-y"
                rows={10}
                value={editText}
                onChange={e => setEditText(e.target.value)}
                placeholder={activeMeta.textPlaceholder}
              />
            </FormField>
          )}
        </div>

        <ModalFooter>
          <button className="btn-secondary" onClick={closeModal}>Cancel</button>
          <button
            className="btn-primary flex items-center gap-2"
            onClick={handleSave}
            disabled={saving || uploading}
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            <Save size={14} />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
