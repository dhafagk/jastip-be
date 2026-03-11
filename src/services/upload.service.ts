import { PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import { s3Client } from '../config/s3'
import { AppError } from '../types'

export const uploadImageToSupabase = async (file: Express.Multer.File): Promise<string> => {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET
  if (!bucket) throw new AppError(500, 'Supabase storage bucket is not configured.')

  const ext = file.mimetype.split('/')[1] || 'jpg'
  const key = `${uuidv4()}.${ext}`

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    // Note: Supabase Storage uses its own RLS policies, ACL is usually not required.
  })

  await s3Client.send(command)

  // Construct the public URL
  const projectUrl = process.env.SUPABASE_PROJECT_URL
  if (!projectUrl) throw new AppError(500, 'Supabase project URL is not configured.')

  // Supabase public URL format: https://[PROJECT_REF].supabase.co/storage/v1/object/public/[BUCKET_NAME]/[KEY]
  const publicUrl = `${projectUrl}/storage/v1/object/public/${bucket}/${key}`

  return publicUrl
}
