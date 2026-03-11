import { Types } from 'mongoose'
import User from '../models/User'
import { IAddress } from '../types'
import { AppError } from '../types'
import { AddressInput, PartialAddressInput } from '../validators/address.validator'

export const getUserById = async (id: string) => {
  const user = await User.findById(id).select('-password')
  if (!user) throw new AppError(404, 'User not found.')
  return user
}

// --- Address Management ---

export const addAddress = async (id: string, input: AddressInput) => {
  const user = await User.findById(id).select('-password')
  if (!user) throw new AppError(404, 'User not found.')

  const isFirstAddress = user.addresses.length === 0
  const shouldBeDefault = input.isDefault || isFirstAddress

  if (shouldBeDefault && !isFirstAddress) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false
    })
  }

  user.addresses.push({ ...input, isDefault: shouldBeDefault } as IAddress)
  await user.save()
  return user
}

export const updateAddress = async (userId: string, addressId: string, input: PartialAddressInput) => {
  const user = await User.findById(userId).select('-password')
  if (!user) throw new AppError(404, 'User not found.')

  const address = user.addresses.id(addressId)
  if (!address) throw new AppError(404, 'Address not found.')

  if (input.isDefault && !address.isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false
    })
  } else if (input.isDefault === false && address.isDefault) {
    // If trying to unset default, ensure there's another default if possible, or reject.
    // For simplicity, we just allow unsetting, but typically you force at least one default.
    // Let's enforce at least one default:
    if (user.addresses.length > 1) {
      throw new AppError(400, 'Cannot unset the only default address. Set another address as default instead.')
    }
  }

  address.set(input)
  await user.save()
  return user
}

export const removeAddress = async (userId: string, addressId: string) => {
  const user = await User.findById(userId).select('-password')
  if (!user) throw new AppError(404, 'User not found.')

  const addressIndex = user.addresses.findIndex((addr) => String(addr._id) === addressId)
  if (addressIndex === -1) throw new AppError(404, 'Address not found.')

  const wasDefault = user.addresses[addressIndex].isDefault
  user.addresses.splice(addressIndex, 1)

  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true
  }

  await user.save()
  return user
}

export const setDefaultAddress = async (userId: string, addressId: string) => {
  const user = await User.findById(userId).select('-password')
  if (!user) throw new AppError(404, 'User not found.')

  const address = user.addresses.id(addressId)
  if (!address) throw new AppError(404, 'Address not found.')

  user.addresses.forEach((addr) => {
    addr.isDefault = false
  })
  address.isDefault = true

  await user.save()
  return user
}
