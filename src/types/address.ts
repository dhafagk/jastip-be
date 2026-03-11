import { Types } from 'mongoose'

export interface IAddress extends Types.Subdocument {
  label: string
  recipientName: string
  phoneNumber: string
  street: string
  district: string
  city: string
  province: string
  postalCode: string
  country: string
  isDefault: boolean
  coordinates?: {
    latitude: number
    longitude: number
  }
}
