import { S3Client } from '@aws-sdk/client-s3'
import dotenv from 'dotenv'

dotenv.config()

const endpoint = process.env.SUPABASE_S3_ENDPOINT!
const region = process.env.SUPABASE_S3_REGION!
const accessKeyId = process.env.SUPABASE_S3_ACCESS_KEY!
const secretAccessKey = process.env.SUPABASE_S3_SECRET_KEY!

export const s3Client = new S3Client({
  forcePathStyle: true,
  region,
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
})
