import session from 'express-session'
import { env } from './env.js'

export const sessionMiddleware = session({
  name: 'crm.sid',
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: { httpOnly: true, sameSite: 'lax', secure: env.NODE_ENV === 'production', maxAge: 8 * 60 * 60 * 1_000 },
})
