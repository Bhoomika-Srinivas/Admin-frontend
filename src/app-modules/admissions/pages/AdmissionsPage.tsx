import { useState } from 'react'
import clsx from 'clsx'
import OverviewSection      from '../components/OverviewSection'
import ProgramsSection      from '../components/ProgramsSection'
import EligibilitySection   from '../components/EligibilitySection'
import ProcessSection       from '../components/ProcessSection'
import DatesSection         from '../components/DatesSection'
import ProspectusSection    from '../components/ProspectusSection'
import FeeStructureSection  from '../components/FeeStructureSection'
import ScholarshipsSection  from '../components/ScholarshipsSection'
import AuditSection         from '../components/AuditSection'
import EnquiriesSection     from '../components/EnquiriesSection'
import { useEnquiries }     from '../hooks/useAdmissions'

type Section =
  | 'overview'
  | 'programs'
  | 'eligibility'
  | 'process'
  | 'dates'
  | 'prospectus'
  | 'fees'
  | 'scholarships'
  | 'audit'
  | 'enquiries'

const TABS: { id: Section; label: string }[] = [
  { id: 'overview',     label: 'Overview' },
  { id: 'programs',     label: 'Programs Offered' },
  { id: 'eligibility',  label: 'Eligibility' },
  { id: 'process',      label: 'Admission Process' },
  { id: 'dates',        label: 'Important Dates' },
  { id: 'prospectus',   label: 'Prospectus' },
  { id: 'fees',         label: 'Fee Structure' },
  { id: 'scholarships', label: 'Scholarships' },
  { id: 'audit',        label: 'Audit Statement' },
  { id: 'enquiries',    label: 'Enquiries' },
]

export default function AdmissionsPage() {
  const [section, setSection] = useState<Section>('overview')
  const { data: enquiries } = useEnquiries()
  const newCount = enquiries.filter(e => e.status === 'New').length

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-display font-bold text-slate-800">Admissions</h2>
        <p className="text-sm text-slate-500 mt-0.5">Manage admissions content, programs, dates, and enquiries.</p>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-hide">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setSection(t.id)}
            className={clsx(
              'px-3 py-2 text-sm font-medium rounded-t-md whitespace-nowrap transition-colors border-b-2 -mb-px shrink-0',
              section === t.id
                ? 'border-brand-600 text-brand-700 bg-brand-50'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50',
            )}
          >
            {t.label}
            {t.id === 'enquiries' && newCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs leading-none">
                {newCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div>
        {section === 'overview'     && <OverviewSection />}
        {section === 'programs'     && <ProgramsSection />}
        {section === 'eligibility'  && <EligibilitySection />}
        {section === 'process'      && <ProcessSection />}
        {section === 'dates'        && <DatesSection />}
        {section === 'prospectus'   && <ProspectusSection />}
        {section === 'fees'         && <FeeStructureSection />}
        {section === 'scholarships' && <ScholarshipsSection />}
        {section === 'audit'        && <AuditSection />}
        {section === 'enquiries'    && <EnquiriesSection />}
      </div>
    </div>
  )
}
