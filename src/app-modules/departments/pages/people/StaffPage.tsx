import { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Edit2, Trash2, Upload, X, Loader2 } from 'lucide-react'
import { deptPeopleService } from '@/app-modules/departments/api/deptPeopleApi'
import type { DeptStaff } from '@/shared/types/models'
import { useToast } from '@/shared/context/ToastContext'
import { uploadToS3 } from '@/shared/utils/s3Upload'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useDepartmentSectionAsync } from '@/app-modules/departments/hooks/useDepartmentSection'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useCallback } from 'react'

type StaffType = 'supporting' | 'technical'

type Form = {
  name: string
  designation: string
  staffType: StaffType
  imageUrl: string
  order: string
}

const blank = (staffType: StaffType): Form => ({
  name: '', designation: '', staffType, imageUrl: '', order: '',
})

const TABS: { key: StaffType; label: string }[] = [
  { key: 'supporting', label: 'Supporting Staff' },
  { key: 'technical',  label: 'Technical Staff'  },
]

export default function StaffPage() {
  const { deptId } = useParams<{ deptId: string }>()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<StaffType>('supporting')

  const loader = useCallback(
    () => deptPeopleService.getStaff(deptId!),
    [deptId],
  )
  const { data, reload } = useDepartmentSectionAsync(loader)

  const [modalOpen, setModalOpen]           = useState(false)
  const [editItem, setEditItem]             = useState<DeptStaff | null>(null)
  const [form, setForm]                     = useState<Form>(blank('supporting'))
  const [saving, setSaving]                 = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const photoRef                            = useRef<HTMLInputElement>(null)
  const deleteDialog                        = useConfirmDialog()
  const [insertConfirmOpen, setInsertConfirmOpen] = useState(false)

  const tabData = data.filter(s => s.staffType === activeTab)

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploadingPhoto(true)
    try {
      const entityId = editItem?.id ?? `tmp-${Date.now()}`
      const url = await uploadToS3(file, 'dept-staff', entityId)
      setForm(f => ({ ...f, imageUrl: url }))
    } catch {
      toast.error('Photo upload failed')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const openAdd = () => {
    setEditItem(null)
    setForm(blank(activeTab))
    setModalOpen(true)
  }

  const openEdit = (item: DeptStaff) => {
    setEditItem(item)
    setForm({
      name:        item.name,
      designation: item.designation,
      staffType:   item.staffType,
      imageUrl:    item.imageUrl ?? '',
      order:       item.order !== undefined ? String(item.order) : '',
    })
    setModalOpen(true)
  }

  async function handleSave(insertMode = false) {
    if (!form.name.trim() || !form.designation.trim()) {
      toast.error('Name and designation are required')
      return
    }

    const enteredOrder = form.order !== '' ? Number(form.order) : undefined
    if (!insertMode && enteredOrder !== undefined) {
      const conflict = data.find(s => s.staffType === form.staffType && s.order === enteredOrder && s.id !== editItem?.id)
      if (conflict) { setInsertConfirmOpen(true); return }
    }

    setSaving(true)
    try {
      const payload = {
        name:        form.name.trim(),
        designation: form.designation.trim(),
        staffType:   form.staffType,
        imageUrl:    form.imageUrl || undefined,
        order:       enteredOrder,
        insertMode:  insertMode || undefined,
      }
      if (editItem) {
        await deptPeopleService.updateStaff(editItem.id, payload)
        toast.success('Staff updated')
      } else {
        await deptPeopleService.createStaff({ ...payload, deptId: deptId! })
        toast.success('Staff added')
      }
      reload()
      setModalOpen(false)
      setInsertConfirmOpen(false)
    } catch {
      toast.error('Failed to save staff')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await deptPeopleService.deleteStaff(deleteDialog.targetId)
      reload()
      deleteDialog.close()
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const columns: Column<DeptStaff>[] = [
    {
      key: 'name', header: 'Staff Member',
      render: r => (
        <div className="flex items-center gap-3">
          {r.imageUrl
            ? <img src={r.imageUrl} alt={r.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
            : <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm shrink-0">{r.name[0]}</div>
          }
          <div>
            <p className="font-medium text-sm">{r.name}</p>
            <p className="text-xs text-slate-400">{r.designation}</p>
          </div>
        </div>
      ),
    },
    { key: 'designation', header: 'Designation', render: r => <span className="text-sm">{r.designation}</span> },
    { key: 'order', header: 'Order', render: r => <span className="text-sm text-slate-500">{r.order ?? '—'}</span> },
    {
      key: 'actions', header: '', className: 'w-16',
      render: r => (
        <div className="flex gap-1">
          <button onClick={e => { e.stopPropagation(); openEdit(r) }} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"><Edit2 size={14} /></button>
          <button onClick={e => { e.stopPropagation(); deleteDialog.open(r.id) }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-display font-bold text-slate-800">Staff</h3>
          <p className="text-sm text-slate-500">{data.length} staff members</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={15} /> Add Staff</button>
      </div>

      <div className="card">
        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                {data.filter(s => s.staffType === tab.key).length}
              </span>
            </button>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={tabData}
          keyExtractor={r => r.id}
          total={tabData.length}
          emptyTitle={`No ${activeTab} staff yet`}
        />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Staff' : 'Add Staff'} size="md">
        <div className="space-y-4">

          <FormField label="Photo">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                {form.imageUrl
                  ? <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                  : <span className="text-base font-bold text-slate-400">{form.name ? form.name[0].toUpperCase() : '?'}</span>
                }
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => photoRef.current?.click()} disabled={uploadingPhoto}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-50">
                  {uploadingPhoto ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  {uploadingPhoto ? 'Uploading…' : 'Upload'}
                </button>
                {form.imageUrl && (
                  <button type="button" onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}
                    className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                )}
              </div>
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </div>
          </FormField>

          <FormField label="Name" required>
            <input className="input-field" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </FormField>

          <FormField label="Designation" required>
            <input className="input-field" value={form.designation}
              onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Staff Type">
              <select className="input-field" value={form.staffType}
                onChange={e => setForm(f => ({ ...f, staffType: e.target.value as StaffType }))}>
                <option value="supporting">Supporting Staff</option>
                <option value="technical">Technical Staff</option>
              </select>
            </FormField>
            <FormField label="Display Order">
              <input className="input-field" type="number" min={1} value={form.order}
                onChange={e => setForm(f => ({ ...f, order: e.target.value }))}
                placeholder={`auto (${data.filter(s => s.staffType === form.staffType).length + 1})`} />
            </FormField>
          </div>

        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary" disabled={saving}>Cancel</button>
          <button onClick={() => handleSave()} className="btn-primary" disabled={saving || uploadingPhoto}>
            {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add Staff'}
          </button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete}
        title="Delete Staff" message="This staff record will be permanently deleted." confirmLabel="Delete" />

      <ConfirmDialog
        open={insertConfirmOpen} onClose={() => setInsertConfirmOpen(false)} onConfirm={() => handleSave(true)}
        title="Order already taken"
        message={`Position ${form.order} is already occupied. Insert here and shift everything from position ${form.order} down by 1?`}
        confirmLabel="Insert & Shift"
      />
    </div>
  )
}
