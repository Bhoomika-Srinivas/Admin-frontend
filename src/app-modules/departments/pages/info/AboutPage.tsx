import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Save, Plus, Trash2, Edit2, GripVertical, Check, X as XIcon } from 'lucide-react'
import { deptAboutService } from '@/app-modules/departments/api/deptAboutApi'
import type { DeptAbout, SWOTAnalysis, ProgramOutcome } from '@/shared/types/models'
import { useToast } from '@/shared/context/ToastContext'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import clsx from 'clsx'

const TABS = ['Vision & Mission', 'SWOT Analysis', 'PEOs & PSOs'] as const
type Tab = typeof TABS[number]

// ── Vision / Mission ──────────────────────────────────────────────────────────

function VisionMissionTab({ deptId }: { deptId: string }) {
  const toast = useToast()
  const [saved, setSaved] = useState<Pick<DeptAbout, 'vision' | 'mission'>>({ vision: '', mission: '' })
  const [form,  setForm]  = useState(saved)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    deptAboutService.getAbout(deptId).then(data => {
      const vals = { vision: data.vision, mission: data.mission }
      setSaved(vals)
      setForm(vals)
    })
  }, [deptId])

  async function handleSave() {
    setSaving(true)
    try {
      const result = await deptAboutService.saveAbout(deptId, form)
      const vals = { vision: result.vision, mission: result.mission }
      setSaved(vals)
      setEditing(false)
      toast.success('Vision & Mission saved')
    } catch {
      toast.error('Failed to save Vision & Mission')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() { setForm(saved); setEditing(false) }

  return (
    <div className="space-y-4">
      {/* Edit toggle */}
      <div className="flex justify-end">
        {!editing
          ? <button onClick={() => { setForm(saved); setEditing(true) }} className="btn-secondary flex items-center gap-1.5"><Edit2 size={14} /> Edit</button>
          : null
        }
      </div>

      {editing ? (
        <>
          <FormField label="Vision">
            <textarea className="input-field h-32 resize-none" placeholder="Enter department vision..."
              value={form.vision} onChange={e => setForm(f => ({ ...f, vision: e.target.value }))} />
          </FormField>
          <FormField label="Mission">
            <textarea className="input-field h-32 resize-none" placeholder="Enter department mission..."
              value={form.mission} onChange={e => setForm(f => ({ ...f, mission: e.target.value }))} />
          </FormField>
          <div className="flex justify-end gap-2">
            <button onClick={handleCancel} className="btn-secondary" disabled={saving}>Cancel</button>
            <button onClick={handleSave} className="btn-primary flex items-center gap-1.5" disabled={saving}>
              <Save size={14} /> {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Vision</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {saved.vision || <span className="text-slate-400 italic">Not set</span>}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Mission</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {saved.mission || <span className="text-slate-400 italic">Not set</span>}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── SWOT ──────────────────────────────────────────────────────────────────────

const QUADRANTS = ['strengths', 'weaknesses', 'opportunities', 'threats'] as const
type Quadrant = typeof QUADRANTS[number]

const QUADRANT_LABELS: Record<Quadrant, string> = {
  strengths: 'Strengths', weaknesses: 'Weaknesses',
  opportunities: 'Opportunities', threats: 'Threats',
}
const QUADRANT_COLORS: Record<Quadrant, { card: string; badge: string; dot: string }> = {
  strengths:     { card: 'border-emerald-200 bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400' },
  weaknesses:    { card: 'border-red-200 bg-red-50',         badge: 'bg-red-100 text-red-700',         dot: 'bg-red-400'     },
  opportunities: { card: 'border-blue-200 bg-blue-50',       badge: 'bg-blue-100 text-blue-700',       dot: 'bg-blue-400'    },
  threats:       { card: 'border-amber-200 bg-amber-50',     badge: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-400'   },
}

type SwotData = Omit<SWOTAnalysis, 'deptId'>

function SWOTTab({ deptId }: { deptId: string }) {
  const toast = useToast()

  const [saved,   setSaved]   = useState<SwotData>({ strengths: [], weaknesses: [], opportunities: [], threats: [] })
  const [form,    setForm]    = useState<SwotData>(saved)
  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [inputs,  setInputs]  = useState<Record<Quadrant, string>>({ strengths: '', weaknesses: '', opportunities: '', threats: '' })

  useEffect(() => {
    deptAboutService.getSWOT(deptId).then(data => {
      const vals: SwotData = {
        strengths: data.strengths,
        weaknesses: data.weaknesses,
        opportunities: data.opportunities,
        threats: data.threats,
      }
      setSaved(vals)
      setForm(vals)
    })
  }, [deptId])

  function addItem(q: Quadrant) {
    const val = inputs[q].trim(); if (!val) return
    setForm(f => ({ ...f, [q]: [...f[q], val] }))
    setInputs(i => ({ ...i, [q]: '' }))
  }
  function removeItem(q: Quadrant, idx: number) {
    setForm(f => ({ ...f, [q]: f[q].filter((_, i) => i !== idx) }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const result = await deptAboutService.saveSWOT(deptId, form)
      const vals: SwotData = {
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        opportunities: result.opportunities,
        threats: result.threats,
      }
      setSaved(vals)
      setEditing(false)
      toast.success('SWOT Analysis saved')
    } catch {
      toast.error('Failed to save SWOT Analysis')
    } finally {
      setSaving(false)
    }
  }
  function handleCancel() { setForm(saved); setEditing(false) }
  function handleEdit()   { setForm(saved); setEditing(true)  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {!editing && (
          <button onClick={handleEdit} className="btn-secondary flex items-center gap-1.5">
            <Edit2 size={14} /> Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {QUADRANTS.map(q => {
          const c = QUADRANT_COLORS[q]
          return (
            <div key={q} className={clsx('rounded-xl border p-4', c.card)}>
              <div className="flex items-center gap-2 mb-3">
                <div className={clsx('w-2 h-2 rounded-full', c.dot)} />
                <h4 className="font-semibold text-sm text-slate-700">{QUADRANT_LABELS[q]}</h4>
                {!editing && (
                  <span className={clsx('ml-auto text-xs font-medium px-2 py-0.5 rounded-full', c.badge)}>
                    {form[q].length}
                  </span>
                )}
              </div>

              {/* Items */}
              <ul className="space-y-1.5 mb-3">
                {form[q].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="flex-1 text-slate-700">{item}</span>
                    {editing && (
                      <button onClick={() => removeItem(q, i)} className="text-slate-400 hover:text-red-500 mt-0.5 shrink-0">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </li>
                ))}
                {form[q].length === 0 && (
                  <li className="text-xs text-slate-400 italic">{editing ? 'No items yet — add one below' : 'No items added'}</li>
                )}
              </ul>

              {/* Add input — edit mode only */}
              {editing && (
                <div className="flex gap-2">
                  <input className="input-field text-sm py-1.5 flex-1" placeholder="Add item…"
                    value={inputs[q]} onChange={e => setInputs(i => ({ ...i, [q]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addItem(q)} />
                  <button onClick={() => addItem(q)} className="btn-secondary py-1.5 px-2">
                    <Plus size={14} />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {editing && (
        <div className="flex justify-end gap-2">
          <button onClick={handleCancel} className="btn-secondary" disabled={saving}>Cancel</button>
          <button onClick={handleSave} className="btn-primary flex items-center gap-1.5" disabled={saving}>
            <Save size={14} /> {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── PEOs & PSOs ───────────────────────────────────────────────────────────────

const OUTCOME_PLACEHOLDER: Record<'PEO' | 'PSO', string> = {
  PEO: 'e.g. To apply skills acquired in the discipline of Computer Science and Engineering for solving societal and industrial problems…',
  PSO: 'e.g. Ability to design and implement software systems using modern tools and methodologies…',
}

function OutcomeList({ deptId, type }: { deptId: string; type: 'PEO' | 'PSO' }) {
  const toast = useToast()

  const [items, setItems] = useState<ProgramOutcome[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [adding, setAdding] = useState(false)
  const [addText, setAddText] = useState('')
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const dragItemId = useRef<string | null>(null)
  const deleteDialog = useConfirmDialog()

  async function reload() {
    try {
      const data = await deptAboutService.getProgramOutcomes(deptId, type)
      setItems(data)
    } catch {
      toast.error(`Failed to load ${type}s`)
    }
  }
  useEffect(() => { reload() }, [deptId, type])

  async function handleAdd() {
    const text = addText.trim(); if (!text) return
    try {
      await deptAboutService.createProgramOutcome({ deptId, type, statement: text, order: items.length + 1 })
      setAddText(''); setAdding(false)
      await reload()
      toast.success(`${type} added`)
    } catch {
      toast.error(`Failed to add ${type}`)
    }
  }

  function startEdit(item: ProgramOutcome) { setEditingId(item.id); setEditText(item.statement) }
  async function saveEdit() {
    const text = editText.trim()
    if (!text || !editingId) return
    try {
      await deptAboutService.updateProgramOutcome(editingId, { statement: text })
      setEditingId(null)
      await reload()
      toast.success('Updated')
    } catch {
      toast.error('Failed to update')
    }
  }
  function cancelEdit() { setEditingId(null) }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await deptAboutService.deleteProgramOutcome(deleteDialog.targetId)
      deleteDialog.close()
      await reload()
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  function onDragStart(id: string) { dragItemId.current = id }
  function onDragOver(e: React.DragEvent, id: string) { e.preventDefault(); setDragOverId(id) }
  async function onDrop(targetId: string) {
    const fromId = dragItemId.current
    if (!fromId || fromId === targetId) { setDragOverId(null); return }
    const from = items.findIndex(i => i.id === fromId)
    const to   = items.findIndex(i => i.id === targetId)
    const reordered = [...items]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved)
    dragItemId.current = null
    setDragOverId(null)
    try {
      await deptAboutService.reorderProgramOutcomes(deptId, type, reordered.map(i => i.id))
      await reload()
    } catch {
      toast.error('Failed to reorder')
    }
  }
  function onDragEnd() { dragItemId.current = null; setDragOverId(null) }

  const label = type === 'PEO' ? 'Programme Educational Objective' : 'Programme Specific Outcome'

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
        {!adding && (
          <button onClick={() => setAdding(true)} className="btn-primary py-1.5 text-xs">
            <Plus size={13} /> Add {type}
          </button>
        )}
      </div>

      {items.length === 0 && !adding && (
        <div className="py-10 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center gap-2 text-slate-400">
          <p className="text-sm">No {type}s defined yet.</p>
          <button onClick={() => setAdding(true)} className="text-sm text-brand-600 hover:underline font-medium">
            Add the first {type}
          </button>
        </div>
      )}

      <ol className="space-y-2">
        {items.map((item, idx) => {
          const isDragTarget = dragOverId === item.id
          return (
            <li key={item.id} draggable
              onDragStart={() => onDragStart(item.id)}
              onDragOver={e => onDragOver(e, item.id)}
              onDrop={() => onDrop(item.id)}
              onDragEnd={onDragEnd}
              className={clsx(
                'group flex items-start gap-3 rounded-xl border p-3 bg-white transition-all',
                isDragTarget ? 'border-brand-400 shadow-md scale-[1.01]' : 'border-slate-200 hover:border-slate-300',
                dragItemId.current === item.id ? 'opacity-40' : '',
              )}
            >
              <button className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors touch-none"
                onMouseDown={e => e.currentTarget.closest('li')?.setAttribute('draggable', 'true')}>
                <GripVertical size={16} />
              </button>
              <span className="shrink-0 w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center mt-0.5 font-display">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                {editingId === item.id ? (
                  <div className="space-y-2">
                    <textarea autoFocus className="input-field resize-none w-full text-sm leading-relaxed" rows={4}
                      value={editText} onChange={e => setEditText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Escape') cancelEdit(); if (e.key === 'Enter' && e.ctrlKey) saveEdit() }} />
                    <p className="text-xs text-slate-400">Ctrl+Enter to save · Esc to cancel</p>
                    <div className="flex gap-2">
                      <button onClick={saveEdit}  className="btn-primary py-1 text-xs"><Check size={12} /> Save</button>
                      <button onClick={cancelEdit} className="btn-secondary py-1 text-xs"><XIcon size={12} /> Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-700 leading-relaxed">{item.statement}</p>
                )}
              </div>
              {editingId !== item.id && (
                <div className="shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(item)}
                    className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => deleteDialog.open(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </li>
          )
        })}
      </ol>

      {adding && (
        <div className="flex items-start gap-3 rounded-xl border-2 border-brand-300 border-dashed p-3 bg-brand-50/30 mt-2">
          <span className="shrink-0 w-6 h-6 rounded-full bg-slate-200 text-slate-500 text-xs font-bold flex items-center justify-center mt-0.5 font-display">
            {items.length + 1}
          </span>
          <div className="flex-1 space-y-2">
            <textarea autoFocus className="input-field resize-none w-full text-sm leading-relaxed" rows={4}
              placeholder={OUTCOME_PLACEHOLDER[type]} value={addText} onChange={e => setAddText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Escape') { setAdding(false); setAddText('') } if (e.key === 'Enter' && e.ctrlKey) handleAdd() }} />
            <p className="text-xs text-slate-400">Ctrl+Enter to add · Esc to cancel</p>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="btn-primary py-1 text-xs"><Check size={12} /> Add</button>
              <button onClick={() => { setAdding(false); setAddText('') }} className="btn-secondary py-1 text-xs">
                <XIcon size={12} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete}
        title={`Delete ${type}`} message="This statement will be permanently removed." confirmLabel="Delete" />
    </div>
  )
}

const PEO_PSO_TABS = ['PEOs', 'PSOs'] as const
type PeoPsoTab = typeof PEO_PSO_TABS[number]

function PEOsPSOsTab({ deptId }: { deptId: string }) {
  const [subTab, setSubTab] = useState<PeoPsoTab>('PEOs')
  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {PEO_PSO_TABS.map(t => (
          <button key={t} onClick={() => setSubTab(t)}
            className={clsx('px-5 py-1.5 text-sm font-medium rounded-lg transition-all',
              subTab === t ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
            {t}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-400">
        {subTab === 'PEOs'
          ? 'Programme Educational Objectives define broad career and professional accomplishments graduates are expected to achieve within 3–5 years.'
          : 'Programme Specific Outcomes are specific competencies that students gain upon completion of the programme.'}
      </p>
      {subTab === 'PEOs' && <OutcomeList deptId={deptId} type="PEO" />}
      {subTab === 'PSOs' && <OutcomeList deptId={deptId} type="PSO" />}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const { deptId } = useParams<{ deptId: string }>()
  const [tab, setTab] = useState<Tab>('Vision & Mission')
  if (!deptId) return null

  return (
    <div className="card p-5 space-y-5">
      <div>
        <h3 className="text-base font-display font-bold text-slate-800">About</h3>
        <p className="text-sm text-slate-500">Manage department vision, mission, SWOT, and program outcomes.</p>
      </div>
      <div className="flex gap-1 border-b border-slate-100">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={clsx('px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700')}>
            {t}
          </button>
        ))}
      </div>
      {tab === 'Vision & Mission' && <VisionMissionTab deptId={deptId} />}
      {tab === 'SWOT Analysis'   && <SWOTTab deptId={deptId} />}
      {tab === 'PEOs & PSOs'     && <PEOsPSOsTab deptId={deptId} />}
    </div>
  )
}
