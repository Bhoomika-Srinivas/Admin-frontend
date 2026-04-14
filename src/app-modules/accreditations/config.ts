export type AccreditationType = 'AICTE' | 'VTU' | 'NAAC' | 'NIRF' | 'NBA' | 'AISHE'

export const ACCREDITATION_TYPES: AccreditationType[] = ['AICTE', 'VTU', 'NAAC', 'NIRF', 'NBA', 'AISHE']

export const TYPE_META: Record<AccreditationType, { label: string; description: string; color: string }> = {
  AICTE: { label: 'AICTE', description: 'All India Council for Technical Education', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  VTU:   { label: 'VTU',   description: 'Visvesvaraya Technological University',       color: 'bg-purple-50 text-purple-700 border-purple-200' },
  NAAC:  { label: 'NAAC',  description: 'National Assessment and Accreditation Council', color: 'bg-green-50 text-green-700 border-green-200' },
  NIRF:  { label: 'NIRF',  description: 'National Institutional Ranking Framework',    color: 'bg-amber-50 text-amber-700 border-amber-200' },
  NBA:   { label: 'NBA',   description: 'National Board of Accreditation',             color: 'bg-red-50 text-red-700 border-red-200' },
  AISHE: { label: 'AISHE', description: 'All India Survey on Higher Education',        color: 'bg-slate-50 text-slate-700 border-slate-200' },
}

// ── AICTE ─────────────────────────────────────────────────────────────────────
export const AICTE_SECTIONS = ['EOA', 'IDEA LAB', 'SPICES'] as const
export type AICTESection = typeof AICTE_SECTIONS[number]
export const AICTE_SPICES_SUB = ['Activities', 'Clubs'] as const

// ── NAAC ──────────────────────────────────────────────────────────────────────
export const NAAC_SECTIONS = [
  'Accreditation Certificates',
  'IQAC',
  'AQAR Reports',
  'IIQA',
  'SSR Documents',
] as const
export type NAACSection = typeof NAAC_SECTIONS[number]

export const NAAC_DISPLAY_TYPE: Record<NAACSection, 'table' | 'cards'> = {
  'Accreditation Certificates': 'table',
  'IQAC':                       'table',
  'AQAR Reports':               'cards',
  'IIQA':                       'table',
  'SSR Documents':              'cards',
}

// ── NBA ───────────────────────────────────────────────────────────────────────
export const NBA_SECTIONS = ['Accreditation Details', 'Institute Level', 'Department Level'] as const
export type NBASection = typeof NBA_SECTIONS[number]

export const NBA_INSTITUTE_SUBS = [
  'General',
  'Course Files',
  'Laboratory Record and Manual',
  'First Year Time Table',
  'First Year Faculty List',
  'Governing Bodies',
  'Feedback Forms',
  'Others',
] as const

export const NBA_SUB_SUB: Record<string, readonly string[]> = {
  'Laboratory Record and Manual': ['Physics Cycle', 'Chemistry Cycle'],
  'Feedback Forms':               ['Faculty', 'Facilities'],
}

export const NBA_DEPARTMENTS = [
  'Information Science & Engineering',
  'Bio-Technology Engineering',
  'Chemical Engineering',
  'Textile Technology',
] as const

export const NBA_DEPT_SUBS = ['Faculty List', 'Placement List'] as const

export function nbaHasSubSub(sub: string): boolean {
  return sub in NBA_SUB_SUB
}

// ── Central config ────────────────────────────────────────────────────────────
export const ACCREDITATION_CONFIG = {
  AICTE: { sections: AICTE_SECTIONS, spiceSubs: AICTE_SPICES_SUB },
  VTU:   { sections: [] as string[] },
  NAAC:  { sections: NAAC_SECTIONS, displayType: NAAC_DISPLAY_TYPE },
  NIRF:  { sections: [] as string[] },
  NBA: {
    sections:    NBA_SECTIONS,
    instituteSubs: NBA_INSTITUTE_SUBS,
    subSubSections: NBA_SUB_SUB,
    departments: NBA_DEPARTMENTS,
    deptSubs:    NBA_DEPT_SUBS,
  },
  AISHE: { sections: [] as string[] },
} as const
