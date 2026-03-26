const MAX_SIZE = 2 * 1024 * 1024 // 2 MB
const IMAGE_TYPES = ['image/jpeg', 'image/png']
const DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

export function validateImageFile(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return 'Only JPEG and PNG images are allowed.'
  if (file.size > MAX_SIZE) return 'File size must be under 2 MB.'
  return null
}

export function validateDocumentFile(file: File): string | null {
  if (!DOCUMENT_TYPES.includes(file.type)) return 'Only PDF, DOC, and DOCX files are allowed.'
  if (file.size > MAX_SIZE) return 'File size must be under 2 MB.'
  return null
}
