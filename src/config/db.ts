import mongoose from 'mongoose'
import { env } from './env'

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.mongoUri)
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection failed:', err)
    process.exit(1)
  }
}

export default connectDB
