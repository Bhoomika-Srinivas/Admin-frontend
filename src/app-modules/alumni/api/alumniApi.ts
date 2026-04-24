import { gqlRequest } from '@/api/graphqlClient'
import type {
  Alumni,
  AlumniEvent,
  TimelineEntry,
  AlumniVisionMission,
  ExecutiveCommitteeMember,
  DeanMessage,
  AlumniCoordinator,
  DistinguishedAlumniEntry,
  AlumniRegistration,
  AlumniContact,
} from '@/shared/types/models'
import {
  LIST_ALUMNI,
  GET_ALUMNI,
  LIST_ALUMNI_EVENTS,
  LIST_TIMELINE_ENTRIES,
  GET_VISION_MISSION,
  LIST_COMMITTEE_MEMBERS,
  GET_DEAN_MESSAGE,
  LIST_COORDINATORS,
  LIST_DISTINGUISHED_ALUMNI,
  GET_REGISTRATION_SETTINGS,
  LIST_ALUMNI_CONTACTS,
} from '../graphql/alumni.query'
import {
  CREATE_ALUMNI,
  UPDATE_ALUMNI,
  DELETE_ALUMNI,
  CREATE_ALUMNI_EVENT,
  UPDATE_ALUMNI_EVENT,
  DELETE_ALUMNI_EVENT,
  CREATE_TIMELINE_ENTRY,
  UPDATE_TIMELINE_ENTRY,
  DELETE_TIMELINE_ENTRY,
  REORDER_TIMELINE_ENTRIES,
  UPDATE_VISION_MISSION,
  CREATE_COMMITTEE_MEMBER,
  UPDATE_COMMITTEE_MEMBER,
  DELETE_COMMITTEE_MEMBER,
  UPDATE_DEAN_MESSAGE,
  CREATE_COORDINATOR,
  UPDATE_COORDINATOR,
  DELETE_COORDINATOR,
  CREATE_DISTINGUISHED_ALUMNUS,
  UPDATE_DISTINGUISHED_ALUMNUS,
  DELETE_DISTINGUISHED_ALUMNUS,
  UPDATE_REGISTRATION_SETTINGS,
  CREATE_ALUMNI_CONTACT,
  UPDATE_ALUMNI_CONTACT,
  DELETE_ALUMNI_CONTACT,
} from '../graphql/alumni.mutation'

function mapAlumni(raw: Record<string, unknown>): Alumni {
  return {
    id:          raw.alumniId as string,
    name:        (raw.name as string) ?? '',
    batch:       (raw.batch as string) ?? '',
    department:  (raw.department as string) ?? '',
    company:     (raw.company as string) ?? '',
    designation: (raw.designation as string) ?? '',
    location:    (raw.location as string) ?? '',
    email:       raw.email as string | undefined,
    linkedin:    raw.linkedin as string | undefined,
    image:       raw.image as string | undefined,
    createdAt:   (raw.createdAt as string) ?? new Date().toISOString(),
  }
}

export const alumniService = {
  async getAll(params?: {
    search?: string
    batch?: string
  }): Promise<Alumni[]> {
    const vars: Record<string, unknown> = {}
    if (params?.search) vars.search = params.search
    if (params?.batch)  vars.batch  = params.batch
    const data = await gqlRequest<{ listAlumni: { items: Record<string, unknown>[] } }>(
      LIST_ALUMNI, Object.keys(vars).length ? vars : undefined
    )
    return (data.listAlumni?.items ?? []).map(mapAlumni)
  },

  async getById(alumniId: string): Promise<Alumni> {
    const data = await gqlRequest<{ getAlumni: Record<string, unknown> }>(
      GET_ALUMNI, { alumniId }
    )
    return mapAlumni(data.getAlumni)
  },

  async create(input: Record<string, unknown>): Promise<Alumni> {
    const data = await gqlRequest<{ createAlumni: Record<string, unknown> }>(
      CREATE_ALUMNI, {
        input: {
          name:        input.name,
          batch:       input.batch,
          department:  input.department,
          company:     input.company,
          designation: input.designation,
          location:    input.location  || undefined,
          email:       input.email     || undefined,
          linkedin:    input.linkedin  || undefined,
          image:       input.image     || undefined,
        },
      }
    )
    return mapAlumni(data.createAlumni)
  },

  async update(alumniId: string, input: Record<string, unknown>): Promise<Alumni> {
    const data = await gqlRequest<{ updateAlumni: Record<string, unknown> }>(
      UPDATE_ALUMNI, {
        input: {
          alumniId,
          name:        input.name,
          batch:       input.batch,
          department:  input.department,
          company:     input.company,
          designation: input.designation,
          location:    input.location  || undefined,
          email:       input.email     || undefined,
          linkedin:    input.linkedin  || undefined,
          image:       input.image     || undefined,
        },
      }
    )
    return mapAlumni(data.updateAlumni)
  },

  async delete(alumniId: string): Promise<string> {
    const data = await gqlRequest<{ deleteAlumni: { alumniId: string } }>(
      DELETE_ALUMNI, { alumniId }
    )
    return data.deleteAlumni.alumniId
  },

  // ─── Alumni Events ────────────────────────────────────────────────────────────

  async getEvents(params?: {
    department?: string
    status?: string
    search?: string
  }): Promise<AlumniEvent[]> {
    const data = await gqlRequest<{ listAlumniEvents: { items: Record<string, unknown>[] } }>(
      LIST_ALUMNI_EVENTS, params
    )
    return (data.listAlumniEvents?.items ?? []).map(mapAlumniEvent)
  },

  async createEvent(input: Record<string, unknown>): Promise<AlumniEvent> {
    const data = await gqlRequest<{ createAlumniEvent: Record<string, unknown> }>(
      CREATE_ALUMNI_EVENT, { input }
    )
    return mapAlumniEvent(data.createAlumniEvent)
  },

  async updateEvent(eventId: string, input: Record<string, unknown>): Promise<AlumniEvent> {
    const data = await gqlRequest<{ updateAlumniEvent: Record<string, unknown> }>(
      UPDATE_ALUMNI_EVENT, { input: { eventId, ...input } }
    )
    return mapAlumniEvent(data.updateAlumniEvent)
  },

  async deleteEvent(eventId: string): Promise<string> {
    const data = await gqlRequest<{ deleteAlumniEvent: { eventId: string } }>(
      DELETE_ALUMNI_EVENT, { eventId }
    )
    return data.deleteAlumniEvent.eventId
  },

  // ─── Timeline Entries ─────────────────────────────────────────────────────────

  async getTimeline(): Promise<TimelineEntry[]> {
    const data = await gqlRequest<{ listTimelineEntries: { items: Record<string, unknown>[] } }>(
      LIST_TIMELINE_ENTRIES
    )
    return (data.listTimelineEntries?.items ?? []).map(mapTimelineEntry)
  },

  async createTimelineEntry(input: Record<string, unknown>): Promise<TimelineEntry> {
    const data = await gqlRequest<{ createTimelineEntry: Record<string, unknown> }>(
      CREATE_TIMELINE_ENTRY, { input }
    )
    return mapTimelineEntry(data.createTimelineEntry)
  },

  async updateTimelineEntry(entryId: string, input: Record<string, unknown>): Promise<TimelineEntry> {
    const data = await gqlRequest<{ updateTimelineEntry: Record<string, unknown> }>(
      UPDATE_TIMELINE_ENTRY, { input: { entryId, ...input } }
    )
    return mapTimelineEntry(data.updateTimelineEntry)
  },

  async deleteTimelineEntry(entryId: string): Promise<string> {
    const data = await gqlRequest<{ deleteTimelineEntry: { entryId: string } }>(
      DELETE_TIMELINE_ENTRY, { entryId }
    )
    return data.deleteTimelineEntry.entryId
  },

  async reorderTimeline(orders: { entryId: string; order: number }[]): Promise<void> {
    await gqlRequest(REORDER_TIMELINE_ENTRIES, { orders })
  },

  // ─── Vision Mission ────────────────────────────────────────────────────────────

  async getVisionMission(): Promise<AlumniVisionMission> {
    const data = await gqlRequest<{ getVisionMission: Record<string, unknown> }>(
      GET_VISION_MISSION
    )
    return mapVisionMission(data.getVisionMission)
  },

  async updateVisionMission(input: { vision: string[]; mission: string[]; objectives: string[] }): Promise<AlumniVisionMission> {
    const data = await gqlRequest<{ updateVisionMission: Record<string, unknown> }>(
      UPDATE_VISION_MISSION, { input }
    )
    return mapVisionMission(data.updateVisionMission)
  },

  // ─── Executive Committee ─────────────────────────────────────────────────────

  async getCommittee(): Promise<ExecutiveCommitteeMember[]> {
    const data = await gqlRequest<{ listCommitteeMembers: { items: Record<string, unknown>[] } }>(
      LIST_COMMITTEE_MEMBERS
    )
    return (data.listCommitteeMembers?.items ?? []).map(mapCommitteeMember)
  },

  async createCommitteeMember(input: Record<string, unknown>): Promise<ExecutiveCommitteeMember> {
    const data = await gqlRequest<{ createCommitteeMember: Record<string, unknown> }>(
      CREATE_COMMITTEE_MEMBER, { input }
    )
    return mapCommitteeMember(data.createCommitteeMember)
  },

  async updateCommitteeMember(memberId: string, input: Record<string, unknown>): Promise<ExecutiveCommitteeMember> {
    const data = await gqlRequest<{ updateCommitteeMember: Record<string, unknown> }>(
      UPDATE_COMMITTEE_MEMBER, { input: { memberId, ...input } }
    )
    return mapCommitteeMember(data.updateCommitteeMember)
  },

  async deleteCommitteeMember(memberId: string): Promise<string> {
    const data = await gqlRequest<{ deleteCommitteeMember: { memberId: string } }>(
      DELETE_COMMITTEE_MEMBER, { memberId }
    )
    return data.deleteCommitteeMember.memberId
  },

  // ─── Dean Message ────────────────────────────────────────────────────────────

  async getDeanMessage(): Promise<DeanMessage> {
    const data = await gqlRequest<{ getDeanMessage: Record<string, unknown> }>(
      GET_DEAN_MESSAGE
    )
    return mapDeanMessage(data.getDeanMessage)
  },

  async updateDeanMessage(input: Record<string, unknown>): Promise<DeanMessage> {
    const data = await gqlRequest<{ updateDeanMessage: Record<string, unknown> }>(
      UPDATE_DEAN_MESSAGE, { input }
    )
    return mapDeanMessage(data.updateDeanMessage)
  },

  // ─── Coordinators ────────────────────────────────────────────────────────────

  async getCoordinators(params?: { department?: string; roleType?: string }): Promise<AlumniCoordinator[]> {
    const data = await gqlRequest<{ listCoordinators: { items: Record<string, unknown>[] } }>(
      LIST_COORDINATORS, params
    )
    return (data.listCoordinators?.items ?? []).map(mapCoordinator)
  },

  async createCoordinator(input: Record<string, unknown>): Promise<AlumniCoordinator> {
    const data = await gqlRequest<{ createCoordinator: Record<string, unknown> }>(
      CREATE_COORDINATOR, { input }
    )
    return mapCoordinator(data.createCoordinator)
  },

  async updateCoordinator(coordinatorId: string, input: Record<string, unknown>): Promise<AlumniCoordinator> {
    const data = await gqlRequest<{ updateCoordinator: Record<string, unknown> }>(
      UPDATE_COORDINATOR, { input: { coordinatorId, ...input } }
    )
    return mapCoordinator(data.updateCoordinator)
  },

  async deleteCoordinator(coordinatorId: string): Promise<string> {
    const data = await gqlRequest<{ deleteCoordinator: { coordinatorId: string } }>(
      DELETE_COORDINATOR, { coordinatorId }
    )
    return data.deleteCoordinator.coordinatorId
  },

  // ─── Distinguished Alumni ──────────────────────────────────────────────────────

  async getDistinguished(deptId: string): Promise<DistinguishedAlumniEntry[]> {
    const data = await gqlRequest<{ listDistinguishedAlumni: { items: Record<string, unknown>[] } }>(
      LIST_DISTINGUISHED_ALUMNI, { deptId }
    )
    return (data.listDistinguishedAlumni?.items ?? []).map(mapDistinguishedAlumnus)
  },

  async createDistinguishedAlumnus(input: Record<string, unknown>): Promise<DistinguishedAlumniEntry> {
    const data = await gqlRequest<{ createDistinguishedAlumnus: Record<string, unknown> }>(
      CREATE_DISTINGUISHED_ALUMNUS, {
        input: {
          deptId:       input.deptId,
          name:         input.name,
          batch:        input.batch,
          currentRole:  input.currentRole,
          organization: input.organization,
          achievement:  input.achievement,
          imageUrl:     input.imageUrl || undefined,
        },
      }
    )
    return mapDistinguishedAlumnus(data.createDistinguishedAlumnus)
  },

  async updateDistinguishedAlumnus(distinguishedAlumnusId: string, input: Record<string, unknown>): Promise<DistinguishedAlumniEntry> {
    const data = await gqlRequest<{ updateDistinguishedAlumnus: Record<string, unknown> }>(
      UPDATE_DISTINGUISHED_ALUMNUS, {
        input: {
          distinguishedAlumnusId,
          name:         input.name,
          batch:        input.batch,
          currentRole:  input.currentRole,
          organization: input.organization,
          achievement:  input.achievement,
          imageUrl:     input.imageUrl || undefined,
        },
      }
    )
    return mapDistinguishedAlumnus(data.updateDistinguishedAlumnus)
  },

  async deleteDistinguishedAlumnus(distinguishedAlumnusId: string): Promise<string> {
    const data = await gqlRequest<{ deleteDistinguishedAlumnus: { distinguishedAlumnusId: string } }>(
      DELETE_DISTINGUISHED_ALUMNUS, { distinguishedAlumnusId }
    )
    return data.deleteDistinguishedAlumnus.distinguishedAlumnusId
  },

  // ─── Registration Settings ─────────────────────────────────────────────────────

  async getRegistration(): Promise<AlumniRegistration> {
    const data = await gqlRequest<{ getRegistrationSettings: Record<string, unknown> }>(
      GET_REGISTRATION_SETTINGS
    )
    return mapRegistrationSettings(data.getRegistrationSettings)
  },

  async updateRegistration(input: { title: string; description: string; registrationLink: string }): Promise<AlumniRegistration> {
    const data = await gqlRequest<{ updateRegistrationSettings: Record<string, unknown> }>(
      UPDATE_REGISTRATION_SETTINGS, { input }
    )
    return mapRegistrationSettings(data.updateRegistrationSettings)
  },

  // ─── Contact Info ──────────────────────────────────────────────────────────────

  async getContacts(): Promise<AlumniContact[]> {
    const data = await gqlRequest<{ listAlumniContacts: { items: Record<string, unknown>[] } }>(
      LIST_ALUMNI_CONTACTS
    )
    return (data.listAlumniContacts?.items ?? []).map(mapContact)
  },

  async createContact(input: Record<string, unknown>): Promise<AlumniContact> {
    const data = await gqlRequest<{ createAlumniContact: Record<string, unknown> }>(
      CREATE_ALUMNI_CONTACT, { input }
    )
    return mapContact(data.createAlumniContact)
  },

  async updateContact(contactId: string, input: Record<string, unknown>): Promise<AlumniContact> {
    const data = await gqlRequest<{ updateAlumniContact: Record<string, unknown> }>(
      UPDATE_ALUMNI_CONTACT, { input: { contactId, ...input } }
    )
    return mapContact(data.updateAlumniContact)
  },

  async deleteContact(contactId: string): Promise<string> {
    const data = await gqlRequest<{ deleteAlumniContact: { contactId: string } }>(
      DELETE_ALUMNI_CONTACT, { contactId }
    )
    return data.deleteAlumniContact.contactId
  },
}

// ─── Mapper Functions ───────────────────────────────────────────────────────────

function mapAlumniEvent(raw: Record<string, unknown>): AlumniEvent {
  return {
    id: (raw.eventId as string) ?? '',
    title: (raw.title as string) ?? '',
    date: (raw.date as string) ?? '',
    time: (raw.time as string) ?? '',
    department: (raw.department as string) ?? '',
    location: (raw.location as string) ?? '',
    description: raw.description as string | undefined,
    image: raw.image as string | undefined,
    status: (raw.status as AlumniEvent['status']) ?? 'draft',
    createdAt: (raw.createdAt as string) ?? new Date().toISOString(),
  }
}

function mapTimelineEntry(raw: Record<string, unknown>): TimelineEntry {
  return {
    id: (raw.entryId as string) ?? '',
    year: (raw.year as string) ?? '',
    title: (raw.title as string) ?? '',
    description: (raw.description as string) ?? '',
    order: (raw.order as number) ?? 0,
    isActive: (raw.isActive as boolean) ?? true,
  }
}

function mapVisionMission(raw: Record<string, unknown>): AlumniVisionMission {
  return {
    id: (raw.documentId as string) ?? 'default',
    vision: (raw.vision as string[]) ?? [],
    mission: (raw.mission as string[]) ?? [],
    objectives: (raw.objectives as string[]) ?? [],
    updatedAt: (raw.updatedAt as string) ?? new Date().toISOString(),
  }
}

function mapCommitteeMember(raw: Record<string, unknown>): ExecutiveCommitteeMember {
  return {
    id: (raw.memberId as string) ?? '',
    name: (raw.name as string) ?? '',
    roleType: (raw.roleType as ExecutiveCommitteeMember['roleType']) ?? 'MEMBER',
    designation: (raw.designation as string) ?? '',
    department: raw.department as string | undefined,
    organization: raw.organization as string | undefined,
    profileImage: raw.profileImage as string | undefined,
    order: (raw.order as number) ?? 0,
  }
}

function mapDeanMessage(raw: Record<string, unknown>): DeanMessage {
  return {
    id: (raw.messageId as string) ?? 'default',
    name: (raw.name as string) ?? '',
    role: (raw.role as string) ?? '',
    department: (raw.department as string) ?? '',
    designation: (raw.designation as string) ?? '',
    message: (raw.message as string) ?? '',
    image: raw.image as string | undefined,
    isActive: (raw.isActive as boolean) ?? true,
  }
}

function mapCoordinator(raw: Record<string, unknown>): AlumniCoordinator {
  return {
    id: (raw.coordinatorId as string) ?? '',
    name: (raw.name as string) ?? '',
    roleType: (raw.roleType as AlumniCoordinator['roleType']) ?? 'COORDINATOR',
    department: (raw.department as string) ?? '',
    email: raw.email as string | null | undefined,
    isActive: (raw.isActive as boolean) ?? true,
  }
}

function mapDistinguishedAlumnus(raw: Record<string, unknown>): DistinguishedAlumniEntry {
  return {
    id:           (raw.distinguishedAlumnusId as string) ?? '',
    deptId:       (raw.deptId as string) ?? '',
    name:         (raw.name as string) ?? '',
    batch:        (raw.batch as string) ?? '',
    currentRole:  (raw.currentRole as string) ?? '',
    organization: (raw.organization as string) ?? '',
    achievement:  (raw.achievement as string) ?? '',
    imageUrl:     raw.imageUrl as string | undefined,
  }
}

function mapRegistrationSettings(raw: Record<string, unknown>): AlumniRegistration {
  return {
    id: (raw.settingsId as string) ?? 'default',
    title: (raw.title as string) ?? '',
    description: (raw.description as string) ?? '',
    registrationLink: (raw.registrationLink as string) ?? 'https://www.fresherprofiles.com/alumni/register_contactus',
  }
}

function mapContact(raw: Record<string, unknown>): AlumniContact {
  return {
    id: (raw.contactId as string) ?? '',
    name: (raw.name as string) ?? '',
    roleType: (raw.roleType as AlumniContact['roleType']) ?? 'DEAN_ALUMNI',
    department: (raw.department as string) ?? '',
    designation: (raw.designation as string) ?? '',
    email: (raw.email as string) ?? '',
  }
}
