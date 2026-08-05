import { z } from 'zod'

export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8).max(128) })
export const recoverySchema = z.object({ email: z.string().email() })
export const resetSchema = z.object({ token: z.string().length(48), password: z.string().min(8).max(128).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/) })
