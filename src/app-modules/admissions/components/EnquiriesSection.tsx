import { useState, useMemo, useEffect } from 'react'
import { Edit2, Plus, Trash2, Save, X } from 'lucide-react'
import clsx from 'clsx'
import { admissionsService } from '../api/admissionsApi'
import {
  useWhyEnquire, useEnquiryCategories, useAdmissionsContacts,
  useInfoBlocks, useEnquiries,
} from '../hooks/useAdmissions'
import type {
  AdmissionsEnquiry, AdmissionsContact,
  WhyEnquire, EnquiryCategory, InfoBlock,
} from '@/shared/types/models'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import SelectFilter from '@/shared/components/filters/SelectFilter'
import SearchBar from '@/shared/components/filters/SearchBar'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useSearch } from '@/shared/hooks/useSearch'
import { usePagination } from '@/shared/hooks/usePagination'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useToast } from '@/shared/context/ToastContext'

// ─── Status colours ───────────────────────────────────────────────────────────

const statusColors: Record<AdmissionsEnquiry['status'], string> = {
  New:       'bg-blue-50 text-blue-700',
  Contacted: 'bg-amber-50 text-amber-700',
  Closed:    'bg-slate-100 text-slate-500',
}

const statusOptions = [
  { value: 'New',       label: 'New' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Closed',    label: 'Closed' },
]

// ─── A. Why Enquire ───────────────────────────────────────────────────────────

function WhyEnquireBlock() {
  const toast = useToast()
  const { data: serverData, loading, reload } = useWhyEnquire()
  const [form, setForm] = useState<WhyEnquire>({ title: '', points: [] })
  const [newPoint, setNewPoint] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (serverData) setForm(serverData) }, [serverData])

  function addPoint() {
    if (!newPoint.trim()) return
    setForm(d => ({ ...d, points: [...d.points, newPoint.trim()] }))
    setNewPoint('')
  }

  function removePoint(idx: number) {
    setForm(d => ({ ...d, points: d.points.filter((_, i) => i !== idx) }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await admissionsService.saveWhyEnquire(form)
      reload()
      toast.success('Why Enquire section saved')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="card p-6 text-center text-sm text-slate-400">Loading…</div>

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">Why Enquire Section</p>
        <button onClick={handleSave} disabled={saving} className="btn-primary text-xs flex items-center gap-1.5">
          <Save size={12} /> {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      <FormField label="Section Title">
        <input className="input-field" value={form.title}
          onChange={e => setForm(d => ({ ...d, title: e.target.value }))}
          placeholder="e.g. Why Enquire With Us?" />
      </FormField>
      <div>
        <label className="label mb-1.5 block">Bullet Points</label>
        <div className="space-y-2 mb-2">
          {form.points.map((pt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0 mt-0.5" />
              <span className="flex-1 text-sm text-slate-700">{pt}</span>
              <button onClick={() => removePoint(idx)} className="p-1 text-slate-300 hover:text-red-500 rounded">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="input-field flex-1 text-sm" value={newPoint}
            onChange={e => setNewPoint(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addPoint()}
            placeholder="Add a point and press Enter..." />
          <button onClick={addPoint} className="btn-secondary text-xs flex items-center gap-1">
            <Plus size={12} /> Add
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── B. Enquiry Categories ────────────────────────────────────────────────────

function EnquiryCategoriesBlock() {
  const toast = useToast()
  const { data: categories, loading, reload } = useEnquiryCategories()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<EnquiryCategory | null>(null)
  const [form, setForm] = useState({ title: '', description: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const deleteDialog = useConfirmDialog()

  function openAdd() { setEditItem(null); setForm({ title: '', description: '' }); setErrors({}); setModalOpen(true) }
  function openEdit(c: EnquiryCategory) { setEditItem(c); setForm({ title: c.title, description: c.description }); setErrors({}); setModalOpen(true) }

  async function handleSave() {
    const e: Record<string, string> = {}
    if (!form.title.trim())       e.title       = 'Required'
    if (!form.description.trim()) e.description = 'Required'
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      if (editItem) await admissionsService.updateEnquiryCategory(editItem.id, form)
      else          await admissionsService.createEnquiryCategory(form)
      reload(); setModalOpen(false); toast.success(editItem ? 'Category updated' : 'Category added')
    } catch {
      toast.error(editItem ? 'Failed to update category' : 'Failed to add category')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await admissionsService.deleteEnquiryCategory(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Category deleted')
    } catch {
      toast.error('Failed to delete category')
    }
  }

  if (loading) return <div className="card p-4 text-center text-sm text-slate-400">Loading…</div>

  return (
    <>
      <div className="card">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Enquiry Categories</p>
          <button onClick={openAdd} className="btn-secondary text-xs flex items-center gap-1"><Plus size={12} /> Add</button>
        </div>
        {categories.length === 0
          ? <p className="px-4 py-4 text-xs text-slate-400">No categories added.</p>
          : (
            <div className="divide-y divide-slate-100">
              {categories.map(c => (
                <div key={c.id} className="px-4 py-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{c.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{c.description}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"><Edit2 size={13} /></button>
                    <button onClick={() => deleteDialog.open(c.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Category' : 'Add Enquiry Category'} size="sm">
        <div className="space-y-4">
          <FormField label="Title" required error={errors.title}>
            <input className="input-field" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Admissions, Scholarships" />
          </FormField>
          <FormField label="Description" required error={errors.description}>
            <textarea className="input-field resize-none h-20" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of this enquiry category..." />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add Category'}
          </button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete}
        title="Delete Category" message="This category will be removed." confirmLabel="Delete" />
    </>
  )
}

// ─── C. Contact Info Cards ────────────────────────────────────────────────────

function ContactsBlock() {
  const toast = useToast()
  const { data: contacts, loading, reload } = useAdmissionsContacts()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<AdmissionsContact | null>(null)
  const [form, setForm] = useState({ name: '', role: '', email: '', phone: '', officeLocation: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  function openEdit(c: AdmissionsContact) {
    setEditItem(c)
    setForm({ name: c.name, role: c.role, email: c.email, phone: c.phone, officeLocation: c.officeLocation })
    setErrors({})
    setModalOpen(true)
  }

  async function handleSave() {
    const e: Record<string, string> = {}
    if (!form.name.trim())  e.name  = 'Required'
    if (!form.email.trim()) e.email = 'Required'
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      if (editItem) await admissionsService.updateContact(editItem.id, form)
      reload(); setModalOpen(false); toast.success('Contact updated')
    } catch {
      toast.error('Failed to update contact')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="card p-4 text-center text-sm text-slate-400">Loading…</div>

  return (
    <>
      <div className="card">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-700">Contact Info Cards</p>
          <p className="text-xs text-slate-400 mt-0.5">Displayed as cards on the public enquiry page.</p>
        </div>
        <div className="divide-y divide-slate-100">
          {contacts.map(c => (
            <div key={c.id} className="px-4 py-3 flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm shrink-0">
                {c.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{c.name}</p>
                <p className="text-xs text-slate-500">{c.role}</p>
                <p className="text-xs text-slate-400 mt-0.5">{c.email} · {c.phone}</p>
                {c.officeLocation && <p className="text-xs text-slate-400">{c.officeLocation}</p>}
              </div>
              <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg">
                <Edit2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Edit Contact" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Name" required error={errors.name}>
              <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </FormField>
            <FormField label="Role">
              <input className="input-field" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email" required error={errors.email}>
              <input type="email" className="input-field" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </FormField>
            <FormField label="Phone">
              <input className="input-field" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </FormField>
          </div>
          <FormField label="Office Location" hint="Optional">
            <input className="input-field" value={form.officeLocation} onChange={e => setForm(f => ({ ...f, officeLocation: e.target.value }))}
              placeholder="e.g. Admin Block, Room 102" />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </ModalFooter>
      </Modal>
    </>
  )
}

// ─── D. Info Blocks ───────────────────────────────────────────────────────────

const INFO_TYPES: InfoBlock['type'][] = ['Phone', 'Office Hours', 'Email']

function InfoBlocksSection() {
  const toast = useToast()
  const { data: blocks, loading, reload } = useInfoBlocks()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<InfoBlock | null>(null)
  const [form, setForm] = useState<Omit<InfoBlock, 'id'>>({ type: 'Phone', description: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const deleteDialog = useConfirmDialog()

  function openAdd() { setEditItem(null); setForm({ type: 'Phone', description: '' }); setErrors({}); setModalOpen(true) }
  function openEdit(b: InfoBlock) { setEditItem(b); setForm({ type: b.type, description: b.description }); setErrors({}); setModalOpen(true) }

  async function handleSave() {
    const e: Record<string, string> = {}
    if (!form.description.trim()) e.description = 'Required'
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      if (editItem) await admissionsService.updateInfoBlock(editItem.id, form)
      else          await admissionsService.createInfoBlock(form)
      reload(); setModalOpen(false); toast.success(editItem ? 'Block updated' : 'Block added')
    } catch {
      toast.error(editItem ? 'Failed to update block' : 'Failed to add block')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await admissionsService.deleteInfoBlock(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Block deleted')
    } catch {
      toast.error('Failed to delete block')
    }
  }

  const typeIcon: Record<InfoBlock['type'], string> = {
    Phone: '📞', 'Office Hours': '🕘', Email: '✉️',
  }

  if (loading) return <div className="card p-4 text-center text-sm text-slate-400">Loading…</div>

  return (
    <>
      <div className="card">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Info Blocks</p>
          <button onClick={openAdd} className="btn-secondary text-xs flex items-center gap-1"><Plus size={12} /> Add</button>
        </div>
        {blocks.length === 0
          ? <p className="px-4 py-4 text-xs text-slate-400">No info blocks added.</p>
          : (
            <div className="divide-y divide-slate-100">
              {blocks.map(b => (
                <div key={b.id} className="px-4 py-3 flex items-center gap-3">
                  <span className="text-base shrink-0">{typeIcon[b.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{b.type}</p>
                    <p className="text-sm text-slate-700 mt-0.5">{b.description}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(b)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"><Edit2 size={13} /></button>
                    <button onClick={() => deleteDialog.open(b.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Info Block' : 'Add Info Block'} size="sm">
        <div className="space-y-4">
          <FormField label="Type" required>
            <select className="input-field" value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value as InfoBlock['type'] }))}>
              {INFO_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>
          <FormField label="Description" required error={errors.description}>
            <input className="input-field" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="e.g. +91 8482 226001, Mon–Fri 9am–5pm" />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add Block'}
          </button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete}
        title="Delete Info Block" message="This info block will be removed." confirmLabel="Delete" />
    </>
  )
}

// ─── Submissions table ────────────────────────────────────────────────────────

function SubmissionsTable() {
  const toast = useToast()
  const { data: enquiries, loading, reload } = useEnquiries()
  const [statusFilter, setStatusFilter] = useState('')
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()

  async function updateStatus(id: string, status: AdmissionsEnquiry['status']) {
    try {
      await admissionsService.updateEnquiryStatus(id, status)
      reload()
      toast.success(`Status updated to ${status}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  const filtered = useMemo(() => enquiries.filter(e => {
    const q = debouncedSearch.toLowerCase()
    return (
      (!q || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)) &&
      (!statusFilter || e.status === statusFilter)
    )
  }), [enquiries, debouncedSearch, statusFilter])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)
  const newCount = enquiries.filter(e => e.status === 'New').length

  const columns: Column<AdmissionsEnquiry>[] = [
    {
      key: 'name', header: 'Applicant',
      render: r => (
        <div>
          <p className="font-medium text-slate-800 text-sm">{r.name}</p>
          <p className="text-xs text-slate-400">{r.email}</p>
        </div>
      ),
    },
    { key: 'phone',    header: 'Phone',    render: r => <span className="text-sm">{r.phone}</span> },
    { key: 'category', header: 'Category', render: r => <span className="badge badge-gray text-xs">{r.category}</span> },
    { key: 'message',  header: 'Message',  render: r => <p className="text-xs text-slate-500 line-clamp-2 max-w-xs">{r.message}</p> },
    {
      key: 'status', header: 'Status',
      render: r => (
        <select
          value={r.status}
          onChange={e => updateStatus(r.id, e.target.value as AdmissionsEnquiry['status'])}
          className={clsx('text-xs font-semibold px-2 py-1 rounded-md border-0 cursor-pointer', statusColors[r.status])}
        >
          {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ),
    },
    {
      key: 'createdAt', header: 'Received',
      render: r => <span className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>,
    },
  ]

  if (loading) return <div className="card p-8 text-center text-sm text-slate-400">Loading…</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">
          Submissions
          {newCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">{newCount} new</span>
          )}
        </p>
      </div>
      <div className="card">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <SearchBar value={searchTerm} onChange={v => { setSearchTerm(v); resetPage() }} placeholder="Search enquiries..." className="max-w-xs" />
          <SelectFilter value={statusFilter} onChange={v => { setStatusFilter(v); resetPage() }} options={statusOptions} placeholder="All Statuses" />
        </div>
        <DataTable
          columns={columns} data={paginated} keyExtractor={r => r.id}
          total={filtered.length} page={page} limit={limit} onPageChange={setPage}
          emptyTitle="No enquiries found"
        />
      </div>
    </div>
  )
}

// ─── Main Section (tabs: Page Content | Submissions) ─────────────────────────

type Tab = 'content' | 'submissions'

export default function EnquiriesSection() {
  const [tab, setTab] = useState<Tab>('content')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'content',     label: 'Page Content' },
    { id: 'submissions', label: 'Submissions' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-slate-800">Enquiry Management</h3>
        <p className="text-xs text-slate-500 mt-0.5">Manage the enquiry page content and view submissions.</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.id
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-700',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'content' && (
        <div className="space-y-5">
          <WhyEnquireBlock />
          <EnquiryCategoriesBlock />
          <ContactsBlock />
          <InfoBlocksSection />
        </div>
      )}

      {tab === 'submissions' && <SubmissionsTable />}
    </div>
  )
}
