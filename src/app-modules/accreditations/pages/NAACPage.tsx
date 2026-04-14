import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Edit2, Trash2, ChevronLeft, ExternalLink, AlertCircle, FileText } from 'lucide-react'
import { useAccreditations } from '../hooks/useAccreditations'
import { accreditationService } from '../api/accreditationsApi'
import AccreditationFormModal from '../components/AccreditationFormModal'
import type { AccreditationRecord } from '@/shared/types/models'
import { useToast } from '@/shared/context/ToastContext'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import SearchBar from '@/shared/components/filters/SearchBar'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useSearch } from '@/shared/hooks/useSearch'
import { usePagination } from '@/shared/hooks/usePagination'
import { NAAC_SECTIONS, NAAC_DISPLAY_TYPE, type NAACSection } from '../config'

// ── Card grid view ─────────────────────────────────────────────────────────────
interface CardGridProps {
  records:    AccreditationRecord[]
  loading:    boolean
  onEdit:     (r: AccreditationRecord) => void
  onDelete:   (id: string) => void
}

function CardGrid({ records, loading, onEdit, onDelete }: CardGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4 animate-pulse space-y-2">
            <div className="h-4 bg-slate-100 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="card p-10 flex flex-col items-center text-center gap-2">
        <FileText size={32} className="text-slate-300" />
        <p className="text-sm font-medium text-slate-500">No records found</p>
        <p className="text-xs text-slate-400">Add a record using the button above.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {records.map(r => (
        <div key={r.id} className="card p-4 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
              <FileText size={16} className="text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 leading-snug">{r.title}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {r.year  && <span className="text-xs text-slate-500">{r.year}</span>}
                {r.cycle && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 font-medium">
                    {r.cycle}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
            <a
              href={r.file_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 hover:underline"
            >
              <ExternalLink size={12} />
              View
            </a>
            <div className="flex-1" />
            <button
              onClick={() => onEdit(r)}
              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => onDelete(r.id)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Section content ───────────────────────────────────────────────────────────
interface SectionContentProps {
  section: NAACSection
}

function SectionContent({ section }: SectionContentProps) {
  const toast = useToast()
  const { data, loading, error, reload } = useAccreditations({ type: 'NAAC', section })
  const deleteDialog = useConfirmDialog()
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<AccreditationRecord | null>(null)

  const displayType = NAAC_DISPLAY_TYPE[section]

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
      key: 'meta',
      header: 'Details',
      render: r => (
        <div className="flex flex-wrap gap-2">
          {r.year  && <span className="text-sm text-slate-500">{r.year}</span>}
          {r.cycle && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 font-medium">
              {r.cycle}
            </span>
          )}
        </div>
      ),
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
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <SearchBar
          value={searchTerm}
          onChange={v => { setSearchTerm(v); resetPage() }}
          placeholder={`Search ${section}...`}
          className="max-w-xs"
        />
        <button
          onClick={() => { setEditItem(null); setModalOpen(true) }}
          className="btn-primary flex items-center gap-1.5"
        >
          <Plus size={15} /> Add Record
        </button>
      </div>

      {/* Content */}
      {displayType === 'cards' ? (
        <CardGrid
          records={filtered}
          loading={loading}
          onEdit={r => { setEditItem(r); setModalOpen(true) }}
          onDelete={id => deleteDialog.open(id)}
        />
      ) : (
        <div className="card">
          <DataTable
            columns={columns}
            data={paginated}
            keyExtractor={r => r.id}
            total={filtered.length}
            page={page}
            limit={limit}
            onPageChange={setPage}
            loading={loading}
            emptyTitle={`No ${section} records`}
            emptyDescription="Add a record using the button above."
          />
        </div>
      )}

      <AccreditationFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => { reload(); setModalOpen(false) }}
        type="NAAC"
        section={section}
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
export default function NAACPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const rawSection = searchParams.get('section') ?? ''
  const activeSection: NAACSection = (NAAC_SECTIONS as readonly string[]).includes(rawSection)
    ? (rawSection as NAACSection)
    : NAAC_SECTIONS[0]

  function setSection(s: NAACSection) {
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
          <h2 className="text-xl font-display font-bold text-slate-800">NAAC</h2>
          <p className="text-sm text-slate-500">National Assessment and Accreditation Council</p>
        </div>
      </div>

      {/* Layout: sidebar + content */}
      <div className="flex gap-6 items-start">
        {/* Left sidebar */}
        <nav className="w-56 shrink-0 card overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Sections</p>
          </div>
          <ul className="py-1">
            {NAAC_SECTIONS.map(s => (
              <li key={s}>
                <button
                  onClick={() => setSection(s)}
                  className={[
                    'w-full text-left px-4 py-2.5 text-sm transition-colors',
                    activeSection === s
                      ? 'bg-brand-50 text-brand-700 font-semibold border-r-2 border-brand-500'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800',
                  ].join(' ')}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right content */}
        <div className="flex-1 min-w-0">
          <div className="mb-3">
            <h3 className="text-base font-semibold text-slate-800">{activeSection}</h3>
          </div>
          <SectionContent key={activeSection} section={activeSection} />
        </div>
      </div>
    </div>
  )
}
