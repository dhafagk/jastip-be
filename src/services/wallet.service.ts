import Seller from '../models/Seller'
import WalletTransaction from '../models/WalletTransaction'
import { AppError } from '../types'

export const getWalletData = async (sellerId: string) => {
  const seller = await Seller.findById(sellerId)
  if (!seller) throw new AppError(404, 'Seller not found.')

  const transactions = await WalletTransaction.find({ sellerId })
    .populate('orderId', 'grandTotal createdAt items')
    .sort({ createdAt: -1 })

  return {
    balance: seller.balance,
    transactions,
  }
}

export const requestWithdrawal = async (sellerId: string, amount: number) => {
  const seller = await Seller.findById(sellerId)
  if (!seller) throw new AppError(404, 'Seller not found.')

  if (amount <= 0) {
    throw new AppError(400, 'Withdrawal amount must be greater than zero.')
  }

  if (seller.balance < amount) {
    throw new AppError(400, 'Insufficient balance.')
  }

  // Deduct balance
  seller.balance -= amount
  await seller.save()

  // Record withdrawal
  const transaction = await WalletTransaction.create({
    sellerId: seller._id,
    type: 'withdrawal',
    amount,
    status: 'pending', // Pending approval by admin, or automated processing (mock)
  })

  return transaction
}

export const handleWithdrawal = async (transactionId: string, action: 'approve' | 'reject') => {
  const transaction = await WalletTransaction.findById(transactionId).populate('sellerId')
  if (!transaction) throw new AppError(404, 'Transaction not found.')

  if (transaction.type !== 'withdrawal') {
    throw new AppError(400, 'Only withdrawal transactions can be handled.')
  }

  if (transaction.status !== 'pending') {
    throw new AppError(400, `Transaction is already ${transaction.status}.`)
  }

  if (action === 'approve') {
    transaction.status = 'completed'
  } else {
    transaction.status = 'failed'
    // Refund the seller
    const seller = await Seller.findById(transaction.sellerId)
    if (seller) {
      seller.balance += transaction.amount
      await seller.save()
    }
  }

  await transaction.save()
  return transaction
}
