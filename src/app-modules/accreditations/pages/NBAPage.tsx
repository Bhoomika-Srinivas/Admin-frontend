import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Edit2, Trash2, ChevronLeft, ExternalLink, AlertCircle, Building2 } from 'lucide-react'
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
import {
  NBA_SECTIONS,
  NBA_INSTITUTE_SUBS,
  NBA_SUB_SUB,
  NBA_DEPARTMENTS,
  NBA_DEPT_SUBS,
  nbaHasSubSub,
  type NBASection,
} from '../config'

// ── Shared DataTable section ──────────────────────────────────────────────────
interface RecordTableProps {
  filters: {
    type: 'NBA'
    section: string
    sub_section?: string
    sub_sub_section?: string
    department?: string
  }
  onAdd:    () => void
  onEdit:   (r: AccreditationRecord) => void
  onDelete: (id: string) => void
  searchQ:  string
  emptyTitle?: string
}

function RecordTable({ filters, onAdd, onEdit, onDelete, searchQ, emptyTitle }: RecordTableProps) {
  const { data, loading, error, reload } = useAccreditations(filters)

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
    <div className="p-8 flex flex-col items-center gap-3 text-center">
      <AlertCircle size={20} className="text-red-400" />
      <p className="text-sm text-red-600">{error.message}</p>
      <button onClick={reload} className="btn-secondary">Retry</button>
    </div>
  )

  return (
    <div className="card">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
        <button onClick={onAdd} className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3">
          <Plus size={13} /> Add Record
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
        emptyTitle={emptyTitle ?? 'No records'}
        emptyDescription="Add a record using the button above."
      />
    </div>
  )
}

// ── Accreditation Details section ─────────────────────────────────────────────
interface DetailsSectionProps {
  searchQ: string
  onAdd:   () => void
  onEdit:  (r: AccreditationRecord) => void
  onDelete: (id: string) => void
}

function DetailsSection({ searchQ, onAdd, onEdit, onDelete }: DetailsSectionProps) {
  return (
    <RecordTable
      filters={{ type: 'NBA', section: 'Accreditation Details' }}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      searchQ={searchQ}
      emptyTitle="No accreditation details"
    />
  )
}

// ── Institute Level section ────────────────────────────────────────────────────
interface InstituteSectionProps {
  activeSub:    string
  activeSubSub: string
  setSubSub:    (s: string) => void
  searchQ:      string
  onAdd:        () => void
  onEdit:       (r: AccreditationRecord) => void
  onDelete:     (id: string) => void
}

function InstituteSection({
  activeSub, activeSubSub, setSubSub, searchQ, onAdd, onEdit, onDelete,
}: InstituteSectionProps) {
  const hasSubSub = nbaHasSubSub(activeSub)
  const subSubOptions = hasSubSub ? NBA_SUB_SUB[activeSub] : []

  const filters = {
    type: 'NBA' as const,
    section: 'Institute Level',
    sub_section: activeSub,
    ...(hasSubSub && activeSubSub ? { sub_sub_section: activeSubSub } : {}),
  }

  return (
    <div className="space-y-4">
      {/* Sub-sub tabs */}
      {hasSubSub && subSubOptions.length > 0 && (
        <div className="flex gap-1 border-b border-slate-200">
          {subSubOptions.map(ss => (
            <button
              key={ss}
              onClick={() => setSubSub(ss)}
              className={[
                'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
                activeSubSub === ss
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
              ].join(' ')}
            >
              {ss}
            </button>
          ))}
        </div>
      )}

      <RecordTable
        filters={filters}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        searchQ={searchQ}
        emptyTitle={`No ${activeSub} records`}
      />
    </div>
  )
}

// ── Department Level section ───────────────────────────────────────────────────
interface DeptSectionProps {
  activeDept: string
  activeSub:  string
  setSub:     (s: string) => void
  setDept:    (d: string) => void
  searchQ:    string
  onAdd:      () => void
  onEdit:     (r: AccreditationRecord) => void
  onDelete:   (id: string) => void
}

function DeptSection({
  activeDept, activeSub, setSub, setDept, searchQ, onAdd, onEdit, onDelete,
}: DeptSectionProps) {
  return (
    <div className="space-y-4">
      {/* Department grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {NBA_DEPARTMENTS.map(dept => (
          <button
            key={dept}
            onClick={() => setDept(dept)}
            className={[
              'card p-3 text-left transition-all hover:shadow-md flex flex-col gap-1.5',
              activeDept === dept
                ? 'ring-2 ring-red-400 border-red-200 bg-red-50'
                : 'hover:border-slate-300',
            ].join(' ')}
          >
            <Building2
              size={18}
              className={activeDept === dept ? 'text-red-500' : 'text-slate-400'}
            />
            <p className={`text-xs font-semibold leading-snug ${activeDept === dept ? 'text-red-700' : 'text-slate-700'}`}>
              {dept}
            </p>
          </button>
        ))}
      </div>

      {/* Sub-section buttons */}
      <div className="flex gap-2">
        {NBA_DEPT_SUBS.map(sub => (
          <button
            key={sub}
            onClick={() => setSub(sub)}
            className={[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeSub === sub
                ? 'bg-red-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            ].join(' ')}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Table */}
      <RecordTable
        filters={{
          type: 'NBA',
          section: 'Department Level',
          sub_section: activeSub,
          department: activeDept,
        }}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        searchQ={searchQ}
        emptyTitle={`No ${activeSub} for ${activeDept}`}
      />
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function NBAPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const deleteDialog = useConfirmDialog()
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<AccreditationRecord | null>(null)
  const [pendingContext, setPendingContext] = useState<{
    section: string
    sub_section?: string
    sub_sub_section?: string
    department?: string
  }>({ section: 'Accreditation Details' })

  // ── URL param helpers ─────────────────────────────────────────────────────
  const rawSection = searchParams.get('section') ?? ''
  const rawSub     = searchParams.get('sub')     ?? ''
  const rawSubSub  = searchParams.get('subSub')  ?? ''
  const rawDept    = searchParams.get('dept')    ?? ''

  const activeSection: NBASection = (NBA_SECTIONS as readonly string[]).includes(rawSection)
    ? (rawSection as NBASection)
    : 'Accreditation Details'

  function setSection(s: NBASection) {
    const p = new URLSearchParams({ section: s })
    setSearchParams(p)
  }

  function setInstituteSub(sub: string) {
    const p = new URLSearchParams({ section: 'Institute Level', sub })
    setSearchParams(p)
  }

  function setInstituteSubSub(subSub: string) {
    const p = new URLSearchParams({ section: 'Institute Level', sub: rawSub, subSub })
    setSearchParams(p)
  }

  function setDeptDept(dept: string) {
    const p = new URLSearchParams({
      section: 'Department Level',
      dept,
      sub: rawSub || NBA_DEPT_SUBS[0],
    })
    setSearchParams(p)
  }

  function setDeptSub(sub: string) {
    const p = new URLSearchParams({
      section: 'Department Level',
      dept: rawDept || NBA_DEPARTMENTS[0],
      sub,
    })
    setSearchParams(p)
  }

  // ── Default param logic ───────────────────────────────────────────────────
  useEffect(() => {
    if (!rawSection) {
      setSearchParams({ section: 'Accreditation Details' }, { replace: true })
      return
    }
    if (rawSection === 'Institute Level') {
      if (!rawSub) {
        setSearchParams({ section: 'Institute Level', sub: 'General' }, { replace: true })
        return
      }
      if (nbaHasSubSub(rawSub) && !rawSubSub) {
        const firstSubSub = NBA_SUB_SUB[rawSub]?.[0] ?? ''
        setSearchParams({ section: 'Institute Level', sub: rawSub, subSub: firstSubSub }, { replace: true })
        return
      }
    }
    if (rawSection === 'Department Level') {
      const needsDept = !rawDept
      const needsSub  = !rawSub
      if (needsDept || needsSub) {
        setSearchParams({
          section: 'Department Level',
          dept: rawDept || NBA_DEPARTMENTS[0],
          sub:  rawSub  || NBA_DEPT_SUBS[0],
        }, { replace: true })
      }
    }
  }, [rawSection, rawSub, rawSubSub, rawDept])

  // ── Modal helpers ─────────────────────────────────────────────────────────
  function openAdd(ctx: typeof pendingContext) {
    setPendingContext(ctx)
    setEditItem(null)
    setModalOpen(true)
  }

  function openEdit(r: AccreditationRecord) {
    setPendingContext({
      section:         r.section         ?? activeSection,
      sub_section:     r.sub_section,
      sub_sub_section: r.sub_sub_section,
      department:      r.department,
    })
    setEditItem(r)
    setModalOpen(true)
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await accreditationService.delete(deleteDialog.targetId)
      deleteDialog.close()
      toast.success('Deleted')
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to delete') }
  }

  // ── Context for current view ──────────────────────────────────────────────
  function currentAddContext(): typeof pendingContext {
    if (activeSection === 'Accreditation Details') {
      return { section: 'Accreditation Details' }
    }
    if (activeSection === 'Institute Level') {
      return {
        section:         'Institute Level',
        sub_section:     rawSub || 'General',
        ...(nbaHasSubSub(rawSub) && rawSubSub ? { sub_sub_section: rawSubSub } : {}),
      }
    }
    // Department Level
    return {
      section:     'Department Level',
      sub_section: rawSub || NBA_DEPT_SUBS[0],
      department:  rawDept || NBA_DEPARTMENTS[0],
    }
  }

  return (
    <>
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
            <h2 className="text-xl font-display font-bold text-slate-800">NBA</h2>
            <p className="text-sm text-slate-500">National Board of Accreditation</p>
          </div>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search records..."
            className="max-w-xs"
          />
        </div>

        {/* Level-1 tab bar */}
        <div className="flex gap-1 border-b border-slate-200">
          {NBA_SECTIONS.map(s => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={[
                'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                activeSection === s
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
              ].join(' ')}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Section content */}
        {activeSection === 'Accreditation Details' && (
          <DetailsSection
            searchQ={debouncedSearch}
            onAdd={() => openAdd(currentAddContext())}
            onEdit={openEdit}
            onDelete={id => deleteDialog.open(id)}
          />
        )}

        {activeSection === 'Institute Level' && (
          <div className="flex gap-6 items-start">
            {/* Left sidebar */}
            <nav className="w-52 shrink-0 card overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Sub-sections</p>
              </div>
              <ul className="py-1">
                {NBA_INSTITUTE_SUBS.map(sub => (
                  <li key={sub}>
                    <button
                      onClick={() => setInstituteSub(sub)}
                      className={[
                        'w-full text-left px-4 py-2.5 text-sm transition-colors',
                        rawSub === sub
                          ? 'bg-red-50 text-red-700 font-semibold border-r-2 border-red-500'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800',
                      ].join(' ')}
                    >
                      {sub}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Right content */}
            <div className="flex-1 min-w-0">
              <div className="mb-3">
                <h3 className="text-base font-semibold text-slate-800">{rawSub}</h3>
              </div>
              <InstituteSection
                key={`${rawSub}-${rawSubSub}`}
                activeSub={rawSub || 'General'}
                activeSubSub={rawSubSub}
                setSubSub={setInstituteSubSub}
                searchQ={debouncedSearch}
                onAdd={() => openAdd(currentAddContext())}
                onEdit={openEdit}
                onDelete={id => deleteDialog.open(id)}
              />
            </div>
          </div>
        )}

        {activeSection === 'Department Level' && (
          <DeptSection
            key={`${rawDept}-${rawSub}`}
            activeDept={rawDept || NBA_DEPARTMENTS[0]}
            activeSub={rawSub || NBA_DEPT_SUBS[0]}
            setDept={setDeptDept}
            setSub={setDeptSub}
            searchQ={debouncedSearch}
            onAdd={() => openAdd(currentAddContext())}
            onEdit={openEdit}
            onDelete={id => deleteDialog.open(id)}
          />
        )}
      </div>

      <AccreditationFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => { setModalOpen(false) }}
        type="NBA"
        section={pendingContext.section}
        sub_section={pendingContext.sub_section}
        sub_sub_section={pendingContext.sub_sub_section}
        department={pendingContext.department}
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
