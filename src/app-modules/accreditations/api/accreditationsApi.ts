import { gqlRequest } from '@/api/graphqlClient'
import type { AccreditationRecord } from '@/shared/types/models'
import type { AccreditationType } from '../config'
import {
  LIST_ACCREDITATIONS,
  GET_ACCREDITATION,
} from '../graphql/accreditations.query'
import {
  CREATE_ACCREDITATION,
  UPDATE_ACCREDITATION,
  DELETE_ACCREDITATION,
} from '../graphql/accreditations.mutation'

// ── Filters ────────────────────────────────────────────────────────────────────

export interface AccreditationFilters {
  type: AccreditationType
  section?: string
  sub_section?: string
  sub_sub_section?: string
  department?: string
}

// ── Backend shape ──────────────────────────────────────────────────────────────

interface BackendAccreditationRecord {
  accreditationId: string
  type: AccreditationType
  section?: string
  sub_section?: string
  sub_sub_section?: string
  department?: string
  title: string
  description?: string
  year?: string
  program?: string
  cycle?: string
  file_url: string
  order?: number
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

function mapAccreditation(raw: BackendAccreditationRecord): AccreditationRecord {
  return {
    id:              raw.accreditationId,
    type:            raw.type,
    title:           raw.title,
    file_url:        raw.file_url,
    section:         raw.section,
    sub_section:     raw.sub_section,
    sub_sub_section: raw.sub_sub_section,
    department:      raw.department,
    year:            raw.year,
    program:         raw.program,
    cycle:           raw.cycle,
    description:     raw.description,
    order:           raw.order,
  }
}

// ── Service ───────────────────────────────────────────────────────────────────

export const accreditationService = {
  async getAll(filters: AccreditationFilters): Promise<AccreditationRecord[]> {
    const data = await gqlRequest<{ listAccreditationRecords: { items: BackendAccreditationRecord[] } }>(
      LIST_ACCREDITATIONS,
      { ...filters },
    )
    return (data.listAccreditationRecords?.items ?? []).map(mapAccreditation)
  },

  async getById(id: string): Promise<AccreditationRecord | undefined> {
    try {
      const data = await gqlRequest<{ getAccreditationRecord: BackendAccreditationRecord }>(
        GET_ACCREDITATION,
        { accreditationId: id },
      )
      return mapAccreditation(data.getAccreditationRecord)
    } catch {
      return undefined
    }
  },

  async create(input: Omit<AccreditationRecord, 'id'>): Promise<AccreditationRecord> {
    const data = await gqlRequest<{ createAccreditationRecord: BackendAccreditationRecord }>(
      CREATE_ACCREDITATION,
      { input },
    )
    return mapAccreditation(data.createAccreditationRecord)
  },

  async update(id: string, input: Partial<Omit<AccreditationRecord, 'id'>>): Promise<AccreditationRecord> {
    const data = await gqlRequest<{ updateAccreditationRecord: BackendAccreditationRecord }>(
      UPDATE_ACCREDITATION,
      { input: { accreditationId: id, ...input } },
    )
    return mapAccreditation(data.updateAccreditationRecord)
  },

  async delete(id: string): Promise<void> {
    await gqlRequest(DELETE_ACCREDITATION, { accreditationId: id })
  },
}
