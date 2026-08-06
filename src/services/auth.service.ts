import { randomBytes, randomUUID } from 'node:crypto'
import { compareSync, hashSync } from 'bcryptjs'

type LocalUser = { id: string; email: string; name: string; role: 'nutritionist' | 'patient'; patientId?: string; passwordHash: string }
type PatientAccount = { id: string; email: string; fullName: string }

export class AuthService {
  private readonly users: LocalUser[]
  private readonly resetTokens = new Map<string, { userId: string; expiresAt: number }>()
  private readonly audit: Array<{ action: string; email: string; at: Date }> = []

  constructor(private readonly patientProvider: () => PatientAccount[]) {
    this.users = [
      { id: randomUUID(), email: 'marina@consultorio.local', name: 'Marina Nunes', role: 'nutritionist', passwordHash: hashSync('Nutri@2026', 10) },
    ]
    this.syncPatientAccounts()
  }

  private syncPatientAccounts() {
    this.patientProvider().forEach((patient) => {
      if (this.users.some((user) => user.patientId === patient.id)) return
      this.users.push({ id: randomUUID(), email: patient.email.trim().toLowerCase(), name: patient.fullName, role: 'patient', patientId: patient.id, passwordHash: hashSync('Paciente@2026', 10) })
    })
  }

  authenticate(email: string, password: string) {
    this.syncPatientAccounts()
    const user = this.users.find((item) => item.email === email.trim().toLowerCase())
    if (!user || !compareSync(password, user.passwordHash)) return undefined
    this.audit.push({ action: 'login', email: user.email, at: new Date() })
    const { passwordHash: _passwordHash, ...safeUser } = user
    return safeUser
  }

  requestReset(email: string) {
    this.syncPatientAccounts()
    const user = this.users.find((item) => item.email === email.trim().toLowerCase())
    if (!user) return undefined
    const token = randomBytes(24).toString('hex')
    this.resetTokens.set(token, { userId: user.id, expiresAt: Date.now() + 15 * 60 * 1_000 })
    return token
  }

  resetPassword(token: string, password: string) {
    const record = this.resetTokens.get(token)
    if (!record || record.expiresAt < Date.now()) return false
    const user = this.users.find((item) => item.id === record.userId)
    if (!user) return false
    user.passwordHash = hashSync(password, 10)
    this.resetTokens.delete(token)
    this.audit.push({ action: 'password-reset', email: user.email, at: new Date() })
    return true
  }

  auditLog() { return [...this.audit].reverse() }
}
