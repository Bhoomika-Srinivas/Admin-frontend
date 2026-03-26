import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  Upload, X, Twitter, Linkedin, Youtube, Mail, MapPin,
  Phone, Printer, Globe, Save, Lock, Info, Edit2,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '@/auth/AuthContext'
import { useToast } from '@/shared/context/ToastContext'
import { can } from '@/shared/utils/permissions'
import { uploadToS3 } from '@/shared/utils/s3Upload'
import { instituteSettingsService, deptBrandingService } from '../../api/deptBrandingApi'
import type { InstituteSettings, DeptBranding } from '@/shared/types/models'

// ── Image Upload Field ────────────────────────────────────────────────────────

function ImageUpload({
  label, value, onChange, disabled, hint, editing = true,
}: {
  label: string; value: string; onChange: (url: string) => void
  disabled?: boolean; hint?: string; editing?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Show local preview immediately
    const localUrl = URL.createObjectURL(file)
    onChange(localUrl)
    // Upload to S3 and replace with real URL
    try {
      const url = await uploadToS3(file, 'branding', 'institute')
      onChange(url)
    } catch {
      onChange('')
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="label">{label}</label>
      {editing ? (
        <div className="flex items-start gap-3">
          <div className={clsx(
            'w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center shrink-0 overflow-hidden bg-slate-50',
            value ? 'border-slate-200' : 'border-slate-300',
          )}>
            {value ? <img src={value} alt={label} className="w-full h-full object-contain p-1" /> : <Upload size={18} className="text-slate-400" />}
          </div>
          <div className="flex-1 space-y-2">
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={disabled} />
            <div className="flex gap-2">
              <button type="button" onClick={() => inputRef.current?.click()} disabled={disabled}
                className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
                <Upload size={12} />{value ? 'Replace' : 'Upload'}
              </button>
              {value && !disabled && (
                <button type="button" onClick={() => onChange('')}
                  className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 text-red-600 border-red-200 hover:bg-red-50">
                  <X size={12} />Remove
                </button>
              )}
            </div>
            {hint && <p className="text-xs text-slate-400">{hint}</p>}
          </div>
        </div>
      ) : (
        value
          ? <img src={value} alt={label} className="w-20 h-20 rounded-xl border border-slate-200 object-contain p-1 bg-slate-50" />
          : <p className="text-sm text-slate-400 italic">Not set</p>
      )}
    </div>
  )
}

// ── Section Card ──────────────────────────────────────────────────────────────

function SectionCard({
  title, description, children, locked,
}: {
  title: string; description?: string; children: React.ReactNode; locked?: boolean
}) {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
        {locked && (
          <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 shrink-0">
            <Lock size={11} /> Super Admin only
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

// ── Text Input Row ────────────────────────────────────────────────────────────

function Field({
  label, value, onChange, placeholder, disabled, icon, textarea, rows = 3, editing = true,
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; disabled?: boolean; icon?: React.ReactNode
  textarea?: boolean; rows?: number; editing?: boolean
}) {
  const base = 'input-field w-full text-sm'
  return (
    <div className="space-y-1">
      <label className="label">{label}</label>
      {editing ? (
        <div className="relative">
          {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{icon}</span>}
          {textarea ? (
            <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
              rows={rows} disabled={disabled} className={clsx(base, 'resize-none', icon && 'pl-9')} />
          ) : (
            <input type="text" value={value} onChange={e => onChange(e.target.value)}
              placeholder={placeholder} disabled={disabled} className={clsx(base, icon && 'pl-9')} />
          )}
        </div>
      ) : (
        <p className={clsx('text-sm leading-relaxed', value ? 'text-slate-700 whitespace-pre-line' : 'text-slate-400 italic')}>
          {value || 'Not set'}
        </p>
      )}
    </div>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
}

// ── HEADER TAB ────────────────────────────────────────────────────────────────

function HeaderTab() {
  const { user } = useAuth()
  const { success, error } = useToast()
  const isSuperAdmin = can(user, 'manage:all_departments')

  const { deptId = '' } = useParams<{ deptId: string }>()

  const [instituteSaved,   setInstituteSaved]   = useState<InstituteSettings | null>(null)
  const [institute,        setInstitute]         = useState<InstituteSettings | null>(null)
  const [editingInstitute, setEditingInstitute]  = useState(false)
  const [savingInstitute,  setSavingInstitute]   = useState(false)

  const [brandingSaved,  setBrandingSaved]  = useState<DeptBranding | null>(null)
  const [branding,       setBranding]       = useState<DeptBranding | null>(null)
  const [editingDept,    setEditingDept]    = useState(false)
  const [savingDept,     setSavingDept]     = useState(false)

  useEffect(() => {
    instituteSettingsService.get().then(data => { setInstituteSaved(data); setInstitute(data) }).catch(() => {})
    deptBrandingService.get(deptId).then(data => { setBrandingSaved(data); setBranding(data) }).catch(() => {})
  }, [deptId])

  function updateInstitute<K extends keyof InstituteSettings>(k: K, v: InstituteSettings[K]) {
    setInstitute(prev => prev ? { ...prev, [k]: v } : prev)
  }
  function updateBranding<K extends keyof DeptBranding>(k: K, v: DeptBranding[K]) {
    setBranding(prev => prev ? { ...prev, [k]: v } : prev)
  }

  async function saveInstitute() {
    if (!institute) return
    setSavingInstitute(true)
    try {
      const saved = await instituteSettingsService.save(institute)
      setInstituteSaved(saved); setInstitute(saved); setEditingInstitute(false)
      success('Institute settings saved')
    } catch { error('Failed to save institute settings') }
    finally { setSavingInstitute(false) }
  }

  async function saveDept() {
    if (!branding) return
    setSavingDept(true)
    try {
      const { deptId: _id, ...fields } = branding
      const saved = await deptBrandingService.save(deptId, fields)
      setBrandingSaved(saved); setBranding(saved); setEditingDept(false)
      success('Department header saved')
    } catch { error('Failed to save department header') }
    finally { setSavingDept(false) }
  }

  if (!institute || !branding) {
    return <div className="text-sm text-slate-400 py-8 text-center">Loading…</div>
  }

  const inst = editingInstitute ? institute : (instituteSaved ?? institute)
  const dept = editingDept ? branding : (brandingSaved ?? branding)

  return (
    <div className="space-y-5">
      {/* Institute Identity */}
      <SectionCard title="Institute Identity"
        description="Shared across all department pages. Displayed on the left side of every header."
        locked={!isSuperAdmin}>
        {!isSuperAdmin ? (
          <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <Info size={13} className="shrink-0 mt-0.5 text-slate-400" />
            Institute-level settings can only be changed by a Super Administrator.
          </div>
        ) : (
          <>
            {!editingInstitute && (
              <div className="flex justify-end">
                <button onClick={() => { setInstitute(instituteSaved); setEditingInstitute(true) }}
                  className="btn-secondary flex items-center gap-1.5 text-xs">
                  <Edit2 size={13} /> Edit
                </button>
              </div>
            )}
            <Grid>
              <div className="sm:col-span-2">
                <ImageUpload label="Institute Logo" value={inst.institute_logo}
                  onChange={v => updateInstitute('institute_logo', v)} editing={editingInstitute}
                  disabled={savingInstitute}
                  hint="Recommended: SVG or PNG with transparent background, min 200 × 200 px" />
              </div>
              <div className="sm:col-span-2">
                <Field label="Institute Name" value={inst.institute_name}
                  onChange={v => updateInstitute('institute_name', v)} editing={editingInstitute}
                  placeholder="e.g. Bheemanna Khandre Institute of Technology" />
              </div>
            </Grid>
            {editingInstitute && (
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => { setInstitute(instituteSaved); setEditingInstitute(false) }} className="btn-secondary" disabled={savingInstitute}>Cancel</button>
                <button onClick={saveInstitute} disabled={savingInstitute} className="btn-primary flex items-center gap-2 text-sm">
                  <Save size={14} /> {savingInstitute ? 'Saving…' : 'Save Institute Settings'}
                </button>
              </div>
            )}
          </>
        )}
      </SectionCard>

      {/* Department Header */}
      <SectionCard title="Department Header"
        description="Displayed on the right side of the header, alongside the institute identity.">
        {!editingDept && (
          <div className="flex justify-end">
            <button onClick={() => { setBranding(brandingSaved); setEditingDept(true) }}
              className="btn-secondary flex items-center gap-1.5 text-xs">
              <Edit2 size={13} /> Edit
            </button>
          </div>
        )}
        <Grid>
          <div className="sm:col-span-2">
            <Field label="Department Title" value={dept.department_title}
              onChange={v => updateBranding('department_title', v)} editing={editingDept}
              placeholder="e.g. Department of Computer Science and Engineering" />
          </div>
          <div className="sm:col-span-2">
            <ImageUpload label="Department Logo (optional)" value={dept.department_logo}
              onChange={v => updateBranding('department_logo', v)} editing={editingDept}
              disabled={savingDept}
              hint="Leave empty to display only the department title." />
          </div>
        </Grid>
        {editingDept && (
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => { setBranding(brandingSaved); setEditingDept(false) }} className="btn-secondary" disabled={savingDept}>Cancel</button>
            <button onClick={saveDept} disabled={savingDept} className="btn-primary flex items-center gap-2 text-sm">
              <Save size={14} /> {savingDept ? 'Saving…' : 'Save Department Header'}
            </button>
          </div>
        )}
      </SectionCard>

      {/* Live Preview */}
      <SectionCard title="Header Preview" description="Approximate preview of how the header will appear on the department website.">
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-white px-6 py-3 flex items-center gap-4 border-b border-slate-100">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {institute.institute_logo
                ? <img src={institute.institute_logo} alt="Institute" className="h-10 w-10 object-contain shrink-0" />
                : <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-400 text-xs font-bold">LOGO</div>
              }
              <span className="text-sm font-semibold text-slate-800 leading-snug truncate">
                {institute.institute_name || 'Institute Name'}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 shrink-0" />
            <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
              <span className="text-sm font-medium text-slate-700 leading-snug text-right truncate">
                {branding.department_title || 'Department Title'}
              </span>
              {branding.department_logo
                ? <img src={branding.department_logo} alt="Dept" className="h-10 w-10 object-contain shrink-0" />
                : null
              }
            </div>
          </div>
          <div className="bg-slate-50 px-6 py-1.5">
            <p className="text-xs text-slate-400 text-center">Navigation bar · not configurable from this panel</p>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

// ── FOOTER TAB ────────────────────────────────────────────────────────────────

function FooterTab() {
  const { user } = useAuth()
  const { success, error } = useToast()
  const { deptId = '' } = useParams<{ deptId: string }>()
  const isSuperAdmin = can(user, 'manage:all_departments')

  const [brandingSaved, setBrandingSaved] = useState<DeptBranding | null>(null)
  const [branding,      setBranding]      = useState<DeptBranding | null>(null)
  const [editing,       setEditing]       = useState(false)
  const [saving,        setSaving]        = useState(false)
  const [institute,     setInstitute]     = useState<InstituteSettings | null>(null)

  useEffect(() => {
    deptBrandingService.get(deptId).then(data => { setBrandingSaved(data); setBranding(data) }).catch(() => {})
    instituteSettingsService.get().then(setInstitute).catch(() => {})
  }, [deptId])

  function update<K extends keyof DeptBranding>(k: K, v: DeptBranding[K]) {
    setBranding(prev => prev ? { ...prev, [k]: v } : prev)
  }

  async function save() {
    if (!branding) return
    setSaving(true)
    try {
      const { deptId: _id, ...fields } = branding
      const saved = await deptBrandingService.save(deptId, fields)
      setBrandingSaved(saved); setBranding(saved); setEditing(false)
      success('Footer settings saved')
    } catch { error('Failed to save footer settings') }
    finally { setSaving(false) }
  }

  if (!branding) {
    return <div className="text-sm text-slate-400 py-8 text-center">Loading…</div>
  }

  const d = editing ? branding : (brandingSaved ?? branding)
  const inst = institute ?? { institute_name: '', institute_logo: '', default_copyright_text: '', default_website_credits: '' }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        {!editing && (
          <button onClick={() => { setBranding(brandingSaved); setEditing(true) }}
            className="btn-secondary flex items-center gap-1.5">
            <Edit2 size={14} /> Edit Footer
          </button>
        )}
      </div>

      <SectionCard title="Social Media Links" description="Icons appear in the footer only when a URL is provided.">
        <Grid>
          <Field label="Twitter / X"   value={d.twitter_url}      onChange={v => update('twitter_url', v)}      placeholder="https://twitter.com/biet_cse"          icon={<Twitter  size={13} />} editing={editing} />
          <Field label="LinkedIn"      value={d.linkedin_url}     onChange={v => update('linkedin_url', v)}     placeholder="https://linkedin.com/company/biet-cse" icon={<Linkedin size={13} />} editing={editing} />
          <Field label="YouTube"       value={d.youtube_url}      onChange={v => update('youtube_url', v)}      placeholder="https://youtube.com/@biet_cse"         icon={<Youtube  size={13} />} editing={editing} />
          <Field label="Email Contact" value={d.email_contact}    onChange={v => update('email_contact', v)}    placeholder="cse@biet.ac.in"                       icon={<Mail     size={13} />} editing={editing} />
          <div className="sm:col-span-2">
            <Field label="Map / Location Link" value={d.map_location_link} onChange={v => update('map_location_link', v)} placeholder="https://maps.google.com/?q=BIET+Bidar" icon={<MapPin size={13} />} editing={editing} />
          </div>
        </Grid>
      </SectionCard>

      <SectionCard title="Department Address" description="Displayed in the footer address block.">
        <Field label="Full Address" value={d.full_address} onChange={v => update('full_address', v)}
          placeholder={"Department of CSE\nBheemanna Khandre Institute of Technology\nBidar, Karnataka – 585403"}
          textarea rows={4} icon={<MapPin size={13} />} editing={editing} />
      </SectionCard>

      <SectionCard title="Contact Details" description="Individual contact lines shown in the footer.">
        <Grid>
          <Field label="HOD Phone"        value={d.hod_phone}        onChange={v => update('hod_phone', v)}        placeholder="+91 98765 43210"  icon={<Phone   size={13} />} editing={editing} />
          <Field label="HOD Email"        value={d.hod_email}        onChange={v => update('hod_email', v)}        placeholder="hod.cse@biet.ac.in" icon={<Mail size={13} />} editing={editing} />
          <Field label="Department Phone" value={d.department_phone} onChange={v => update('department_phone', v)} placeholder="+91 84730 00001" icon={<Phone   size={13} />} editing={editing} />
          <Field label="Department Fax"   value={d.department_fax}   onChange={v => update('department_fax', v)}   placeholder="+91 84730 00002" icon={<Printer size={13} />} editing={editing} />
          <div className="sm:col-span-2">
            <Field label="Department Email" value={d.department_email} onChange={v => update('department_email', v)} placeholder="cse@biet.ac.in" icon={<Mail size={13} />} editing={editing} />
          </div>
        </Grid>
      </SectionCard>

      <SectionCard title="Footer Credits"
        description="Leave blank to use the institute-level defaults set by the Super Administrator."
        locked={!isSuperAdmin}>
        {!isSuperAdmin ? (
          <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <Info size={13} className="shrink-0 mt-0.5 text-slate-400" />
            Default credits are set institute-wide. Only Super Administrators can override them per department.
          </div>
        ) : (
          <Grid>
            <div className="sm:col-span-2">
              <Field label="Copyright Text (overrides institute default)"
                value={d.copyright_text} onChange={v => update('copyright_text', v)}
                placeholder={inst.default_copyright_text} icon={<Globe size={13} />} editing={editing} />
            </div>
            <div className="sm:col-span-2">
              <Field label="Website Credits (overrides institute default)"
                value={d.website_credits} onChange={v => update('website_credits', v)}
                placeholder={inst.default_website_credits} editing={editing} />
            </div>
          </Grid>
        )}
      </SectionCard>

      {/* Footer Preview */}
      <SectionCard title="Footer Preview" description="Approximate preview of the department website footer.">
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-800 text-white">
          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
            <div className="space-y-1">
              <p className="font-semibold text-xs uppercase tracking-wider text-slate-400 mb-2">Address</p>
              <p className="text-slate-300 text-xs whitespace-pre-line leading-relaxed">{d.full_address || 'Department address will appear here'}</p>
            </div>
            <div className="space-y-1.5">
              <p className="font-semibold text-xs uppercase tracking-wider text-slate-400 mb-2">Contact</p>
              {d.hod_phone && <p className="text-slate-300 text-xs flex items-center gap-1.5"><Phone size={11} className="text-slate-500" /> {d.hod_phone}</p>}
              {d.department_email && <p className="text-slate-300 text-xs flex items-center gap-1.5"><Mail size={11} className="text-slate-500" /> {d.department_email}</p>}
              {!d.hod_phone && !d.department_email && <p className="text-slate-500 text-xs">Contact details will appear here</p>}
            </div>
            <div>
              <p className="font-semibold text-xs uppercase tracking-wider text-slate-400 mb-2">Follow Us</p>
              <div className="flex gap-3">
                {d.twitter_url && <Twitter size={16} className="text-slate-400" />}
                {d.linkedin_url && <Linkedin size={16} className="text-slate-400" />}
                {d.youtube_url && <Youtube size={16} className="text-slate-400" />}
                {d.email_contact && <Mail size={16} className="text-slate-400" />}
                {d.map_location_link && <MapPin size={16} className="text-slate-400" />}
                {!d.twitter_url && !d.linkedin_url && !d.youtube_url && !d.email_contact && (
                  <span className="text-slate-500 text-xs">Social icons will appear here</span>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-slate-700 px-6 py-3">
            <p className="text-slate-500 text-xs text-center">
              {d.copyright_text || inst.default_copyright_text}
              {(d.website_credits || inst.default_website_credits) && (
                <> · {d.website_credits || inst.default_website_credits}</>
              )}
            </p>
          </div>
        </div>
      </SectionCard>

      {editing && (
        <div className="flex justify-end gap-2">
          <button onClick={() => { setBranding(brandingSaved); setEditing(false) }} className="btn-secondary" disabled={saving}>Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
            <Save size={14} /> {saving ? 'Saving…' : 'Save Footer Settings'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TABS = ['Header', 'Footer'] as const
type Tab = typeof TABS[number]

export default function BrandingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Header')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 font-display">Branding &amp; Layout</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure the header and footer that appear on the public-facing department website.
        </p>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-5 py-1.5 rounded-lg text-sm font-medium transition-all',
              activeTab === tab ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700',
            )}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Header' ? <HeaderTab /> : <FooterTab />}
    </div>
  )
}
