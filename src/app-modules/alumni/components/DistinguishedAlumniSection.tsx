import { useState, useMemo, useRef } from 'react'
import { Plus, Edit2, Trash2, Save, X, Upload, Loader2, Star, ExternalLink } from 'lucide-react'
import clsx from 'clsx'
import { useDistinguishedAlumni } from '../hooks/useAlumni'
import { alumniService } from '../api/alumniApi'
import type { DistinguishedAlumniEntry } from '@/shared/types/models'
import { ALUMNI_DEPARTMENTS, DEPARTMENT_FILTER_OPTIONS } from '@/shared/constants/departments'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useToast } from '@/shared/context/ToastContext'
import Badge from '@/shared/components/common/Badge'
import SearchBar from '@/shared/components/filters/SearchBar'
import { useSearch } from '@/shared/hooks/useSearch'
import { usePagination } from '@/shared/hooks/usePagination'
import { uploadToS3 } from '@/shared/utils/s3Upload'
import { validateImageFile } from '@/shared/utils/validateFile'

const emptyForm: Omit<DistinguishedAlumniEntry, 'id'> = {
  name: '',
  department: '',
  batchYear: new Date().getFullYear() - 10,
  currentRole: '',
  company: '',
  linkedinUrl: '',
  isFeatured: false,
  isActive: true,
}

export default function DistinguishedAlumniSection() {
  const toast = useToast()
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [featuredFilter, setFeaturedFilter] = useState<'' | 'featured'>('')
  const { alumni, loading, reload } = useDistinguishedAlumni({
    department: departmentFilter || undefined,
    featured: featuredFilter === 'featured' || undefined,
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<DistinguishedAlumniEntry | null>(null)
  const [form, setForm] = useState<Omit<DistinguishedAlumniEntry, 'id'>>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const deleteDialog = useConfirmDialog()
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()

  const filtered = useMemo(() => {
    if (!debouncedSearch) return alumni
    const q = debouncedSearch.toLowerCase()
    return alumni.filter(
      a =>
        a.name.toLowerCase().includes(q) ||
        a.currentRole.toLowerCase().includes(q) ||
        a.company.toLowerCase().includes(q)
    )
  }, [alumni, debouncedSearch])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)

  const columns: Column<DistinguishedAlumniEntry>[] = [
    {
      key: 'name',
      header: 'Alumnus',
      render: r => (
        <div className="flex items-center gap-3">
          {r.profileImage ? (
            <img src={r.profileImage} alt={r.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
              {r.name[0]}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-sm text-slate-800">{r.name}</span>
              {r.isFeatured && <Star size={12} className="text-amber-500 fill-amber-500" />}
            </div>
            <span className="text-xs text-slate-500">Batch {r.batchYear}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: r => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
          {r.department}
        </span>
      ),
    },
    {
      key: 'role',
      header: 'Current Role',
      render: r => (
        <div className="text-sm">
          <span className="font-medium text-slate-700">{r.currentRole}</span>
          <span className="text-slate-400"> @ </span>
          <span className="text-slate-600">{r.company}</span>
        </div>
      ),
    },
    {
      key: 'linkedin',
      header: '',
      className: 'w-12',
      render: r =>
        r.linkedinUrl ? (
          <a
            href={r.linkedinUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg inline-flex"
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink size={14} />
          </a>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      key: 'isActive',
      header: 'Status',
      className: 'w-24',
      render: r => (
        <Badge variant={r.isActive ? 'green' : 'gray'} className="text-xs">
          {r.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-20',
      render: r => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg">
            <Edit2 size={14} />
          </button>
          <button onClick={() => deleteDialog.open(r.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  function openAdd() {
    setEditItem(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(item: DistinguishedAlumniEntry) {
    setEditItem(item)
    setForm({
      name: item.name,
      department: item.department,
      batchYear: item.batchYear,
      currentRole: item.currentRole,
      company: item.company,
      linkedinUrl: item.linkedinUrl || '',
      isFeatured: item.isFeatured,
      isActive: item.isActive,
    })
    setModalOpen(true)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const error = validateImageFile(file)
    if (error) {
      toast.error(error)
      e.target.value = ''
      return
    }

    const localUrl = URL.createObjectURL(file)
    setForm(f => ({ ...f, profileImage: localUrl }))
    setUploadingImage(true)

    try {
      const alumnusId = editItem?.id || `tmp-${Date.now()}`
      const s3Url = await uploadToS3(file, 'alumni-distinguished', alumnusId)
      setForm(f => ({ ...f, profileImage: s3Url }))
      toast.success('Image uploaded')
    } catch {
      toast.error('Upload failed')
      setForm(f => ({ ...f, profileImage: undefined }))
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  async function handleSave() {
    if (!form.name.trim() || !form.department || !form.currentRole.trim() || !form.company.trim()) {
      toast.error('Please fill all required fields')
      return
    }
    setSaving(true)
    try {
      if (editItem) {
        await alumniService.updateDistinguishedAlumnus(editItem.id, form)
        toast.success('Distinguished alumnus updated')
      } else {
        await alumniService.createDistinguishedAlumnus(form)
        toast.success('Distinguished alumnus added')
      }
      await reload()
      setModalOpen(false)
    } catch {
      toast.error(editItem ? 'Failed to update' : 'Failed to add')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await alumniService.deleteDistinguishedAlumnus(deleteDialog.targetId)
      deleteDialog.close()
      await reload()
      toast.success('Alumnus removed')
    } catch {
      toast.error('Failed to delete')
    }
  }

  if (loading) {
    return <div className="card p-8 text-center text-sm text-slate-400">Loading…</div>
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Distinguished Alumni</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {filtered.length} alumni • {alumni.filter(a => a.isFeatured).length} featured
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={14} /> Add Alumnus
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <SearchBar
            value={searchTerm}
            onChange={v => {
              setSearchTerm(v)
              resetPage()
            }}
            placeholder="Search distinguished alumni…"
            className="max-w-sm"
          />
          <div className="flex items-center gap-3 shrink-0">
            <select
              className="input-field text-sm py-1.5"
              value={departmentFilter}
              onChange={e => {
                setDepartmentFilter(e.target.value)
                resetPage()
              }}
            >
              {DEPARTMENT_FILTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select
              className="input-field text-sm py-1.5"
              value={featuredFilter}
              onChange={e => {
                setFeaturedFilter(e.target.value as '' | 'featured')
                resetPage()
              }}
            >
              <option value="">All Alumni</option>
              <option value="featured">⭐ Featured Only</option>
            </select>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={paginated}
          keyExtractor={r => r.id}
          total={filtered.length}
          page={page}
          limit={limit}
          onPageChange={setPage}
          emptyTitle="No distinguished alumni yet"
          emptyDescription="Add notable alumni from each department. They will be displayed under their respective departments."
        />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Distinguished Alumnus' : 'Add Distinguished Alumnus'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Name" required>
              <input
                className="input-field"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. John Doe"
              />
            </FormField>
            <FormField label="Department" required>
              <select
                className="input-field"
                value={form.department}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
              >
                <option value="">Select Department</option>
                {ALUMNI_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Batch Year" required>
              <input
                className="input-field"
                type="number"
                value={form.batchYear}
                onChange={e => setForm(f => ({ ...f, batchYear: parseInt(e.target.value) || 0 }))}
                placeholder="e.g. 2010"
              />
            </FormField>
            <FormField label="LinkedIn URL" hint="Optional">
              <div className="flex gap-2">
                <input
                  className="input-field flex-1"
                  value={form.linkedinUrl}
                  onChange={e => setForm(f => ({ ...f, linkedinUrl: e.target.value }))}
                  placeholder="https://linkedin.com/in/…"
                />
                {form.linkedinUrl && (
                  <a
                    href={form.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <ExternalLink size={14} /> Test
                  </a>
                )}
              </div>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Current Role" required>
              <input
                className="input-field"
                value={form.currentRole}
                onChange={e => setForm(f => ({ ...f, currentRole: e.target.value }))}
                placeholder="e.g. Senior Software Engineer"
              />
            </FormField>
            <FormField label="Company" required>
              <input
                className="input-field"
                value={form.company}
                onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                placeholder="e.g. Google, Microsoft"
              />
            </FormField>
          </div>
          <FormField label="Profile Photo" hint="Optional - shows on featured cards">
            <div className="flex items-start gap-3">
              <div
                className={clsx(
                  'w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center shrink-0 overflow-hidden bg-slate-50',
                  form.profileImage ? 'border-slate-200' : 'border-slate-300'
                )}
              >
                {form.profileImage ? (
                  <img src={form.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xl font-bold">{form.name ? form.name[0] : '?'}</div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadingImage}
                    className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
                  >
                    {uploadingImage ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Upload size={12} />
                    )}
                    {uploadingImage ? 'Uploading…' : form.profileImage ? 'Replace' : 'Upload'}
                  </button>
                  {form.profileImage && !uploadingImage && (
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, profileImage: undefined }))}
                      className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X size={12} /> Remove
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-400">JPEG/PNG, max 2MB. Recommended: 400x400px</p>
              </div>
            </div>
          </FormField>
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))}
                className="rounded border-slate-300"
              />
              <span className="text-sm text-slate-600 flex items-center gap-1">
                <Star size={14} className="text-amber-500" /> Featured (show on homepage)
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                className="rounded border-slate-300"
              />
              <span className="text-sm text-slate-600">Active (visible on website)</span>
            </label>
          </div>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary" disabled={saving}>
            <X size={14} /> Cancel
          </button>
          <button onClick={handleSave} className="btn-primary" disabled={saving || uploadingImage}>
            <Save size={14} /> {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add Alumnus'}
          </button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDelete}
        title="Remove Distinguished Alumnus"
        message="This alumnus will be permanently removed from the distinguished list."
        confirmLabel="Remove"
      />
    </div>
  )
}
