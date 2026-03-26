import { useState, useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Edit2, Trash2, ExternalLink } from 'lucide-react'
import { publicationProfileService } from '@/app-modules/departments/api/deptResearchApi'
import { useDeptContext } from '@/app-modules/departments/context/DepartmentContext'
import type { PublicationProfile, Faculty } from '@/shared/types/models'
import { facultyService } from '@/app-modules/faculty/api/facultyApi'
import { useToast } from '@/shared/context/ToastContext'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import SearchBar from '@/shared/components/filters/SearchBar'
import FacultyCombobox from '@/app-modules/departments/components/FacultyCombobox'
import { useDepartmentSectionAsync } from '@/app-modules/departments/hooks/useDepartmentSection'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { usePagination } from '@/shared/hooks/usePagination'
import { useSearch } from '@/shared/hooks/useSearch'

// ── Profile Modal ─────────────────────────────────────────────────────────────

type ProfileForm = {
  facultyId: string
  department: string
  googleScholarLink: string
  irinsLink: string
}

function emptyForm(): ProfileForm {
  return { facultyId: '', department: '', googleScholarLink: '', irinsLink: '' }
}

function ProfileModal({
  open,
  editItem,
  deptId,
  facultyList: allFaculty,
  onClose,
  onSaved,
}: {
  open: boolean
  editItem: PublicationProfile | null
  deptId: string
  facultyList: Faculty[]
  onClose: () => void
  onSaved: () => void
}) {
  const toast = useToast()

  const [form, setForm] = useState<ProfileForm>(emptyForm)

  // Sync form when modal opens / editItem changes
  useMemo(() => {
    setForm(editItem ? {
      facultyId:         editItem.facultyId,
      department:        editItem.department,
      googleScholarLink: editItem.googleScholarLink ?? '',
      irinsLink:         editItem.irinsLink ?? '',
    } : emptyForm())
  }, [editItem, open])

  const set = <K extends keyof ProfileForm>(key: K, val: ProfileForm[K]) =>
    setForm(f => ({ ...f, [key]: val }))

  async function handleSave() {
    if (!form.facultyId) { toast.error('Please select a faculty member'); return }

    try {
      await publicationProfileService.save({
        ...(editItem ? { id: editItem.id } : {}),
        deptId,
        facultyId:         form.facultyId,
        department:        form.department,
        googleScholarLink: form.googleScholarLink || undefined,
        irinsLink:         form.irinsLink || undefined,
      })
      toast.success(editItem ? 'Profile updated' : 'Profile added')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save profile')
    }
  }

  if (!open) return null

  return (
    <Modal open={open} onClose={onClose}
      title={editItem ? 'Edit Publication Profile' : 'Add Faculty Publication Profile'}>
      <div className="space-y-4">
        <FormField label="Faculty" required>
          <FacultyCombobox
            facultyList={allFaculty}
            value={form.facultyId}
            onChange={(id, dept) => setForm(f => ({ ...f, facultyId: id, department: dept }))}
          />
        </FormField>

        <FormField label="Department">
          <input className="input-field bg-slate-50 text-slate-500 cursor-not-allowed"
            value={form.department} readOnly
            placeholder="Auto-filled from selected faculty" />
        </FormField>

        <FormField label="Google Scholar Link"
          hint="Paste the full profile URL from scholar.google.com">
          <input className="input-field" value={form.googleScholarLink}
            onChange={e => set('googleScholarLink', e.target.value)}
            placeholder="https://scholar.google.com/citations?user=…" />
        </FormField>

        <FormField label="IRINS Link"
          hint="Paste the full profile URL from irins.res.in">
          <input className="input-field" value={form.irinsLink}
            onChange={e => set('irinsLink', e.target.value)}
            placeholder="https://irins.res.in/irins/…" />
        </FormField>
      </div>

      <ModalFooter>
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={handleSave} className="btn-primary">
          {editItem ? 'Save Changes' : 'Add Profile'}
        </button>
      </ModalFooter>
    </Modal>
  )
}

// ── Link Cell ─────────────────────────────────────────────────────────────────

function LinkCell({ href, label }: { href?: string; label: string }) {
  if (!href) return <span className="text-slate-300 text-xs">—</span>
  return (
    <a href={href} target="_blank" rel="noreferrer"
      onClick={e => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-800 hover:underline">
      <ExternalLink size={12} />
      {label}
    </a>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PublicationsPage() {
  const { deptId } = useParams<{ deptId: string }>()
  const toast      = useToast()

  const [allFaculty, setAllFaculty] = useState<Faculty[]>([])

  useEffect(() => { facultyService.getAll().then(setAllFaculty).catch(() => {}) }, [])

  const { data, reload }                   = useDepartmentSectionAsync(() => publicationProfileService.getAll(deptId!))
  const [modalOpen, setModalOpen]          = useState(false)
  const [editItem, setEditItem]            = useState<PublicationProfile | null>(null)
  const deleteDialog                       = useConfirmDialog()
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()

  // Faculty list scoped to this department
  const dept          = useDeptContext()
  const deptShortName = dept.shortName
  const facultyList   = useMemo(
    () => allFaculty.filter(f => f.department === deptShortName && f.status === 'active'),
    [allFaculty, deptShortName],
  )

  // Resolve faculty name from id
  function getFacultyName(facultyId: string) {
    return allFaculty.find(f => f.id === facultyId)?.name ?? '—'
  }

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    return !q ? data : data.filter(p => getFacultyName(p.facultyId).toLowerCase().includes(q))
  }, [data, debouncedSearch])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await publicationProfileService.delete(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Profile deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete profile')
    }
  }

  function openAdd() {
    setEditItem(null); setModalOpen(true)
  }

  function openEdit(item: PublicationProfile) {
    setEditItem(item); setModalOpen(true)
  }

  const columns: Column<PublicationProfile>[] = [
    {
      key: 'facultyId', header: 'Faculty Name',
      render: r => (
        <p className="font-medium text-sm text-slate-800">{getFacultyName(r.facultyId)}</p>
      ),
    },
    {
      key: 'department', header: 'Department',
      render: r => <span className="text-sm text-slate-500">{r.department}</span>,
    },
    {
      key: 'googleScholarLink', header: 'Google Scholar',
      render: r => <LinkCell href={r.googleScholarLink} label="Scholar" />,
    },
    {
      key: 'irinsLink', header: 'IRINS',
      render: r => <LinkCell href={r.irinsLink} label="IRINS" />,
    },
    {
      key: 'actions', header: '', className: 'w-20',
      render: r => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg">
            <Edit2 size={14} />
          </button>
          <button onClick={() => deleteDialog.open(r.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-display font-bold text-slate-800">Publications</h3>
          <p className="text-sm text-slate-500">{data.length} faculty profile{data.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> Add Publication Profile
        </button>
      </div>

      {/* Table */}
      <div className="card">
        <div className="p-4 border-b border-slate-100">
          <SearchBar value={searchTerm} onChange={v => { setSearchTerm(v); resetPage() }}
            placeholder="Search by faculty name…" className="max-w-sm" />
        </div>
        <DataTable
          columns={columns}
          data={paginated}
          keyExtractor={r => r.id}
          total={filtered.length}
          page={page}
          limit={limit}
          onPageChange={setPage}
          emptyTitle="No publication profiles yet"
          emptyDescription="Add faculty publication profiles using the button above."
        />
      </div>

      {/* Modal */}
      <ProfileModal
        open={modalOpen}
        editItem={editItem}
        deptId={deptId!}
        facultyList={facultyList}
        onClose={() => setModalOpen(false)}
        onSaved={reload}
      />

      <ConfirmDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDelete}
        title="Delete Profile"
        message="This faculty publication profile will be permanently deleted."
        confirmLabel="Delete"
      />
    </div>
  )
}
