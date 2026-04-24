// File validation constants - exported for reuse
export const FILE_SIZE_LIMITS = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
} as const

export const MAX_FILE_SIZE = {
  IMAGE: 2 * FILE_SIZE_LIMITS.MB,      // 2 MB
  DOCUMENT: 10 * FILE_SIZE_LIMITS.MB,   // 10 MB
  VIDEO: 100 * FILE_SIZE_LIMITS.MB,     // 100 MB
} as const

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'] as const

// Backwards compatibility
const MAX_SIZE = MAX_FILE_SIZE.IMAGE
const IMAGE_TYPES = [...ALLOWED_IMAGE_TYPES]
const DOCUMENT_TYPES = [...ALLOWED_DOCUMENT_TYPES]

export function validateImageFile(file: File): string | null {
  if (!(IMAGE_TYPES as string[]).includes(file.type)) return 'Only JPEG and PNG images are allowed.'
  if (file.size > MAX_SIZE) return 'File size must be under 2 MB.'
  return null
}

export function validateDocumentFile(file: File): string | null {
  if (!(DOCUMENT_TYPES as string[]).includes(file.type)) return 'Only PDF, DOC, and DOCX files are allowed.'
  if (file.size > MAX_SIZE) return 'File size must be under 2 MB.'
  return null
}

const PDF_TXT_TYPES = [...DOCUMENT_TYPES, 'text/plain']

export function validatePdfOrTextFile(file: File): string | null {
  if (!PDF_TXT_TYPES.includes(file.type)) return 'Only PDF or TXT files are allowed.'
  if (file.size > MAX_SIZE) return 'File size must be under 2 MB.'
  return null
}

// Enhanced validators with custom limits

export interface FileValidationOptions {
  maxSize?: number
  allowedTypes?: string[]
  allowedExtensions?: string[]
}

export interface FileValidationResult {
  valid: boolean
  error?: string
}

/** Universal file validator */
export function validateFile(file: File, options: FileValidationOptions = {}): FileValidationResult {
  const { maxSize = MAX_FILE_SIZE.IMAGE, allowedTypes = [...ALLOWED_IMAGE_TYPES] } = options

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { valid: false, error: `Only ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')} files are allowed` }
  }

  if (file.size > maxSize) {
    return { valid: false, error: `File size must be under ${(maxSize / FILE_SIZE_LIMITS.MB).toFixed(0)} MB` }
  }

  return { valid: true }
}

/** Video file validator */
export function validateVideoFile(file: File): FileValidationResult {
  return validateFile(file, {
    maxSize: MAX_FILE_SIZE.VIDEO,
    allowedTypes: [...ALLOWED_VIDEO_TYPES],
  })
}

/** Generic document validator (larger size limit) */
export function validateLargeDocument(file: File): FileValidationResult {
  return validateFile(file, {
    maxSize: MAX_FILE_SIZE.DOCUMENT,
    allowedTypes: [...ALLOWED_DOCUMENT_TYPES],
  })
}
