import { gqlRequest } from '@/api/graphqlClient'
import type { InstituteSettings, DeptBranding } from '@/shared/types/models'
import { GET_DEPT_BRANDING, GET_INSTITUTE_SETTINGS } from '../graphql/deptBranding.query'
import { SAVE_DEPT_BRANDING, SAVE_INSTITUTE_SETTINGS } from '../graphql/deptBranding.mutation'

// ── Backend shape helpers ──────────────────────────────────────────────────────

interface BackendDeptBranding {
  deptId: string
  departmentTitle: string
  departmentLogoUrl?: string
  twitterUrl?: string
  linkedinUrl?: string
  youtubeUrl?: string
  emailContact?: string
  mapLocationLink?: string
  fullAddress?: string
  hodPhone?: string
  hodEmail?: string
  departmentPhone?: string
  departmentFax?: string
  departmentEmail?: string
  copyrightText?: string
  websiteCredits?: string
}

interface BackendInstituteSettings {
  instituteName: string
  instituteLogoUrl?: string
  defaultCopyrightText?: string
  defaultWebsiteCredits?: string
}

function mapDeptBranding(raw: BackendDeptBranding): DeptBranding {
  return {
    deptId:            raw.deptId,
    department_title:  raw.departmentTitle ?? '',
    department_logo:   raw.departmentLogoUrl ?? '',
    twitter_url:       raw.twitterUrl ?? '',
    linkedin_url:      raw.linkedinUrl ?? '',
    youtube_url:       raw.youtubeUrl ?? '',
    email_contact:     raw.emailContact ?? '',
    map_location_link: raw.mapLocationLink ?? '',
    full_address:      raw.fullAddress ?? '',
    hod_phone:         raw.hodPhone ?? '',
    hod_email:         raw.hodEmail ?? '',
    department_phone:  raw.departmentPhone ?? '',
    department_fax:    raw.departmentFax ?? '',
    department_email:  raw.departmentEmail ?? '',
    copyright_text:    raw.copyrightText ?? '',
    website_credits:   raw.websiteCredits ?? '',
  }
}

function defaultBranding(deptId: string): DeptBranding {
  return {
    deptId, department_title: '', department_logo: '',
    twitter_url: '', linkedin_url: '', youtube_url: '', email_contact: '',
    map_location_link: '', full_address: '', hod_phone: '', hod_email: '',
    department_phone: '', department_fax: '', department_email: '',
    copyright_text: '', website_credits: '',
  }
}

function mapInstituteSettings(raw: BackendInstituteSettings): InstituteSettings {
  return {
    institute_name:          raw.instituteName ?? '',
    institute_logo:          raw.instituteLogoUrl ?? '',
    default_copyright_text:  raw.defaultCopyrightText ?? '',
    default_website_credits: raw.defaultWebsiteCredits ?? '',
  }
}

function defaultInstituteSettings(): InstituteSettings {
  return {
    institute_name: 'Bheemanna Khandre Institute of Technology',
    institute_logo: '',
    default_copyright_text: '© 2024 Bheemanna Khandre Institute of Technology. All rights reserved.',
    default_website_credits: 'Designed & Developed by BIET Web Team',
  }
}

// ── Services ──────────────────────────────────────────────────────────────────

export const instituteSettingsService = {
  async get(): Promise<InstituteSettings> {
    const data = await gqlRequest<{ getInstituteSettings: BackendInstituteSettings | null }>(
      GET_INSTITUTE_SETTINGS,
    )
    return data.getInstituteSettings ? mapInstituteSettings(data.getInstituteSettings) : defaultInstituteSettings()
  },

  async save(input: InstituteSettings): Promise<InstituteSettings> {
    const data = await gqlRequest<{ saveInstituteSettings: BackendInstituteSettings }>(
      SAVE_INSTITUTE_SETTINGS,
      {
        input: {
          instituteName:         input.institute_name,
          instituteLogoUrl:      input.institute_logo,
          defaultCopyrightText:  input.default_copyright_text,
          defaultWebsiteCredits: input.default_website_credits,
        },
      },
    )
    return mapInstituteSettings(data.saveInstituteSettings)
  },
}

export const deptBrandingService = {
  async get(deptId: string): Promise<DeptBranding> {
    const data = await gqlRequest<{ getDeptBranding: BackendDeptBranding | null }>(
      GET_DEPT_BRANDING,
      { deptId },
    )
    return data.getDeptBranding ? mapDeptBranding(data.getDeptBranding) : defaultBranding(deptId)
  },

  async save(deptId: string, input: Omit<DeptBranding, 'deptId'>): Promise<DeptBranding> {
    const data = await gqlRequest<{ saveDeptBranding: BackendDeptBranding }>(
      SAVE_DEPT_BRANDING,
      {
        deptId,
        input: {
          departmentTitle:  input.department_title,
          departmentLogoUrl: input.department_logo,
          twitterUrl:       input.twitter_url,
          linkedinUrl:      input.linkedin_url,
          youtubeUrl:       input.youtube_url,
          emailContact:     input.email_contact,
          mapLocationLink:  input.map_location_link,
          fullAddress:      input.full_address,
          hodPhone:         input.hod_phone,
          hodEmail:         input.hod_email,
          departmentPhone:  input.department_phone,
          departmentFax:    input.department_fax,
          departmentEmail:  input.department_email,
          copyrightText:    input.copyright_text,
          websiteCredits:   input.website_credits,
        },
      },
    )
    return mapDeptBranding(data.saveDeptBranding)
  },
}
