import { gqlRequest } from '@/api/graphqlClient'
import type {
  FacultyResearchSummary,
  PhDGuide,
  PhdScholar,
  PublicationProfile,
  ResearchGrant,
  Patent,
} from '@/shared/types/models'

import {
  LIST_PUBLICATION_PROFILES,
  LIST_RESEARCH_GRANTS,
  LIST_PATENTS,
  LIST_FACULTY_RESEARCH_SUMMARIES,
  LIST_PHD_GUIDES,
  LIST_PHD_SCHOLARS,
  LIST_PHD_SCHOLARS_BY_GUIDE,
} from '../graphql/deptResearch.query'

import {
  SAVE_PUBLICATION_PROFILE,
  DELETE_PUBLICATION_PROFILE,
  CREATE_RESEARCH_GRANT,
  UPDATE_RESEARCH_GRANT,
  DELETE_RESEARCH_GRANT,
  CREATE_PATENT,
  UPDATE_PATENT,
  DELETE_PATENT,
  CREATE_FACULTY_RESEARCH_SUMMARY,
  UPDATE_FACULTY_RESEARCH_SUMMARY,
  DELETE_FACULTY_RESEARCH_SUMMARY,
  CREATE_PHD_GUIDE,
  UPDATE_PHD_GUIDE,
  DELETE_PHD_GUIDE,
  CREATE_PHD_SCHOLAR,
  UPDATE_PHD_SCHOLAR,
  DELETE_PHD_SCHOLAR,
} from '../graphql/deptResearch.mutation'

// ── Backend response types (use backend primary key names) ────────────────────

type BackendPublicationProfile = Omit<PublicationProfile, 'id'> & { publicationProfileId: string }
type BackendResearchGrant = Omit<ResearchGrant, 'id'> & { researchGrantId: string }
type BackendPatent = Omit<Patent, 'id'> & { patentId: string }
type BackendFacultyResearchSummary = Omit<FacultyResearchSummary, 'id' | 'yearOfDegreeAwarded'> & { facultyResearchSummaryId: string }
type BackendPhDGuide = Omit<PhDGuide, 'id'> & { phdGuideId: string }
type BackendPhdScholar = Omit<PhdScholar, 'id'> & { phdScholarId: string }

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapPublicationProfile(b: BackendPublicationProfile): PublicationProfile {
  const { publicationProfileId, ...rest } = b
  return { id: publicationProfileId, ...rest }
}

function mapResearchGrant(b: BackendResearchGrant): ResearchGrant {
  const { researchGrantId, ...rest } = b
  return { id: researchGrantId, ...rest }
}

function mapPatent(b: BackendPatent): Patent {
  const { patentId, ...rest } = b
  return { id: patentId, ...rest }
}

function mapFacultyResearchSummary(b: BackendFacultyResearchSummary): FacultyResearchSummary {
  const { facultyResearchSummaryId, ...rest } = b
  return { id: facultyResearchSummaryId, ...rest, department: '', yearOfDegreeAwarded: undefined }
}

function mapPhDGuide(b: BackendPhDGuide): PhDGuide {
  const { phdGuideId, ...rest } = b
  return { id: phdGuideId, ...rest }
}

function mapPhdScholar(b: BackendPhdScholar): PhdScholar {
  const { phdScholarId, ...rest } = b
  return { id: phdScholarId, ...rest }
}

// ── PublicationProfile Service ────────────────────────────────────────────────

export const publicationProfileService = {
  async getAll(deptId: string): Promise<PublicationProfile[]> {
    const data = await gqlRequest<{ listPublicationProfiles: { items: BackendPublicationProfile[] } }>(
      LIST_PUBLICATION_PROFILES,
      { deptId },
    )
    return (data.listPublicationProfiles?.items ?? []).map(mapPublicationProfile)
  },

  async save(input: Omit<PublicationProfile, 'id'> & { id?: string }): Promise<PublicationProfile> {
    const { id: _id, department: _dept, ...rest } = input
    const data = await gqlRequest<{ savePublicationProfile: BackendPublicationProfile }>(
      SAVE_PUBLICATION_PROFILE,
      { input: rest },
    )
    return mapPublicationProfile(data.savePublicationProfile)
  },

  async delete(id: string): Promise<void> {
    await gqlRequest(DELETE_PUBLICATION_PROFILE, { publicationProfileId: id })
  },
}

// ── ResearchGrant Service ─────────────────────────────────────────────────────

export const researchGrantService = {
  async getAll(deptId: string): Promise<ResearchGrant[]> {
    const data = await gqlRequest<{ listResearchGrants: { items: BackendResearchGrant[] } }>(
      LIST_RESEARCH_GRANTS,
      { deptId },
    )
    return (data.listResearchGrants?.items ?? []).map(mapResearchGrant)
  },

  async create(input: Omit<ResearchGrant, 'id'>): Promise<void> {
    await gqlRequest(CREATE_RESEARCH_GRANT, { input })
  },

  async update(id: string, updates: Partial<Omit<ResearchGrant, 'id' | 'deptId'>>): Promise<ResearchGrant> {
    const data = await gqlRequest<{ updateResearchGrant: BackendResearchGrant }>(
      UPDATE_RESEARCH_GRANT,
      { input: { researchGrantId: id, ...updates } },
    )
    return mapResearchGrant(data.updateResearchGrant)
  },

  async delete(id: string): Promise<void> {
    await gqlRequest(DELETE_RESEARCH_GRANT, { researchGrantId: id })
  },
}

// ── Patent Service ────────────────────────────────────────────────────────────

export const patentService = {
  async getAll(deptId: string): Promise<Patent[]> {
    const data = await gqlRequest<{ listPatents: { items: BackendPatent[] } }>(
      LIST_PATENTS,
      { deptId },
    )
    return (data.listPatents?.items ?? []).map(mapPatent)
  },

  async create(input: Omit<Patent, 'id'>): Promise<void> {
    await gqlRequest(CREATE_PATENT, { input })
  },

  async update(id: string, updates: Partial<Omit<Patent, 'id' | 'deptId'>>): Promise<Patent> {
    const data = await gqlRequest<{ updatePatent: BackendPatent }>(
      UPDATE_PATENT,
      { input: { patentId: id, ...updates } },
    )
    return mapPatent(data.updatePatent)
  },

  async delete(id: string): Promise<void> {
    await gqlRequest(DELETE_PATENT, { patentId: id })
  },
}

// ── FacultyResearch Service ───────────────────────────────────────────────────

export const facultyResearchService = {
  async getAll(deptId: string): Promise<FacultyResearchSummary[]> {
    const data = await gqlRequest<{ listFacultyResearchSummaries: { items: BackendFacultyResearchSummary[] } }>(
      LIST_FACULTY_RESEARCH_SUMMARIES,
      { deptId },
    )
    return (data.listFacultyResearchSummaries?.items ?? []).map(mapFacultyResearchSummary)
  },

  async create(input: Omit<FacultyResearchSummary, 'id'>): Promise<void> {
    const {
      deptId, facultyId, researchArea, guideName, guideDesignation,
      guideInstitution, guideType, thesisTitle, university,
      yearOfRegistration, yearOfDegreeAwarded, courseWorkCompleted, prePhDVivaVoce,
      finalThesisSubmitted, researchStatus, thesisDocumentUrl, remarks,
    } = input
    await gqlRequest(CREATE_FACULTY_RESEARCH_SUMMARY, {
      input: {
        deptId, facultyId, researchArea, guideName, guideDesignation,
        guideInstitution, guideType, thesisTitle, university,
        yearOfRegistration, yearOfDegreeAwarded, courseWorkCompleted, prePhDVivaVoce,
        finalThesisSubmitted, researchStatus, thesisDocumentUrl, remarks,
      },
    })
  },

  async update(id: string, updates: Partial<Omit<FacultyResearchSummary, 'id' | 'deptId'>>): Promise<FacultyResearchSummary> {
    const { department: _dept, facultyId: _fid, ...rest } = updates
    const data = await gqlRequest<{ updateFacultyResearchSummary: BackendFacultyResearchSummary }>(
      UPDATE_FACULTY_RESEARCH_SUMMARY,
      { input: { facultyResearchSummaryId: id, ...rest } },
    )
    return mapFacultyResearchSummary(data.updateFacultyResearchSummary)
  },

  async delete(id: string): Promise<void> {
    await gqlRequest(DELETE_FACULTY_RESEARCH_SUMMARY, { facultyResearchSummaryId: id })
  },
}

// ── PhdGuide Service ──────────────────────────────────────────────────────────

export const phdGuideService = {
  async getAll(deptId: string): Promise<PhDGuide[]> {
    const data = await gqlRequest<{ listPhdGuides: { items: BackendPhDGuide[] } }>(
      LIST_PHD_GUIDES,
      { deptId },
    )
    return (data.listPhdGuides?.items ?? []).map(mapPhDGuide)
  },

  async create(input: Omit<PhDGuide, 'id'>): Promise<PhDGuide> {
    const data = await gqlRequest<{ createPhdGuide: BackendPhDGuide }>(
      CREATE_PHD_GUIDE,
      { input },
    )
    return mapPhDGuide(data.createPhdGuide)
  },

  async update(id: string, updates: Partial<Omit<PhDGuide, 'id' | 'deptId'>>): Promise<PhDGuide> {
    const data = await gqlRequest<{ updatePhdGuide: BackendPhDGuide }>(
      UPDATE_PHD_GUIDE,
      { input: { phdGuideId: id, ...updates } },
    )
    return mapPhDGuide(data.updatePhdGuide)
  },

  async delete(id: string): Promise<void> {
    await gqlRequest(DELETE_PHD_GUIDE, { phdGuideId: id })
  },
}

// ── PhdScholar Service ────────────────────────────────────────────────────────

export const phdScholarService = {
  async getAll(deptId: string): Promise<PhdScholar[]> {
    const data = await gqlRequest<{ listPhdScholars: { items: BackendPhdScholar[] } }>(
      LIST_PHD_SCHOLARS,
      { deptId },
    )
    return (data.listPhdScholars?.items ?? []).map(mapPhdScholar)
  },

  async getByGuide(deptId: string, guideFacultyId: string): Promise<PhdScholar[]> {
    const data = await gqlRequest<{ listPhdScholars: { items: BackendPhdScholar[] } }>(
      LIST_PHD_SCHOLARS_BY_GUIDE,
      { deptId, guideFacultyId },
    )
    return (data.listPhdScholars?.items ?? []).map(mapPhdScholar)
  },

  async create(input: Omit<PhdScholar, 'id'>): Promise<PhdScholar> {
    const data = await gqlRequest<{ createPhdScholar: BackendPhdScholar }>(
      CREATE_PHD_SCHOLAR,
      { input },
    )
    return mapPhdScholar(data.createPhdScholar)
  },

  async update(id: string, updates: Partial<Omit<PhdScholar, 'id' | 'deptId'>>): Promise<PhdScholar> {
    const data = await gqlRequest<{ updatePhdScholar: BackendPhdScholar }>(
      UPDATE_PHD_SCHOLAR,
      { input: { phdScholarId: id, ...updates } },
    )
    return mapPhdScholar(data.updatePhdScholar)
  },

  async delete(id: string): Promise<void> {
    await gqlRequest(DELETE_PHD_SCHOLAR, { phdScholarId: id })
  },
}
