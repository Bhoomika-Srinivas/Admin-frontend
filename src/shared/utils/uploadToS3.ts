export async function uploadToS3(file: File): Promise<string> {
  // Temporary mock upload
  const fileKey = `uploads/${Date.now()}-${file.name}`

  // simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))

  return fileKey
}
