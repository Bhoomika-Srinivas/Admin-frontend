import { useState, useMemo } from 'react'
import { Plus, Edit2, Trash2, Trophy, Loader2 } from 'lucide-react'
import { rankHolderService } from '../api/academicsApi'
import { useRankHolders } from '../hooks/useAcademics'
import type { RankHolder } from '../types'
import { useToast } from '@/shared/context/ToastContext'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import SearchBar from '@/shared/components/filters/SearchBar'
import SelectFilter from '@/shared/components/filters/SelectFilter'
import clsx from 'clsx'

type FormData = Omit<RankHolder, 'rankId' | 'createdAt'>

const emptyForm: FormData = {
  year: '',
  program: 'UG',
  usn: '',
  studentName: '',
  branch: '',
  rank: '',
  rankOrder: 1,
}

const PROGRAM_OPTIONS = [
  { value: 'all', label: 'All Programs' },
  { value: 'UG',  label: 'UG'           },
  { value: 'PG',  label: 'PG'           },
]

export default function RankHoldersPage() {
  const toast = useToast()
  const { entries, loading, reload }      = useRankHolders()
  const [search, setSearch]               = useState('')
  const [filterYear, setFilterYear]       = useState('all')
  const [filterProgram, setFilterProgram] = useState('all')
  const [modalOpen, setModalOpen]         = useState(false)
  const [editItem, setEditItem]           = useState<RankHolder | null>(null)
  const [form, setForm]                   = useState<FormData>(emptyForm)
  const [saving, setSaving]               = useState(false)
  const deleteDialog                      = useConfirmDialog()

  const years = useMemo(
    () => Array.from(new Set(entries.map(e => e.year))).sort((a, b) => b.localeCompare(a)),
    [entries]
  )

  const yearFilterOptions = useMemo(
    () => [{ value: 'all', label: 'All Years' }, ...years.map(y => ({ value: y, label: y }))],
    [years]
  )

  const filtered = useMemo(() => {
    let r = entries
    if (filterYear    !== 'all') r = r.filter(e => e.year    === filterYear)
    if (filterProgram !== 'all') r = r.filter(e => e.program === filterProgram)
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(e =>
        e.studentName.toLowerCase().includes(q) ||
        e.usn.toLowerCase().includes(q) ||
        e.branch.toLowerCase().includes(q)
      )
    }
    return r.slice().sort((a, b) => {
      if (a.year !== b.year) return b.year.localeCompare(a.year)
      if (a.program !== b.program) return a.program.localeCompare(b.program)
      return a.rankOrder - b.rankOrder
    })
  }, [entries, filterYear, filterProgram, search])

  function openAdd() {
    setEditItem(null)
    setForm({
      ...emptyForm,
      year:    filterYear    !== 'all' ? filterYear    : '',
      program: filterProgram !== 'all' ? filterProgram as 'UG' | 'PG' : 'UG',
    })
    setModalOpen(true)
  }

  function openEdit(item: RankHolder) {
    setEditItem(item)
    setForm({
      year:        item.year,
      program:     item.program,
      usn:         item.usn,
      studentName: item.studentName,
      branch:      item.branch,
      rank:        item.rank,
      rankOrder:   item.rankOrder,
    })
    setModalOpen(true)
  }

  function closeModal() { setModalOpen(false); setEditItem(null) }

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!form.studentName.trim()) { toast.error('Student name is required'); return }
    if (!form.usn.trim())         { toast.error('USN is required'); return }
    if (!form.year.trim() || !/^\d{4}-\d{2}$/.test(form.year)) {
      toast.error('Year must be in format 2024-25'); return
    }
    if (!form.branch.trim()) { toast.error('Branch is required'); return }
    if (!form.rank.trim())   { toast.error('Rank is required'); return }
    if (form.rankOrder < 1)  { toast.error('Rank order must be a positive number'); return }

    setSaving(true)
    try {
      if (editItem) {
        await rankHolderService.update(editItem.rankId, form)
        toast.success('Rank holder updated')
      } else {
        await rankHolderService.create(form)
        toast.success('Rank holder added')
      }
      await reload()
      closeModal()
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await rankHolderService.delete(deleteDialog.targetId)
      toast.success('Removed')
      deleteDialog.close()
      await reload()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const deletingItem = entries.find(e => e.rankId === deleteDialog.targetId)

  const columns: Column<RankHolder>[] = [
    {
      key: 'rank',
      header: 'Rank',
      render: r => (
        <span className={clsx(
          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ring-1',
          r.rankOrder === 1 ? 'bg-amber-50 text-amber-700 ring-amber-200'  :
          r.rankOrder === 2 ? 'bg-slate-100 text-slate-600 ring-slate-200' :
          r.rankOrder === 3 ? 'bg-orange-50 text-orange-700 ring-orange-200' :
                              'bg-slate-50 text-slate-500 ring-slate-200'
        )}>
          {r.rankOrder <= 3 && <Trophy size={10} />}
          {r.rank}
        </span>
      ),
    },
    {
      key: 'studentName',
      header: 'Student Name',
      render: r => <span className="font-medium text-slate-800">{r.studentName}</span>,
    },
    {
      key: 'usn',
      header: 'USN',
      render: r => <span className="font-mono text-sm text-slate-600">{r.usn}</span>,
    },
    { key: 'branch', header: 'Branch' },
    {
      key: 'program',
      header: 'Program',
      render: r => (
        <span className={clsx(
          'text-xs px-2 py-0.5 rounded-full font-medium ring-1',
          r.program === 'UG'
            ? 'bg-amber-50 text-amber-700 ring-amber-200'
            : 'bg-sky-50 text-sky-700 ring-sky-200'
        )}>
          {r.program}
        </span>
      ),
    },
    { key: 'year', header: 'Year', className: 'text-slate-500 text-sm' },
    {
      key: '_actions',
      header: '',
      render: r => (
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => openEdit(r)}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => deleteDialog.open(r.rankId)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Rank Holders</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {entries.length} student{entries.length !== 1 ? 's' : ''} •{' '}
            {entries.filter(e => e.program === 'UG').length} UG •{' '}
            {entries.filter(e => e.program === 'PG').length} PG
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 shrink-0">
          <Plus size={16} /> Add Rank Holder
        </button>
      </div>

      {/* Filter row */}
      <div className="flex items-center justify-between gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, USN, branch…" className="max-w-xs" />
        <div className="flex items-center gap-3 shrink-0">
          <SelectFilter value={filterYear}    onChange={setFilterYear}    options={yearFilterOptions} />
          <SelectFilter value={filterProgram} onChange={setFilterProgram} options={PROGRAM_OPTIONS}   />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-brand-500" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          keyExtractor={r => r.rankId}
          emptyTitle="No rank holders found"
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editItem ? 'Edit Rank Holder' : 'Add Rank Holder'}
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Year" required hint='e.g. "2024-25"'>
              <input
                className="input-field"
                value={form.year}
                onChange={e => setField('year', e.target.value)}
                placeholder="2024-25"
              />
            </FormField>
            <FormField label="Program" required>
              <select className="input-field" value={form.program} onChange={e => setField('program', e.target.value as 'UG' | 'PG')}>
                <option value="UG">UG</option>
                <option value="PG">PG</option>
              </select>
            </FormField>
          </div>

          <FormField label="Student Name" required>
            <input
              className="input-field"
              value={form.studentName}
              onChange={e => setField('studentName', e.target.value)}
              placeholder="Full name"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="USN" required>
              <input
                className="input-field font-mono"
                value={form.usn}
                onChange={e => setField('usn', e.target.value.toUpperCase())}
                placeholder="1BIE22CS001"
              />
            </FormField>
            <FormField label="Branch" required>
              <input
                className="input-field"
                value={form.branch}
                onChange={e => setField('branch', e.target.value.toUpperCase())}
                placeholder="CSE"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Rank (Display)" required hint='e.g. "1", "I", "Gold Medal"'>
              <input
                className="input-field"
                value={form.rank}
                onChange={e => setField('rank', e.target.value)}
                placeholder="1"
              />
            </FormField>
            <FormField label="Rank Order" required hint="Numeric sort order (1 = highest)">
              <input
                type="number"
                min={1}
                className="input-field"
                value={form.rankOrder}
                onChange={e => setField('rankOrder', Math.max(1, parseInt(e.target.value) || 1))}
              />
            </FormField>
          </div>
        </div>
        <ModalFooter>
          <button className="btn-secondary" onClick={closeModal}>Cancel</button>
          <button
            className="btn-primary flex items-center gap-2"
            onClick={handleSave}
            disabled={saving}
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? 'Saving…' : editItem ? 'Update' : 'Add'}
          </button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDelete}
        title="Remove Rank Holder"
        message={`Remove ${deletingItem?.studentName} from rank holders? This cannot be undone.`}
      />
    </div>
  )
}
