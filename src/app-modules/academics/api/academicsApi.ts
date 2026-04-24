import { gqlRequest } from '@/api/graphqlClient'
import type { SchemeSyllabusEntry, AcademicCalendar, RulesRegulations, RankHolder } from '@/shared/types/models'
import {
  LIST_SCHEME_SYLLABUS,
  LIST_ACADEMIC_CALENDAR,
  GET_RULES_REGULATIONS,
  LIST_RANK_HOLDERS,
} from '../graphql/academics.query'
import {
  CREATE_SCHEME_SYLLABUS, UPDATE_SCHEME_SYLLABUS, DELETE_SCHEME_SYLLABUS,
  CREATE_ACADEMIC_CALENDAR, UPDATE_ACADEMIC_CALENDAR, DELETE_ACADEMIC_CALENDAR,
  UPDATE_RULES_REGULATIONS,
  CREATE_RANK_HOLDER, UPDATE_RANK_HOLDER, DELETE_RANK_HOLDER,
} from '../graphql/academics.mutation'

// ─── Scheme & Syllabus ────────────────────────────────────────────────────────

function mapEntry(raw: Record<string, unknown>): SchemeSyllabusEntry {
  return {
    syllabusId: raw.syllabusId as string,
    year:       raw.year as string,
    category:   (raw.category as string) ?? '',
    title:      raw.title as string,
    subtitle:   raw.subtitle as string | undefined,
    fileUrl:    (raw.fileUrl as string) ?? '',
    order:      (raw.order as number) ?? 0,
    createdAt:  raw.createdAt as string | undefined,
  }
}

export const schemeSyllabusService = {
  async getAll(): Promise<SchemeSyllabusEntry[]> {
    const data = await gqlRequest<{ listSchemeSyllabus: { items: Record<string, unknown>[] } }>(
      LIST_SCHEME_SYLLABUS
    )
    return (data.listSchemeSyllabus?.items ?? []).map(mapEntry)
  },

  async create(input: Omit<SchemeSyllabusEntry, 'syllabusId' | 'createdAt'>): Promise<SchemeSyllabusEntry> {
    const data = await gqlRequest<{ createSchemeSyllabus: Record<string, unknown> }>(
      CREATE_SCHEME_SYLLABUS,
      { input }
    )
    return mapEntry(data.createSchemeSyllabus)
  },

  async update(syllabusId: string, fields: Partial<Omit<SchemeSyllabusEntry, 'syllabusId' | 'createdAt'>>): Promise<SchemeSyllabusEntry> {
    const data = await gqlRequest<{ updateSchemeSyllabus: Record<string, unknown> }>(
      UPDATE_SCHEME_SYLLABUS,
      { input: { syllabusId, ...fields } }
    )
    return mapEntry(data.updateSchemeSyllabus)
  },

  async delete(syllabusId: string): Promise<void> {
    await gqlRequest(DELETE_SCHEME_SYLLABUS, { syllabusId })
  },
}

// ─── Academic Calendar ────────────────────────────────────────────────────────

function mapCalendar(raw: Record<string, unknown>): AcademicCalendar {
  return {
    calendarId:  raw.calendarId as string,
    title:       raw.title as string,
    description: raw.description as string | undefined,
    type:        (raw.type as AcademicCalendar['type']) ?? 'CURRENT',
    authority:   (raw.authority as AcademicCalendar['authority']) ?? 'INSTITUTE',
    program:     (raw.program as AcademicCalendar['program']) ?? 'UG',
    semester:    (raw.semester as string) ?? '',
    year:        (raw.year as string) ?? '',
    date:        (raw.date as string) ?? '',
    fileUrl:     (raw.fileUrl as string) ?? '',
    createdAt:   raw.createdAt as string | undefined,
    updatedAt:   raw.updatedAt as string | undefined,
  }
}

export const academicCalendarService = {
  async getAll(params?: { type?: string; authority?: string; program?: string; year?: string }): Promise<AcademicCalendar[]> {
    const vars: Record<string, unknown> = {}
    if (params?.type)      vars.type      = params.type
    if (params?.authority) vars.authority = params.authority
    if (params?.program)   vars.program   = params.program
    if (params?.year)      vars.year      = params.year
    const data = await gqlRequest<{ listAcademicCalendar: { items: Record<string, unknown>[] } }>(
      LIST_ACADEMIC_CALENDAR,
      Object.keys(vars).length ? vars : undefined
    )
    return (data.listAcademicCalendar?.items ?? []).map(mapCalendar)
  },

  async create(input: Omit<AcademicCalendar, 'calendarId' | 'createdAt' | 'updatedAt'>): Promise<AcademicCalendar> {
    const data = await gqlRequest<{ createAcademicCalendar: Record<string, unknown> }>(
      CREATE_ACADEMIC_CALENDAR,
      { input }
    )
    return mapCalendar(data.createAcademicCalendar)
  },

  async update(calendarId: string, fields: Partial<Omit<AcademicCalendar, 'calendarId' | 'createdAt' | 'updatedAt'>>): Promise<AcademicCalendar> {
    const data = await gqlRequest<{ updateAcademicCalendar: Record<string, unknown> }>(
      UPDATE_ACADEMIC_CALENDAR,
      { input: { calendarId, ...fields } }
    )
    return mapCalendar(data.updateAcademicCalendar)
  },

  async delete(calendarId: string): Promise<void> {
    await gqlRequest(DELETE_ACADEMIC_CALENDAR, { calendarId })
  },
}

// ─── Rules & Regulations ─────────────────────────────────────────────────────

function mapRules(raw: Record<string, unknown>): RulesRegulations {
  return {
    documentId:       (raw.documentId as string) ?? 'singleton',
    serviceRulesFile: raw.serviceRulesFile as string | undefined,
    serviceRulesText: raw.serviceRulesText as string | undefined,
    attendanceFile:   raw.attendanceFile as string | undefined,
    attendance:       raw.attendance as string | undefined,
    disciplineFile:   raw.disciplineFile as string | undefined,
    discipline:       raw.discipline as string | undefined,
    updatedAt:        raw.updatedAt as string | undefined,
  }
}

export const rulesRegulationsService = {
  async get(): Promise<RulesRegulations> {
    const data = await gqlRequest<{ getRulesRegulations: Record<string, unknown> | null }>(
      GET_RULES_REGULATIONS
    )
    return data.getRulesRegulations
      ? mapRules(data.getRulesRegulations)
      : { documentId: 'singleton' }
  },

  async update(fields: Partial<Omit<RulesRegulations, 'documentId' | 'updatedAt'>>): Promise<RulesRegulations> {
    const data = await gqlRequest<{ updateRulesRegulations: Record<string, unknown> }>(
      UPDATE_RULES_REGULATIONS,
      { input: { documentId: 'singleton', ...fields } }
    )
    return mapRules(data.updateRulesRegulations)
  },
}

// ─── Rank Holders ─────────────────────────────────────────────────────────────

function mapRankHolder(raw: Record<string, unknown>): RankHolder {
  return {
    rankId:      raw.rankId as string,
    year:        (raw.year as string) ?? '',
    program:     (raw.program as RankHolder['program']) ?? 'UG',
    usn:         (raw.usn as string) ?? '',
    studentName: (raw.studentName as string) ?? '',
    branch:      (raw.branch as string) ?? '',
    rank:        (raw.rank as string) ?? '',
    rankOrder:   (raw.rankOrder as number) ?? 1,
    createdAt:   raw.createdAt as string | undefined,
  }
}

export const rankHolderService = {
  async getAll(params?: { year?: string; program?: string }): Promise<RankHolder[]> {
    const vars: Record<string, unknown> = {}
    if (params?.year)    vars.year    = params.year
    if (params?.program) vars.program = params.program
    const data = await gqlRequest<{ listRankHolders: { items: Record<string, unknown>[] } }>(
      LIST_RANK_HOLDERS,
      Object.keys(vars).length ? vars : undefined
    )
    return (data.listRankHolders?.items ?? []).map(mapRankHolder)
  },

  async create(input: Omit<RankHolder, 'rankId' | 'createdAt'>): Promise<RankHolder> {
    const data = await gqlRequest<{ createRankHolder: Record<string, unknown> }>(
      CREATE_RANK_HOLDER,
      { input }
    )
    return mapRankHolder(data.createRankHolder)
  },

  async update(rankId: string, fields: Partial<Omit<RankHolder, 'rankId' | 'createdAt'>>): Promise<RankHolder> {
    const data = await gqlRequest<{ updateRankHolder: Record<string, unknown> }>(
      UPDATE_RANK_HOLDER,
      { input: { rankId, ...fields } }
    )
    return mapRankHolder(data.updateRankHolder)
  },

  async delete(rankId: string): Promise<void> {
    await gqlRequest(DELETE_RANK_HOLDER, { rankId })
  },
}
