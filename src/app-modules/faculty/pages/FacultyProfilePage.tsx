import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Camera, Mail, Phone, MapPin, BookOpen,
  Award, Briefcase, FileText, FlaskConical,
} from 'lucide-react'
import { facultyService } from '@/app-modules/faculty/api/facultyApi'
import type { Faculty } from '@/shared/types/models'
import { useAuth } from '@/auth/AuthContext'
import { useToast } from '@/shared/context/ToastContext'
import { isSuperAdmin, canManageDepartment } from '@/shared/utils/permissions'
import { validateImageFile } from '@/shared/utils/validateFile'
import Badge, { statusVariant } from '@/shared/components/common/Badge'
import BasicInfoTab from '../components/BasicInfoTab'
import CoursesTab from '../components/CoursesTab'
import ProjectsTab from '../components/ProjectsTab'
import HonorsTab from '../components/HonorsTab'
import CvTab from '../components/CvTab'
import PublicationsTable from '../components/PublicationsTable'
import EducationTimeline from '../components/EducationTimeline'
import ExperienceTimeline from '../components/ExperienceTimeline'
import clsx from 'clsx'

const TABS = [
  { id: 'basic',        label: 'Basic Info',   icon: BookOpen },
  { id: 'publications', label: 'Publications', icon: FileText },
  { id: 'education',    label: 'Education',    icon: Award },
  { id: 'experience',   label: 'Experience',   icon: Briefcase },
  { id: 'courses',      label: 'Courses',      icon: BookOpen },
  { id: 'projects',     label: 'Projects',     icon: FlaskConical },
  { id: 'honors',       label: 'Awards',       icon: Award },
  { id: 'cv',           label: 'CV',           icon: FileText },
] as const

type TabId = typeof TABS[number]['id']

export default function FacultyProfilePage() {
  const { facultyId } = useParams<{ facultyId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const photoInputRef = useRef<HTMLInputElement>(null)

  const [faculty, setFaculty] = useState<Faculty | undefined>(undefined)
  const [activeTab, setActiveTab] = useState<TabId>('basic')

  useEffect(() => {
    if (facultyId) {
      facultyService.getById(facultyId).then(setFaculty).catch(() => setFaculty(undefined))
    }
  }, [facultyId])

  if (!faculty) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Faculty member not found.</p>
        <button onClick={() => navigate(-1)} className="btn-secondary mt-4">Go Back</button>
      </div>
    )
  }

  const fac: Faculty = faculty
  const canEdit = isSuperAdmin(user) || canManageDepartment(user, fac.department)
  const initials = fac.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  async function persist(changes: Partial<Faculty>) {
    const updated = await facultyService.update(fac.id, changes as Record<string, unknown>)
    setFaculty(updated)
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateImageFile(file)
    if (err) { toast.error(err); e.target.value = ''; return }
    const reader = new FileReader()
    reader.onload = ev => {
      persist({ profileImage: ev.target?.result as string })
      toast.success('Photo updated')
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={15} /> Back to Faculty
      </button>

      {/* Header card */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="relative flex-shrink-0">
            {fac.profileImage ? (
              <img src={fac.profileImage} alt={fac.name} className="w-24 h-24 rounded-full object-cover ring-4 ring-brand-100" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-brand-100">
                {initials}
              </div>
            )}
            {canEdit && (
              <button
                onClick={() => photoInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-brand-600 hover:bg-brand-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                title="Change photo"
              >
                <Camera size={14} />
              </button>
            )}
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 flex-wrap">
              <div>
                <h2 className="text-xl font-display font-bold text-slate-800">{fac.name}</h2>
                <p className="text-sm text-slate-500">{fac.designation} · {fac.department}</p>
              </div>
              <Badge variant={statusVariant(fac.status)}>{fac.status}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><Mail size={13} />{fac.email}</span>
              {fac.phone && <span className="flex items-center gap-1.5"><Phone size={13} />{fac.phone}</span>}
              {fac.officeLocation && <span className="flex items-center gap-1.5"><MapPin size={13} />{fac.officeLocation}</span>}
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-sm">
              <span className="text-slate-600"><strong>{fac.experience}</strong> yrs experience</span>
              <span className="text-slate-600"><strong>{(fac.publications ?? []).length}</strong> publications</span>
              <span className="text-slate-600"><strong>{(fac.projects ?? []).length}</strong> projects</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <nav className="flex gap-1 min-w-max">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="card p-6">
        {activeTab === 'basic' && (
          <BasicInfoTab fac={fac} canEdit={canEdit} persist={persist} />
        )}
        {activeTab === 'publications' && (
          <PublicationsTable
            publications={fac.publications ?? []}
            canEdit={canEdit}
            onChange={publications => persist({ publications })}
          />
        )}
        {activeTab === 'education' && (
          <EducationTimeline
            education={fac.education ?? []}
            canEdit={canEdit}
            onChange={education => persist({ education })}
          />
        )}
        {activeTab === 'experience' && (
          <ExperienceTimeline
            experience={fac.workExperience ?? []}
            canEdit={canEdit}
            onChange={workExperience => persist({ workExperience })}
          />
        )}
        {activeTab === 'courses' && (
          <CoursesTab fac={fac} canEdit={canEdit} persist={persist} />
        )}
        {activeTab === 'projects' && (
          <ProjectsTab fac={fac} canEdit={canEdit} persist={persist} />
        )}
        {activeTab === 'honors' && (
          <HonorsTab fac={fac} canEdit={canEdit} persist={persist} />
        )}
        {activeTab === 'cv' && (
          <CvTab fac={fac} canEdit={canEdit} persist={persist} />
        )}
      </div>
    </div>
  )
}
