import { useState, useEffect } from 'react'
import type {
  Alumni,
  AlumniEvent,
  TimelineEntry,
  AlumniVisionMission,
  ExecutiveCommitteeMember,
  DeanMessage,
  AlumniCoordinator,
  DistinguishedAlumnus,
  AlumniRegistration,
  AlumniContact,
} from '@/shared/types/models'
import { alumniService } from '@/app-modules/alumni/api/alumniApi'
import { deptAboutService } from '@/app-modules/departments/api/deptAboutApi'

interface AlumniFilter {
  search?: string
  batch?: string
}

export function useAlumni(filter?: AlumniFilter) {
  const [alumni, setAlumni] = useState<Alumni[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await alumniService.getAll({
        search: filter?.search,
        batch:  filter?.batch,
      })
      setAlumni(data)
    } catch {
      setError('Failed to load alumni')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter?.search, filter?.batch])

  return { alumni, loading, error, reload: load }
}

// ─── Alumni Events ────────────────────────────────────────────────────────────

interface EventsFilter {
  department?: string
  status?: string
  search?: string
}

export function useAlumniEvents(filter?: EventsFilter) {
  const [events, setEvents] = useState<AlumniEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await alumniService.getEvents(filter)
      setEvents(data)
    } catch {
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter?.department, filter?.status, filter?.search])

  return { events, loading, error, reload: load }
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export function useTimeline() {
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await alumniService.getTimeline()
      setEntries(data)
    } catch {
      setError('Failed to load timeline')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return { entries, loading, error, reload: load }
}

// ─── Vision Mission ───────────────────────────────────────────────────────────

export function useVisionMission() {
  const [data, setData] = useState<AlumniVisionMission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const result = await alumniService.getVisionMission()
      setData(result)
    } catch {
      setError('Failed to load vision & mission')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return { data, loading, error, reload: load }
}

// ─── Executive Committee ───────────────────────────────────────────────────────

export function useCommittee() {
  const [members, setMembers] = useState<ExecutiveCommitteeMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await alumniService.getCommittee()
      setMembers(data)
    } catch {
      setError('Failed to load committee')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return { members, loading, error, reload: load }
}

// ─── Dean Message ────────────────────────────────────────────────────────────

export function useDeanMessage() {
  const [message, setMessage] = useState<DeanMessage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await alumniService.getDeanMessage()
      setMessage(data)
    } catch {
      setError('Failed to load dean message')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return { message, loading, error, reload: load }
}

// ─── Coordinators ─────────────────────────────────────────────────────────────

interface CoordinatorsFilter {
  department?: string
  roleType?: string
}

export function useCoordinators(filter?: CoordinatorsFilter) {
  const [coordinators, setCoordinators] = useState<AlumniCoordinator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await alumniService.getCoordinators(filter)
      setCoordinators(data)
    } catch {
      setError('Failed to load coordinators')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter?.department, filter?.roleType])

  return { coordinators, loading, error, reload: load }
}

// ─── Distinguished Alumni ──────────────────────────────────────────────────────

export function useDistinguishedAlumni() {
  const [alumni, setAlumni] = useState<DistinguishedAlumnus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await deptAboutService.getAlumni('')
      setAlumni(data)
    } catch {
      setError('Failed to load distinguished alumni')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return { alumni, loading, error, reload: load }
}

// ─── Registration Settings ────────────────────────────────────────────────────

export function useRegistrationSettings() {
  const [settings, setSettings] = useState<AlumniRegistration | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await alumniService.getRegistration()
      setSettings(data)
    } catch {
      setError('Failed to load registration settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return { settings, loading, error, reload: load }
}

// ─── Contact Info ─────────────────────────────────────────────────────────────

export function useAlumniContacts() {
  const [contacts, setContacts] = useState<AlumniContact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await alumniService.getContacts()
      setContacts(data)
    } catch {
      setError('Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return { contacts, loading, error, reload: load }
}
