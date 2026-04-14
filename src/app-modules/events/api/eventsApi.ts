import { gqlRequest } from '@/api/graphqlClient'
import type { Event } from '@/shared/types/models'
import { LIST_EVENTS, GET_EVENT } from '../graphql/events.query'
import {
  CREATE_EVENT, UPDATE_EVENT, DELETE_EVENT,
  APPROVE_EVENT, REJECT_EVENT, CANCEL_EVENT, TOGGLE_PIN_EVENT,
} from '../graphql/events.mutation'

// ── Backend shape ──────────────────────────────────────────────────────────────

interface BackendEvent {
  eventId: string
  title: string
  isMultiDay?: boolean
  date?: string
  time?: string
  startDate?: string
  startTime?: string
  endDate?: string
  endTime?: string
  venue: string
  description: string
  images?: string[]
  pinned?: boolean
  level: 'institutional' | 'department'
  department?: string
  status: 'upcoming' | 'completed' | 'cancelled'
  approvalStatus: 'pending' | 'approved' | 'rejected'
  createdBy: string
  createdAt: string
}

function mapEvent(raw: BackendEvent): Event {
  return {
    id:             raw.eventId,
    title:          raw.title,
    isMultiDay:     raw.isMultiDay ?? false,
    date:           raw.date ?? '',
    time:           raw.time ?? '',
    startDate:      raw.startDate ?? '',
    startTime:      raw.startTime ?? '',
    endDate:        raw.endDate ?? '',
    endTime:        raw.endTime ?? '',
    venue:          raw.venue ?? '',
    description:    raw.description ?? '',
    images:         raw.images ?? [],
    pinned:         raw.pinned ?? false,
    level:          raw.level,
    department:     raw.department ?? '',
    status:         raw.status,
    approvalStatus: raw.approvalStatus,
    createdBy:      raw.createdBy ?? '',
    createdAt:      raw.createdAt ?? '',
  }
}

type ListFilter = {
  level?: string
  department?: string
  status?: string
  approvalStatus?: string
  limit?: number
}

// ── Service ───────────────────────────────────────────────────────────────────

export const eventService = {
  async getAll(filter: ListFilter = {}): Promise<Event[]> {
    const data = await gqlRequest<{ listEvents: { items: BackendEvent[] } }>(
      LIST_EVENTS, { ...filter },
    )
    return (data.listEvents?.items ?? []).map(mapEvent)
  },

  async getById(id: string): Promise<Event | undefined> {
    try {
      const data = await gqlRequest<{ getEvent: BackendEvent }>(GET_EVENT, { eventId: id })
      return mapEvent(data.getEvent)
    } catch {
      return undefined
    }
  },

  async create(input: Omit<Event, 'id' | 'createdAt' | 'status' | 'approvalStatus'>): Promise<Event> {
    const data = await gqlRequest<{ createEvent: BackendEvent }>(CREATE_EVENT, {
      input: {
        title:       input.title,
        isMultiDay:  input.isMultiDay,
        date:        input.isMultiDay ? null : input.date,
        time:        input.isMultiDay ? null : input.time,
        startDate:   input.isMultiDay ? input.startDate : null,
        startTime:   input.isMultiDay ? input.startTime : null,
        endDate:     input.isMultiDay ? input.endDate   : null,
        endTime:     input.isMultiDay ? input.endTime   : null,
        venue:       input.venue,
        description: input.description,
        images:      input.images,
        level:       input.level,
        department:  input.department,
        pinned:      input.pinned,
      },
    })
    return mapEvent(data.createEvent)
  },

  async update(id: string, input: Partial<Event>): Promise<Event> {
    const data = await gqlRequest<{ updateEvent: BackendEvent }>(UPDATE_EVENT, {
      input: {
        eventId:     id,
        title:       input.title,
        isMultiDay:  input.isMultiDay,
        date:        input.isMultiDay ? null : input.date,
        time:        input.isMultiDay ? null : input.time,
        startDate:   input.isMultiDay ? input.startDate : null,
        startTime:   input.isMultiDay ? input.startTime : null,
        endDate:     input.isMultiDay ? input.endDate   : null,
        endTime:     input.isMultiDay ? input.endTime   : null,
        venue:       input.venue,
        description: input.description,
        images:      input.images,
        level:       input.level,
        department:  input.department,
        pinned:      input.pinned,
      },
    })
    return mapEvent(data.updateEvent)
  },

  async delete(id: string): Promise<void> {
    await gqlRequest(DELETE_EVENT, { eventId: id })
  },

  async approve(id: string): Promise<Event> {
    const data = await gqlRequest<{ approveEvent: BackendEvent }>(APPROVE_EVENT, { eventId: id })
    return mapEvent(data.approveEvent)
  },

  async reject(id: string): Promise<Event> {
    const data = await gqlRequest<{ rejectEvent: BackendEvent }>(REJECT_EVENT, { eventId: id })
    return mapEvent(data.rejectEvent)
  },

  async cancel(id: string): Promise<Event> {
    const data = await gqlRequest<{ cancelEvent: BackendEvent }>(CANCEL_EVENT, { eventId: id })
    return mapEvent(data.cancelEvent)
  },

  async togglePin(id: string): Promise<Event> {
    const data = await gqlRequest<{ togglePinEvent: BackendEvent }>(TOGGLE_PIN_EVENT, { eventId: id })
    return mapEvent(data.togglePinEvent)
  },
}
