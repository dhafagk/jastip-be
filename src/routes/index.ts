import { Router, Request, Response } from 'express'
import authRoutes from './auth'
import userRoutes from './users'
import sellerRoutes from './sellers'
import productRoutes from './products'
import cartRoutes from './cart'
import orderRoutes from './orders'
import walletRoutes from './wallet'

const router = Router()

router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'jastip-be API is running.',
    data: {
      version: '1.0.0',
      endpoints: {
        auth: {
          registerCustomer: 'POST /auth/register/customer',
          registerSeller: 'POST /auth/register/seller',
          registerAdmin: 'POST /auth/register/admin  [requires admin Bearer token]',
          login: 'POST /auth/login',
        },
        users: {
          me: 'GET /users/me  [requires Bearer token]',
          addAddress: 'POST /users/me/addresses  [requires Bearer token]',
          updateAddress: 'PATCH /users/me/addresses/:addressId  [requires Bearer token]',
          setDefaultAddress: 'PATCH /users/me/addresses/:addressId/default  [requires Bearer token]',
          removeAddress: 'DELETE /users/me/addresses/:addressId  [requires Bearer token]',
        },
        sellers: {
          list: 'GET /sellers  [?city=&isVerified=&minRating=&page=&limit=]',
          getOne: 'GET /sellers/:id',
          create: 'POST /sellers  [requires Bearer token]',
          update: 'PATCH /sellers/:id  [requires Bearer token]',
          delete: 'DELETE /sellers/:id  [requires Bearer token]',
          addAddress: 'POST /sellers/:id/addresses  [requires seller Bearer token]',
          updateAddress: 'PATCH /sellers/:id/addresses/:addressId  [requires seller Bearer token]',
          setDefaultAddress: 'PATCH /sellers/:id/addresses/:addressId/default  [requires seller Bearer token]',
          removeAddress: 'DELETE /sellers/:id/addresses/:addressId  [requires seller Bearer token]',
        },
        products: {
          list: 'GET /products  [?category=&status=&sellerId=&originCity=&tag=&minPrice=&maxPrice=&isAvailableForOrder=&page=&limit=]',
          getOne: 'GET /products/:id',
          create: 'POST /products  [requires seller Bearer token]',
          update: 'PATCH /products/:id  [requires seller/admin Bearer token]',
          delete: 'DELETE /products/:id  [requires seller/admin Bearer token]',
          addReview: 'POST /products/:id/reviews  [requires customer Bearer token]',
        },
        cart: {
          get: 'GET /cart  [requires customer Bearer token]',
          add: 'POST /cart  [requires customer Bearer token]',
          update: 'PATCH /cart/:itemId  [requires customer Bearer token]',
          remove: 'DELETE /cart/:itemId  [requires customer Bearer token]',
          clear: 'DELETE /cart  [requires customer Bearer token]',
        },
        orders: {
          checkoutDirect: 'POST /orders/checkout/direct  [requires customer Bearer token]',
          checkoutCart: 'POST /orders/checkout/cart  [requires customer Bearer token]',
          getMyOrders: 'GET /orders/me  [requires customer Bearer token]',
          processPayment: 'POST /orders/:id/payment  [requires customer Bearer token]',
          cancel: 'POST /orders/:id/cancel  [requires customer Bearer token]',
          complete: 'POST /orders/:id/complete  [requires customer Bearer token]',
          getSellerOrders: 'GET /orders/seller/:sellerId  [requires seller/admin Bearer token]',
          updateStatus:
            'PATCH /orders/:id/status  [requires seller Bearer token, body: { status, courier?, trackingNumber? }]',
        },
        wallet: {
          getMe: 'GET /wallet/me  [requires seller Bearer token]',
          withdraw: 'POST /wallet/withdraw  [requires seller Bearer token]',
        },
      },
    },
  })
})

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/sellers', sellerRoutes)
router.use('/products', productRoutes)
router.use('/cart', cartRoutes)
router.use('/orders', orderRoutes)
router.use('/wallet', walletRoutes)

export default router
