import { useState, useEffect } from 'react'
import { Save, Plus, X } from 'lucide-react'
import { useVisionMission } from '../hooks/useAlumni'
import { alumniService } from '../api/alumniApi'
import { useToast } from '@/shared/context/ToastContext'

export default function VisionMissionSection() {
  const toast = useToast()
  const { data, loading, reload } = useVisionMission()
  const [vision, setVision] = useState<string[]>([])
  const [mission, setMission] = useState<string[]>([])
  const [objectives, setObjectives] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [newItem, setNewItem] = useState<{ type: 'vision' | 'mission' | 'objectives'; value: string }>({
    type: 'vision',
    value: '',
  })

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

  function addItem() {
    if (!newItem.value.trim()) return
    const item = newItem.value.trim()
    switch (newItem.type) {
      case 'vision':
        setVision([...vision, item])
        break
      case 'mission':
        setMission([...mission, item])
        break
      case 'objectives':
        setObjectives([...objectives, item])
        break
    }
    setNewItem({ type: newItem.type, value: '' })
  }

  function removeItem(type: 'vision' | 'mission' | 'objectives', index: number) {
    switch (type) {
      case 'vision':
        setVision(vision.filter((_, i) => i !== index))
        break
      case 'mission':
        setMission(mission.filter((_, i) => i !== index))
        break
      case 'objectives':
        setObjectives(objectives.filter((_, i) => i !== index))
        break
    }
  }

  async function handleSave() {
    if (vision.length === 0 || mission.length === 0 || objectives.length === 0) {
      toast.error('Please add at least one item to each section')
      return
    }
    setSaving(true)
    try {
      await alumniService.updateVisionMission({ vision, mission, objectives })
      toast.success('Vision, Mission & Objectives saved')
      await reload()
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const renderList = (type: 'vision' | 'mission' | 'objectives', items: string[], label: string) => (
    <div className="space-y-3">
      <h4 className="font-semibold text-slate-800 capitalize">{label}</h4>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
            <span className="flex-1 text-sm text-slate-700">{item}</span>
            <button onClick={() => removeItem(type, idx)} className="p-1 text-slate-400 hover:text-red-500">
              <X size={14} />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-slate-400 italic">No items added yet</p>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Vision, Mission & Objectives</h3>
          <p className="text-xs text-slate-500 mt-0.5">Manage the guiding principles of the alumni association.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-1.5">
          <Save size={14} /> {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div className="card p-5 space-y-6">
        {renderList('vision', vision, 'Vision')}
        {renderList('mission', mission, 'Mission')}
        {renderList('objectives', objectives, 'Objectives')}

        <div className="border-t border-slate-200 pt-4">
          <h4 className="text-sm font-medium text-slate-700 mb-3">Add New Item</h4>
          <div className="flex gap-3">
            <select
              className="input-field w-32"
              value={newItem.type}
              onChange={e => setNewItem({ ...newItem, type: e.target.value as typeof newItem.type })}
            >
              <option value="vision">Vision</option>
              <option value="mission">Mission</option>
              <option value="objectives">Objectives</option>
            </select>
            <input
              className="input-field flex-1"
              value={newItem.value}
              onChange={e => setNewItem({ ...newItem, value: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              placeholder={`Add new ${newItem.type} point…`}
            />
            <button onClick={addItem} className="btn-secondary flex items-center gap-1.5">
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
