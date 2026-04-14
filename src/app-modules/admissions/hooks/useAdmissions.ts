import { useState, useEffect, useCallback } from 'react'
import { admissionsService } from '../api/admissionsApi'
import type {
  AdmissionsOverview, AdmissionsProgram, UGCourse, PGCourse,
  EligibilityEntry, AdmissionStep, ImportantDate, Prospectus,
  FeeDocument, Scholarship, AuditStatement, AdmissionsEnquiry,
  AdmissionsContact, WhyEnquire, EnquiryCategory, InfoBlock,
} from '@/shared/types/models'

// ─── Generic hook factory ─────────────────────────────────────────────────────

function makeListHook<T>(fetcher: () => Promise<T[]>) {
  return function useListHook() {
    const [data, setData]       = useState<T[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError]     = useState<string | null>(null)

    const reload = useCallback(() => {
      setLoading(true)
      fetcher()
        .then(setData)
        .catch(e => setError(e instanceof Error ? e.message : 'Failed to load'))
        .finally(() => setLoading(false))
    }, [])

    useEffect(() => { reload() }, [reload])
    return { data, loading, error, reload }
  }
}

// ─── List hooks ───────────────────────────────────────────────────────────────

export const usePrograms        = makeListHook<AdmissionsProgram>(() => admissionsService.getPrograms())
export const useUGCourses       = makeListHook<UGCourse>(() => admissionsService.getUGCourses())
export const usePGCourses       = makeListHook<PGCourse>(() => admissionsService.getPGCourses())
export const useEligibilityEntries = makeListHook<EligibilityEntry>(() => admissionsService.getEligibilityEntries())
export const useAdmissionSteps  = makeListHook<AdmissionStep>(() => admissionsService.getSteps())
export const useImportantDates  = makeListHook<ImportantDate>(() => admissionsService.getDates())
export const useFeeDocuments    = makeListHook<FeeDocument>(() => admissionsService.getFeeDocuments())
export const useScholarships    = makeListHook<Scholarship>(() => admissionsService.getScholarships())
export const useAuditStatements = makeListHook<AuditStatement>(() => admissionsService.getAuditStatements())
export const useEnquiries       = makeListHook<AdmissionsEnquiry>(() => admissionsService.getEnquiries())
export const useAdmissionsContacts = makeListHook<AdmissionsContact>(() => admissionsService.getContacts())
export const useEnquiryCategories  = makeListHook<EnquiryCategory>(() => admissionsService.getEnquiryCategories())
export const useInfoBlocks         = makeListHook<InfoBlock>(() => admissionsService.getInfoBlocks())

// ─── Singleton hooks ──────────────────────────────────────────────────────────

export function useAdmissionsOverview() {
  const [data, setData]       = useState<AdmissionsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const reload = useCallback(() => {
    setLoading(true)
    admissionsService.getOverview()
      .then(setData)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { reload() }, [reload])
  return { data, loading, error, reload }
}

export function useProspectus() {
  const [data, setData]       = useState<Prospectus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const reload = useCallback(() => {
    setLoading(true)
    admissionsService.getProspectus()
      .then(setData)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { reload() }, [reload])
  return { data, loading, error, reload }
}

export function useWhyEnquire() {
  const [data, setData]       = useState<WhyEnquire | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const reload = useCallback(() => {
    setLoading(true)
    admissionsService.getWhyEnquire()
      .then(setData)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { reload() }, [reload])
  return { data, loading, error, reload }
}
