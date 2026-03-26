import { useState, useRef } from 'react'
import { Camera, Mail, User, Shield, MapPin, Save } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { useToast } from '@/shared/context/ToastContext'
import { ProfileSchema } from '@/app-modules/profile/types'
import { validateImageFile } from '@/shared/utils/validateFile'
import FormField from '@/shared/components/forms/FormField'
import clsx from 'clsx'

const roleLabel: Record<string, string> = {
  super_admin: 'Super Admin',
  dept_admin:  'Dept Admin',
  admin:       'Admin',
  editor:      'Editor',
  viewer:      'Viewer',
}

const roleBadgeClass: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-700',
  dept_admin:  'bg-blue-100 text-blue-700',
  admin:       'bg-slate-100 text-slate-600',
  editor:      'bg-amber-100 text-amber-700',
  viewer:      'bg-slate-100 text-slate-500',
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [avatar, setAvatar] = useState(user.avatar ?? '')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateImageFile(file)
    if (err) { toast.error(err); e.target.value = ''; return }
    const reader = new FileReader()
    reader.onload = ev => {
      setAvatar(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    const parsed = ProfileSchema.safeParse({ name: name.trim(), email: email.trim() })
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>)
      return
    }
    setErrors({})
    setSaving(true)
    await new Promise(r => setTimeout(r, 300))
    updateProfile({ name: name.trim(), email: email.trim(), avatar: avatar || undefined })
    setSaving(false)
    toast.success('Profile updated successfully')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-slate-800">My Profile</h2>
        <p className="text-sm text-slate-500">Manage your account information</p>
      </div>

      {/* Avatar section */}
      <div className="card p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            {avatar ? (
              <img
                src={avatar}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-brand-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-brand-100">
                {initials}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-brand-600 hover:bg-brand-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
              title="Change photo"
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{user.name}</h3>
            <p className="text-sm text-slate-500">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={clsx('text-xs font-medium px-2.5 py-1 rounded-full', roleBadgeClass[user.role])}>
                <Shield size={10} className="inline mr-1" />
                {roleLabel[user.role] ?? user.role}
              </span>
              {user.department && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin size={10} />
                  {user.department}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-4">Personal Information</h3>
        <div className="space-y-4">
          <FormField label="Full Name" required error={errors.name?.[0]}>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input-field pl-9"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
          </FormField>

          <FormField label="Email Address" required error={errors.email?.[0]}>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                className="input-field pl-9"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your.email@biet.edu"
              />
            </div>
          </FormField>

          <FormField label="Role" hint="Contact a Super Admin to change your role">
            <input
              className="input-field bg-slate-50 cursor-not-allowed"
              value={roleLabel[user.role] ?? user.role}
              readOnly
            />
          </FormField>

          {user.department && (
            <FormField label="Department" hint="Department is assigned by administration">
              <input
                className="input-field bg-slate-50 cursor-not-allowed"
                value={user.department}
                readOnly
              />
            </FormField>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className={clsx('btn-primary', saving && 'opacity-70 cursor-not-allowed')}
          >
            <Save size={15} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Account info (read-only) */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-4">Account Details</h3>
        <dl className="space-y-3">
          <div className="flex justify-between text-sm">
            <dt className="text-slate-500">Account ID</dt>
            <dd className="font-mono text-slate-700">#{user.id.padStart(6, '0')}</dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-slate-500">Account Status</dt>
            <dd>
              <span className={clsx(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              )}>
                {user.status}
              </span>
            </dd>
          </div>
          {user.lastLogin && (
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">Last Login</dt>
              <dd className="text-slate-700">{new Date(user.lastLogin).toLocaleString()}</dd>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <dt className="text-slate-500">Member Since</dt>
            <dd className="text-slate-700">{new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
