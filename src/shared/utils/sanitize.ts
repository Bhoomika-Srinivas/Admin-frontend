/** Sanitizes user input to prevent XSS attacks */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/** Sanitizes a URL to prevent javascript: protocol injection */
export function sanitizeUrl(url: string): string {
  const sanitized = url.trim().toLowerCase()
  if (sanitized.startsWith('javascript:') || sanitized.startsWith('data:')) {
    return ''
  }
  return url
}

/** Validates and sanitizes email addresses */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9._%+-@]/gi, '')
}
