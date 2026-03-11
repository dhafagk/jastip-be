import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import indexRouter from './routes/index'
import authRouter from './routes/auth'
import usersRouter from './routes/users'
import sellersRouter from './routes/sellers'
import productsRouter from './routes/products'
import { errorHandler } from './middleware/errorHandler'

const app: Application = express()

// ── Security ─────────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors())

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/', indexRouter)
app.use('/auth', authLimiter, authRouter)
app.use('/users', usersRouter)
app.use('/sellers', sellersRouter)
app.use('/products', productsRouter)

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found.' })
})

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler)

export default app
