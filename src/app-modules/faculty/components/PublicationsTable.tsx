import { useState } from 'react'
import { Plus, Trash2, ExternalLink } from 'lucide-react'
import type { Publication } from '@/shared/types/models'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'

interface Props {
  publications: Publication[]
  canEdit: boolean
  onChange: (updated: Publication[]) => void
}

const typeColors: Record<Publication['type'], string> = {
  journal:    'bg-blue-100 text-blue-700',
  conference: 'bg-purple-100 text-purple-700',
  book:       'bg-amber-100 text-amber-700',
}

const emptyPub: Omit<Publication, 'id'> = {
  title: '', journal: '', year: new Date().getFullYear(), authors: '', doi: '', type: 'journal'
}

export default function PublicationsTable({ publications, canEdit, onChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<Omit<Publication, 'id'>>(emptyPub)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  function handleAdd() {
    const newPub: Publication = { ...form, id: `p${Date.now()}` }
    onChange([...publications, newPub])
    setModalOpen(false)
    setForm(emptyPub)
  }

  function handleDelete(id: string) {
    onChange(publications.filter(p => p.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{publications.length} publication{publications.length !== 1 ? 's' : ''}</p>
        {canEdit && (
          <button onClick={() => setModalOpen(true)} className="btn-primary text-xs py-1.5 px-3">
            <Plus size={13} /> Add Publication
          </button>
        )}
      </div>

      {publications.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No publications added yet.</div>
      ) : (
        <div className="space-y-3">
          {publications.map((pub, i) => (
            <div key={pub.id} className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-white transition-colors">
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <p className="text-sm font-medium text-slate-800 leading-snug">{pub.title}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${typeColors[pub.type]}`}>
                    {pub.type}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{pub.journal}</p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-xs text-slate-400">{pub.authors}</span>
                  <span className="text-xs font-medium text-slate-600">{pub.year}</span>
                  {pub.doi && (
                    <a
                      href={`https://doi.org/${pub.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      <ExternalLink size={10} /> DOI
                    </a>
                  )}
                </div>
              </div>
              {canEdit && (
                <button
                  onClick={() => handleDelete(pub.id)}
                  className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0 self-start"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Publication" size="md">
        <div className="space-y-4">
          <FormField label="Title" required>
            <input className="input-field" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </FormField>
          <FormField label="Journal / Conference / Publisher" required>
            <input className="input-field" value={form.journal} onChange={e => setForm(f => ({ ...f, journal: e.target.value }))} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Year" required>
              <input type="number" className="input-field" value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} />
            </FormField>
            <FormField label="Type">
              <select className="input-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Publication['type'] }))}>
                <option value="journal">Journal</option>
                <option value="conference">Conference</option>
                <option value="book">Book</option>
              </select>
            </FormField>
          </div>
          <FormField label="Authors" required hint="e.g. Author A, Author B, Author C">
            <input className="input-field" value={form.authors} onChange={e => setForm(f => ({ ...f, authors: e.target.value }))} />
          </FormField>
          <FormField label="DOI" hint="Optional">
            <input className="input-field" value={form.doi ?? ''} onChange={e => setForm(f => ({ ...f, doi: e.target.value }))} placeholder="10.xxxx/xxxxx" />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleAdd} className="btn-primary">Add Publication</button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
