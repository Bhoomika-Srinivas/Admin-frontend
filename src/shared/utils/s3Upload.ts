import { gqlRequest } from '@/api/graphqlClient'
import { GET_UPLOAD_URL } from '@/app-modules/departments/graphql/deptInfo.mutation'

const S3_BASE = 'https://myapp-storage-dev-927701869914.s3.ap-south-1.amazonaws.com'

interface UploadUrlResponse {
  getUploadUrl: { upload_url: string; key: string; file_id: string }
}

/**
 * Uploads a File to S3 via presigned URL and returns the public URL.
 * @param file     The File object to upload
 * @param module   e.g. "dept-info"
 * @param entityId e.g. deptId
 */
export async function uploadToS3(file: File, module: string, entityId: string): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'

  const data = await gqlRequest<UploadUrlResponse>(GET_UPLOAD_URL, {
    module,
    entity_id: entityId,
    extension: ext,
  })

  const { upload_url, key } = data.getUploadUrl

  const s3Res = await fetch(upload_url, {
    method: 'PUT',
    body: file,
  })

  if (!s3Res.ok) {
    const text = await s3Res.text()
    throw new Error(`S3 upload failed (${s3Res.status}): ${text}`)
  }

  return `${S3_BASE}/${key}`
}
