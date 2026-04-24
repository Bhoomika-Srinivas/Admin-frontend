const CSRF_TOKEN_KEY = 'csrf_token'

/** Generates a random CSRF token */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
}

/** Stores CSRF token in sessionStorage (clears on tab close) */
export function setCsrfToken(token: string): void {
  sessionStorage.setItem(CSRF_TOKEN_KEY, token)
}

/** Retrieves stored CSRF token */
export function getCsrfToken(): string | null {
  return sessionStorage.getItem(CSRF_TOKEN_KEY)
}

/** Validates request token matches stored token */
export function validateCsrfToken(requestToken: string): boolean {
  return requestToken === getCsrfToken()
}

/** Initializes CSRF token on app load */
export function initCsrf(): void {
  if (!getCsrfToken()) {
    setCsrfToken(generateCsrfToken())
  }
}
