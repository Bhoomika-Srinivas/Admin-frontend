/** Formats date to display string */
export function formatDate(date: string | Date | null, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return '-'

  const d = typeof date === 'string' ? new Date(date) : date

  if (isNaN(d.getTime())) return '-'

  const defaults: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }

  return new Intl.DateTimeFormat('en-US', defaults).format(d)
}

/** Formats datetime with time */
export function formatDateTime(date: string | Date | null): string {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Returns relative time string (e.g., "2 days ago") */
export function getRelativeTime(date: string | Date | null): string {
  if (!date) return '-'

  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInMs = now.getTime() - d.getTime()
  const diffInSecs = Math.floor(diffInMs / 1000)
  const diffInMins = Math.floor(diffInSecs / 60)
  const diffInHours = Math.floor(diffInMins / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInSecs < 60) return 'just now'
  if (diffInMins < 60) return `${diffInMins}m ago`
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInDays < 30) return `${diffInDays}d ago`

  return formatDate(d)
}

/** Checks if date is today */
export function isToday(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  )
}

/** Checks if date is in the past */
export function isPast(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.getTime() < Date.now()
}

/** Checks if date is in the future */
export function isFuture(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.getTime() > Date.now()
}

/** Adds days to a date */
export function addDays(date: string | Date, days: number): Date {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000)
}

/** Gets academic year string (e.g., "2024-25") */
export function getAcademicYear(date: string | Date = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = d.getMonth()

  // Academic year starts in July
  if (month >= 6) {
    return `${year}-${(year + 1).toString().slice(-2)}`
  }
  return `${year - 1}-${year.toString().slice(-2)}`
}

/** Parses date range string to dates */
export function parseDateRange(range: string): { start: Date | null; end: Date | null } {
  const [startStr, endStr] = range.split('-')
  return {
    start: startStr ? new Date(startStr) : null,
    end: endStr ? new Date(endStr) : null,
  }
}
