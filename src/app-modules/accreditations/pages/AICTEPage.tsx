import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Edit2, Trash2, ChevronLeft, ExternalLink, AlertCircle } from 'lucide-react'
import { useAccreditations } from '../hooks/useAccreditations'
import { accreditationService } from '../api/accreditationsApi'
import AccreditationFormModal from '../components/AccreditationFormModal'
import type { AccreditationRecord } from '@/shared/types/models'
import { useToast } from '@/shared/context/ToastContext'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import SearchBar from '@/shared/components/filters/SearchBar'
import SelectFilter from '@/shared/components/filters/SelectFilter'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useSearch } from '@/shared/hooks/useSearch'
import { usePagination } from '@/shared/hooks/usePagination'
import { AICTE_SECTIONS } from '../config'

// ── Types ─────────────────────────────────────────────────────────────────────
type AICTESection = 'EOA' | 'IDEA LAB' | 'SPICES'

// ── Sub-table component ────────────────────────────────────────────────────────
interface SubTableProps {
  subSection: string
  onAdd: () => void
  onEdit: (r: AccreditationRecord) => void
  onDelete: (id: string) => void
  searchQ: string
}

function SpicesSubTable({ subSection, onAdd, onEdit, onDelete, searchQ }: SubTableProps) {
  const { data, loading, error, reload } = useAccreditations({
    type: 'AICTE',
    section: 'SPICES',
    sub_section: subSection,
  })

  const filtered = useMemo(() => {
    const q = searchQ.toLowerCase()
    return data.filter(r => !q || r.title.toLowerCase().includes(q))
  }, [data, searchQ])

  const { page, setPage, limit, data: paginated } = usePagination(filtered)

  const columns: Column<AccreditationRecord>[] = [
    {
      key: 'title',
      header: 'Title',
      render: r => <span className="font-medium text-sm text-slate-800">{r.title}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-28',
      render: r => (
        <div className="flex gap-1 justify-end">
          <button
            onClick={() => window.open(r.file_url, '_blank')}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
            title="View file"
          >
            <ExternalLink size={14} />
          </button>
          <button
            onClick={() => onEdit(r)}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(r.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  if (error) return (
    <div className="p-6 flex items-center gap-2 text-red-500 text-sm">
      <AlertCircle size={16} />
      <span>{error.message}</span>
      <button onClick={reload} className="btn-secondary ml-2">Retry</button>
    </div>
  )

  return (
    <div className="card">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">{subSection}</h3>
        <button onClick={onAdd} className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3">
          <Plus size={13} /> Add
        </button>
      </div>
      <DataTable
        columns={columns}
        data={paginated}
        keyExtractor={r => r.id}
        total={filtered.length}
        page={page}
        limit={limit}
        onPageChange={setPage}
        loading={loading}
        emptyTitle={`No ${subSection}`}
        emptyDescription="Add a record using the button above."
      />
    </div>
  )
}

// ── EOA section ───────────────────────────────────────────────────────────────
function EOASection() {
  const toast = useToast()
  const { data, loading, error, reload } = useAccreditations({ type: 'AICTE', section: 'EOA' })
  const deleteDialog = useConfirmDialog()
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()
  const [yearFilter, setYearFilter] = useState('')
  const [programFilter, setProgramFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<AccreditationRecord | null>(null)

  const years = useMemo(() =>
    [...new Set(data.map(r => r.year).filter(Boolean))].sort((a, b) => b!.localeCompare(a!)) as string[],
  [data])

  const programs = useMemo(() =>
    [...new Set(data.map(r => r.program).filter(Boolean))] as string[],
  [data])

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    return data.filter(r =>
      (!q || r.title.toLowerCase().includes(q)) &&
      (!yearFilter || r.year === yearFilter) &&
      (!programFilter || r.program === programFilter)
    )
  }, [data, debouncedSearch, yearFilter, programFilter])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await accreditationService.delete(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Deleted')
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to delete') }
  }

  const columns: Column<AccreditationRecord>[] = [
    {
      key: 'title',
      header: 'Title',
      render: r => <span className="font-medium text-sm text-slate-800">{r.title}</span>,
    },
    {
      key: 'year',
      header: 'Year',
      render: r => <span className="text-sm text-slate-500">{r.year ?? '—'}</span>,
    },
    {
      key: 'program',
      header: 'Program',
      render: r => r.program ? (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          {r.program}
        </span>
      ) : <span className="text-slate-400 text-sm">—</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-28',
      render: r => (
        <div className="flex gap-1 justify-end">
          <button
            onClick={() => window.open(r.file_url, '_blank')}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
            title="View file"
          >
            <ExternalLink size={14} />
          </button>
          <button
            onClick={() => { setEditItem(r); setModalOpen(true) }}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => deleteDialog.open(r.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  if (error) return (
    <div className="card p-12 flex flex-col items-center text-center gap-3">
      <AlertCircle size={24} className="text-red-400" />
      <p className="text-sm text-red-600">{error.message}</p>
      <button onClick={reload} className="btn-secondary">Retry</button>
    </div>
  )

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-slate-500">Extension of Approval letters from AICTE</p>
        </div>
        <button onClick={() => { setEditItem(null); setModalOpen(true) }} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> Add Record
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <SearchBar
            value={searchTerm}
            onChange={v => { setSearchTerm(v); resetPage() }}
            placeholder="Search EOA records..."
            className="max-w-xs"
          />
          <div className="flex items-center gap-3 shrink-0">
            <SelectFilter
              value={programFilter}
              onChange={v => { setProgramFilter(v); resetPage() }}
              options={programs.map(p => ({ value: p, label: p }))}
              placeholder="All Programs"
              className="w-36"
            />
            <SelectFilter
              value={yearFilter}
              onChange={v => { setYearFilter(v); resetPage() }}
              options={years.map(y => ({ value: y, label: y }))}
              placeholder="All Years"
              className="w-36"
            />
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
          loading={loading}
          emptyTitle="No EOA records"
          emptyDescription="Add a record using the button above."
        />
      </div>

      <AccreditationFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => { reload(); setModalOpen(false) }}
        type="AICTE"
        section="EOA"
        editItem={editItem}
      />

      <ConfirmDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDelete}
        title="Delete Record"
        message="This record will be permanently deleted."
        confirmLabel="Delete"
      />
    </>
  )
}

// ── IDEA LAB section ──────────────────────────────────────────────────────────
function IdeaLabSection() {
  const toast = useToast()
  const { data, loading, error, reload } = useAccreditations({ type: 'AICTE', section: 'IDEA LAB' })
  const deleteDialog = useConfirmDialog()
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<AccreditationRecord | null>(null)

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    return data.filter(r => !q || r.title.toLowerCase().includes(q))
  }, [data, debouncedSearch])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await accreditationService.delete(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Deleted')
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to delete') }
  }

  const columns: Column<AccreditationRecord>[] = [
    {
      key: 'title',
      header: 'Title',
      render: r => <span className="font-medium text-sm text-slate-800">{r.title}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-28',
      render: r => (
        <div className="flex gap-1 justify-end">
          <button
            onClick={() => window.open(r.file_url, '_blank')}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
            title="View file"
          >
            <ExternalLink size={14} />
          </button>
          <button
            onClick={() => { setEditItem(r); setModalOpen(true) }}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => deleteDialog.open(r.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  if (error) return (
    <div className="card p-12 flex flex-col items-center text-center gap-3">
      <AlertCircle size={24} className="text-red-400" />
      <p className="text-sm text-red-600">{error.message}</p>
      <button onClick={reload} className="btn-secondary">Retry</button>
    </div>
  )

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">AICTE IDEA Lab scheme documents and news</p>
        <button onClick={() => { setEditItem(null); setModalOpen(true) }} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> Add Record
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-100">
          <SearchBar
            value={searchTerm}
            onChange={v => { setSearchTerm(v); resetPage() }}
            placeholder="Search IDEA LAB records..."
            className="max-w-xs"
          />
        </div>
        <DataTable
          columns={columns}
          data={paginated}
          keyExtractor={r => r.id}
          total={filtered.length}
          page={page}
          limit={limit}
          onPageChange={setPage}
          loading={loading}
          emptyTitle="No IDEA LAB records"
          emptyDescription="Add a record using the button above."
        />
      </div>

      <AccreditationFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => { reload(); setModalOpen(false) }}
        type="AICTE"
        section="IDEA LAB"
        editItem={editItem}
      />

      <ConfirmDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDelete}
        title="Delete Record"
        message="This record will be permanently deleted."
        confirmLabel="Delete"
      />
    </>
  )
}

// ── SPICES section ────────────────────────────────────────────────────────────
function SpicesSection() {
  const toast = useToast()
  const deleteDialog = useConfirmDialog()
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<AccreditationRecord | null>(null)
  const [pendingSubSection, setPendingSubSection] = useState<string>('Activities')

  // We share a single reload trigger via state; each SpicesSubTable owns its own data fetch
  const [reloadKey, setReloadKey] = useState(0)

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await accreditationService.delete(deleteDialog.targetId)
      setReloadKey(k => k + 1)
      deleteDialog.close()
      toast.success('Deleted')
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to delete') }
  }

  function openAdd(subSection: string) {
    setPendingSubSection(subSection)
    setEditItem(null)
    setModalOpen(true)
  }

  function openEdit(r: AccreditationRecord) {
    setPendingSubSection(r.sub_section ?? 'Activities')
    setEditItem(r)
    setModalOpen(true)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">SPICES scheme — Activities and Clubs</p>
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search SPICES..."
          className="max-w-xs"
        />
      </div>

      <div key={reloadKey} className="space-y-4">
        <SpicesSubTable
          subSection="Activities"
          onAdd={() => openAdd('Activities')}
          onEdit={openEdit}
          onDelete={id => deleteDialog.open(id)}
          searchQ={debouncedSearch}
        />
        <SpicesSubTable
          subSection="Clubs"
          onAdd={() => openAdd('Clubs')}
          onEdit={openEdit}
          onDelete={id => deleteDialog.open(id)}
          searchQ={debouncedSearch}
        />
      </div>

      <AccreditationFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => { setReloadKey(k => k + 1); setModalOpen(false) }}
        type="AICTE"
        section="SPICES"
        sub_section={pendingSubSection}
        editItem={editItem}
      />

      <ConfirmDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDelete}
        title="Delete Record"
        message="This record will be permanently deleted."
        confirmLabel="Delete"
      />
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AICTEPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const rawSection = searchParams.get('section') ?? ''
  const activeSection: AICTESection = (AICTE_SECTIONS as readonly string[]).includes(rawSection)
    ? (rawSection as AICTESection)
    : 'EOA'

  function setSection(s: AICTESection) {
    setSearchParams({ section: s })
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/accreditations')}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-display font-bold text-slate-800">AICTE</h2>
          <p className="text-sm text-slate-500">All India Council for Technical Education</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-slate-200">
        {AICTE_SECTIONS.map(s => (
          <button
            key={s}
            onClick={() => setSection(s as AICTESection)}
            className={[
              'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeSection === s
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
            ].join(' ')}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div>
        {activeSection === 'EOA'      && <EOASection />}
        {activeSection === 'IDEA LAB' && <IdeaLabSection />}
        {activeSection === 'SPICES'   && <SpicesSection />}
      </div>
    </div>
  )
}
