import 'express-session'

declare module 'express-session' {
  interface SessionData {
    user?: { id: string; email: string; name: string; role: 'nutritionist' | 'patient'; patientId?: string }
    recoveryToken?: string
  }
}
