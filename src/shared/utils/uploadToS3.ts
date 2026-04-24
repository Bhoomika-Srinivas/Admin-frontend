import { validateImageFile, validateDocumentFile } from './validateFile'

/**
 * Upload a file to S3 and return the public URL.
 * @param file    - The file to upload
 * @param path    - S3 folder path / prefix (e.g. 'dept-academics')
 * @param id      - Optional sub-path or tenant/dept ID
 */
export async function uploadToS3(
  file: File,
  path: string = 'uploads',
  id?: string,
): Promise<string> {
  // Validate
  let validationError: string | null = null
  if (file.type.startsWith('image/')) {
    validationError = validateImageFile(file)
  } else {
    validationError = validateDocumentFile(file)
  }
  if (validationError) throw new Error(validationError)

  const prefix    = id ? `${path}/${id}` : path
  const fileKey   = `${prefix}/${Date.now()}-${sanitizeFilename(file.name)}`

  // TODO: Replace with real S3 pre-signed URL upload
  // const { url, fields } = await gqlRequest(GET_UPLOAD_URL, { key: fileKey, contentType: file.type })
  // const form = new FormData()
  // Object.entries(fields).forEach(([k, v]) => form.append(k, v as string))
  // form.append('file', file)
  // await fetch(url, { method: 'POST', body: form })

  await simulateUpload(file)

  return `https://your-bucket.s3.amazonaws.com/${fileKey}`
}

/** Upload multiple files; returns array of URLs in the same order. */
export async function uploadMultipleToS3(
  files: File[],
  path?: string,
  id?: string,
): Promise<string[]> {
  return Promise.all(files.map(f => uploadToS3(f, path, id)))
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
}

function simulateUpload(file: File): Promise<void> {
  const uploadTime = Math.min(file.size / 10000, 2000)
  return new Promise(resolve => setTimeout(resolve, uploadTime))
}
