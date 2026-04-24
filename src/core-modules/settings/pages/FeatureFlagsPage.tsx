import { useState } from 'react'
import { Calendar, Newspaper, Bell, Briefcase, Users } from 'lucide-react'
import { useColleges } from '../hooks/useColleges'
import { useFeatureFlags } from '../hooks/useFeatureFlags'
import { featureFlagsService } from '../api/featureFlagsApi'
import type { FeatureName } from '@/shared/types/models'
import { useToast } from '@/shared/context/ToastContext'
import SelectFilter from '@/shared/components/filters/SelectFilter'
import clsx from 'clsx'

const FEATURES: { name: FeatureName; label: string; description: string; icon: React.ElementType }[] = [
  {
    name:        'events',
    label:       'Events',
    description: 'Enable department and institutional event management',
    icon:        Calendar,
  },
  {
    name:        'news',
    label:       'News',
    description: 'Enable college news publishing and management',
    icon:        Newspaper,
  },
  {
    name:        'announcements',
    label:       'Announcements',
    description: 'Enable system-wide announcement broadcasts',
    icon:        Bell,
  },
  {
    name:        'placements',
    label:       'Placements',
    description: 'Enable placement drives, companies, and student records',
    icon:        Briefcase,
  },
  {
    name:        'alumni',
    label:       'Alumni',
    description: 'Enable alumni workspace and association management',
    icon:        Users,
  },
]

export default function FeatureFlagsPage() {
  const toast = useToast()
  const { colleges, loading: collegesLoading } = useColleges()
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('')
  const { flags, setFlags, loading: flagsLoading } = useFeatureFlags(selectedCollegeId || null)
  const [toggling, setToggling] = useState<FeatureName | null>(null)

  const collegeOptions = colleges.map(c => ({ value: c.id, label: `${c.name} (${c.shortCode})` }))

  function isEnabled(feature: FeatureName): boolean {
    const flag = flags.find(f => f.feature === feature)
    return flag?.enabled ?? false
  }

  async function handleToggle(feature: FeatureName) {
    if (!selectedCollegeId || toggling) return
    const current = isEnabled(feature)
    const next = !current

    // Optimistic update
    setFlags(prev =>
      prev.some(f => f.feature === feature)
        ? prev.map(f => f.feature === feature ? { ...f, enabled: next } : f)
        : [...prev, { collegeId: selectedCollegeId, feature, enabled: next }]
    )

    setToggling(feature)
    try {
      await featureFlagsService.setFlag(selectedCollegeId, feature, next)
    } catch {
      // Rollback on error
      setFlags(prev =>
        prev.map(f => f.feature === feature ? { ...f, enabled: current } : f)
      )
      toast.error(`Failed to ${next ? 'enable' : 'disable'} ${feature}`)
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-display font-bold text-slate-800">Feature Flags</h2>
        <p className="text-sm text-slate-500">Enable or disable modules per college</p>
      </div>

      {/* College selector */}
      <div className="flex items-center gap-3">
        <SelectFilter
          value={selectedCollegeId}
          onChange={setSelectedCollegeId}
          options={collegeOptions}
          placeholder={collegesLoading ? 'Loading colleges...' : 'Select a college'}
        />
      </div>

      {/* Feature toggles */}
      {!selectedCollegeId ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-slate-500">Select a college above to manage its feature flags.</p>
        </div>
      ) : flagsLoading ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-slate-500">Loading feature flags...</p>
        </div>
      ) : (
        <div className="card divide-y divide-slate-100">
          {FEATURES.map(({ name, label, description, icon: Icon }) => {
            const enabled = isEnabled(name)
            const isToggling = toggling === name
            return (
              <div key={name} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={clsx(
                      'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                      enabled ? 'bg-brand-50' : 'bg-slate-100'
                    )}
                  >
                    <Icon size={18} className={enabled ? 'text-brand-600' : 'text-slate-400'} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{label}</p>
                    <p className="text-xs text-slate-400">{description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isToggling}
                  onClick={() => handleToggle(name)}
                  className={clsx(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    enabled ? 'bg-brand-600' : 'bg-slate-200',
                    isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  )}
                  aria-label={`${enabled ? 'Disable' : 'Enable'} ${label}`}
                >
                  <span
                    className={clsx(
                      'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform',
                      enabled ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
