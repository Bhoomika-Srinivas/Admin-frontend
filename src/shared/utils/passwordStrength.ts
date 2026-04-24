export interface PasswordValidationResult {
  isValid: boolean
  score: number // 0-4
  feedback: string[]
}

/** Validates password strength */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const feedback: string[] = []
  let score = 0

  // Length check
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters')
  } else {
    score++
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    feedback.push('Add uppercase letters')
  } else {
    score++
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    feedback.push('Add lowercase letters')
  } else {
    score++
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    feedback.push('Add numbers')
  } else {
    score++
  }

  // Special character check
  if (!/[!@#$%^*&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Add special characters (!@#$%^* etc.)')
  }

  return {
    isValid: score >= 3 && password.length >= 8,
    score,
    feedback,
  }
}

/** Checks if password is commonly used (basic check) */
export function isCommonPassword(password: string): boolean {
  const common = ['password', '123456', 'qwerty', 'admin', 'letmein', 'welcome']
  return common.includes(password.toLowerCase())
}
