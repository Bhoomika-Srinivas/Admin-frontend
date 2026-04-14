import { useState, useEffect } from 'react'
import { Save, Edit2, X } from 'lucide-react'
import { useVisionMission, useDeanMessage } from '../hooks/useAlumni'
import { alumniService } from '../api/alumniApi'
import FormField from '@/shared/components/forms/FormField'
import { useToast } from '@/shared/context/ToastContext'
import clsx from 'clsx'

const TABS = ['Vision & Mission', "Dean's Message"] as const
type Tab = typeof TABS[number]

// ── Vision / Mission ─────────────────────────────────────────────────────────

function VisionMissionTab() {
  const toast = useToast()
  const { data, loading, reload } = useVisionMission()
  const [vision, setVision] = useState<string[]>([])
  const [mission, setMission] = useState<string[]>([])
  const [objectives, setObjectives] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (data) {
      setVision(data.vision)
      setMission(data.mission)
      setObjectives(data.objectives)
    }
  }, [data])

  if (loading) {
    return <div className="card p-8 text-center text-sm text-slate-400">Loading…</div>
  }

  async function handleSave() {
    setSaving(true)
    try {
      await alumniService.updateVisionMission({ vision, mission, objectives })
      toast.success('Vision, Mission & Objectives saved')
      await reload()
      setEditing(false)
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    if (data) {
      setVision(data.vision)
      setMission(data.mission)
      setObjectives(data.objectives)
    }
    setEditing(false)
  }

  const renderList = (items: string[], label: string) => (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400 italic">Not set</p>
      ) : (
        <ul className="space-y-1">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-brand-500 mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )

  const renderEditList = (
    items: string[],
    setItems: (items: string[]) => void,
    label: string,
    placeholder: string
  ) => (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-brand-500">•</span>
            <input
              className="input-field text-sm flex-1"
              value={item}
              onChange={e => {
                const newItems = [...items]
                newItems[idx] = e.target.value
                setItems(newItems)
              }}
              placeholder={placeholder}
            />
            <button
              onClick={() => setItems(items.filter((_, i) => i !== idx))}
              className="p-1.5 text-slate-400 hover:text-red-500"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button
          onClick={() => setItems([...items, ''])}
          className="text-sm text-brand-600 hover:text-brand-700 font-medium"
        >
          + Add {label.slice(0, -1)}
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {!editing ? (
          <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-1.5">
            <Edit2 size={14} /> Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleCancel} className="btn-secondary" disabled={saving}>Cancel</button>
            <button onClick={handleSave} className="btn-primary flex items-center gap-1.5" disabled={saving}>
              <Save size={14} /> {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="card p-5 space-y-6">
          {renderEditList(vision, setVision, 'Vision', 'Enter vision statement...')}
          {renderEditList(mission, setMission, 'Mission', 'Enter mission statement...')}
          {renderEditList(objectives, setObjectives, 'Objectives', 'Enter objective...')}
        </div>
      ) : (
        <div className="card p-5 space-y-6">
          {renderList(vision, 'Vision')}
          {renderList(mission, 'Mission')}
          {renderList(objectives, 'Objectives')}
        </div>
      )}
    </div>
  )
}

// ── Dean's Message ─────────────────────────────────────────────────────────────

function DeanMessageTab() {
  const toast = useToast()
  const { message, loading, reload } = useDeanMessage()
  const [form, setForm] = useState({
    name: '',
    role: '',
    department: '',
    designation: '',
    message: '',
    isActive: true,
  })
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (message) {
      setForm({
        name: message.name,
        role: message.role,
        department: message.department,
        designation: message.designation,
        message: message.message,
        isActive: message.isActive,
      })
    }
  }, [message])

  if (loading) {
    return <div className="card p-8 text-center text-sm text-slate-400">Loading…</div>
  }

  async function handleSave() {
    if (!form.name.trim() || !form.message.trim()) {
      toast.error('Name and message are required')
      return
    }
    setSaving(true)
    try {
      await alumniService.updateDeanMessage(form)
      toast.success("Dean's message saved")
      await reload()
      setEditing(false)
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    if (message) {
      setForm({
        name: message.name,
        role: message.role,
        department: message.department,
        designation: message.designation,
        message: message.message,
        isActive: message.isActive,
      })
    }
    setEditing(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {!editing ? (
          <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-1.5">
            <Edit2 size={14} /> Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleCancel} className="btn-secondary" disabled={saving}>Cancel</button>
            <button onClick={handleSave} className="btn-primary flex items-center gap-1.5" disabled={saving}>
              <Save size={14} /> {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="card p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Name" required>
              <input
                className="input-field"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Dr Devendrappa K C"
              />
            </FormField>
            <FormField label="Role" required>
              <input
                className="input-field"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                placeholder="e.g. Dean - Alumni"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Department" required>
              <input
                className="input-field"
                value={form.department}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                placeholder="e.g. MECHANICAL"
              />
            </FormField>
            <FormField label="Designation" required>
              <input
                className="input-field"
                value={form.designation}
                onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}
                placeholder="e.g. Professor"
              />
            </FormField>
          </div>
          <FormField label="Message" required>
            <textarea
              className="input-field h-48 resize-none"
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Write the Dean's message to alumni…"
            />
          </FormField>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
              className="rounded border-slate-300"
            />
            <label htmlFor="isActive" className="text-sm text-slate-600">Active (visible on website)</label>
          </div>
        </div>
      ) : (
        <div className="card p-5 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xl font-bold">
              {form.name ? form.name[0] : '?'}
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{form.name || 'Not set'}</h3>
              <p className="text-sm text-brand-600">{form.role || 'Role not set'}</p>
              <p className="text-xs text-slate-500">{form.designation} • {form.department}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {form.message || <span className="italic text-slate-400">No message set</span>}
            </p>
          </div>
          {!form.isActive && (
            <div className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
              This message is currently inactive and will not be displayed on the website.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AlumniAboutPage() {
  const [tab, setTab] = useState<Tab>('Vision & Mission')

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-display font-bold text-slate-800">About Alumni</h2>
        <p className="text-sm text-slate-500 mt-0.5">Manage vision, mission, and Dean's message.</p>
      </div>

      <div className="card p-5 space-y-5">
        <div className="flex gap-1 border-b border-slate-100">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                tab === t ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'Vision & Mission' && <VisionMissionTab />}
        {tab === "Dean's Message" && <DeanMessageTab />}
      </div>
    </div>
  )
}
