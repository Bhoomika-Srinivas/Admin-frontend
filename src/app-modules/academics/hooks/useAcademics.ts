import { useState, useEffect } from 'react'
import type { AcademicCalendar, RulesRegulations, RankHolder } from '@/shared/types/models'
import {
  academicCalendarService,
  rulesRegulationsService,
  rankHolderService,
} from '../api/academicsApi'

// ─── Academic Calendar ────────────────────────────────────────────────────────

export function useAcademicCalendar() {
  const [entries, setEntries] = useState<AcademicCalendar[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  async function reload() {
    setLoading(true)
    setError(null)
    try {
      setEntries(await academicCalendarService.getAll())
    } catch {
      setError('Failed to load academic calendars')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [])

  return { entries, loading, error, reload }
}

// ─── Rules & Regulations ─────────────────────────────────────────────────────

export function useRulesRegulations() {
  const [data, setData]   = useState<RulesRegulations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  async function reload() {
    setLoading(true)
    setError(null)
    try {
      setData(await rulesRegulationsService.get())
    } catch {
      setError('Failed to load rules & regulations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [])

  return { data, setData, loading, error, reload }
}

// ─── Rank Holders ─────────────────────────────────────────────────────────────

export function useRankHolders() {
  const [entries, setEntries] = useState<RankHolder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  async function reload() {
    setLoading(true)
    setError(null)
    try {
      setEntries(await rankHolderService.getAll())
    } catch {
      setError('Failed to load rank holders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [])

  return { entries, loading, error, reload }
}
