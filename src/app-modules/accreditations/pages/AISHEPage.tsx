import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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

export default function AISHEPage() {
  const navigate  = useNavigate()
  const toast     = useToast()
  const { data, loading, error, reload } = useAccreditations({ type: 'AISHE' })
  const deleteDialog = useConfirmDialog()
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()
  const [yearFilter, setYearFilter] = useState('')
  const [modalOpen, setModalOpen]   = useState(false)
  const [editItem, setEditItem]     = useState<AccreditationRecord | null>(null)

  const years = useMemo(() =>
    [...new Set(data.map(r => r.year).filter(Boolean))].sort((a, b) => b!.localeCompare(a!)) as string[],
  [data])

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    return data.filter(r =>
      (!q || r.title.toLowerCase().includes(q)) &&
      (!yearFilter || r.year === yearFilter)
    )
  }, [data, debouncedSearch, yearFilter])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await accreditationService.delete(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Deleted')
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to delete') }
  }

  function openAdd()  { setEditItem(null); setModalOpen(true) }
  function openEdit(r: AccreditationRecord) { setEditItem(r); setModalOpen(true) }

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
            onClick={() => openEdit(r)}
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
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/accreditations')}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-display font-bold text-slate-800">AISHE</h2>
            <p className="text-sm text-slate-500">All India Survey on Higher Education</p>
          </div>
          <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
            <Plus size={15} /> Add Record
          </button>
        </div>

        <div className="card">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <SearchBar
              value={searchTerm}
              onChange={v => { setSearchTerm(v); resetPage() }}
              placeholder="Search records..."
              className="max-w-xs"
            />
            <SelectFilter
              value={yearFilter}
              onChange={v => { setYearFilter(v); resetPage() }}
              options={years.map(y => ({ value: y, label: y }))}
              placeholder="All Years"
              className="w-36"
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
            emptyTitle="No AISHE records"
            emptyDescription="Add a record using the button above."
          />
        </div>
      </div>

      <AccreditationFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => { reload(); setModalOpen(false) }}
        type="AISHE"
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
