import type { LocalRepository } from '../repositories/local.repository.js'
import { messageSchema } from '../validators/message.validator.js'

export class MessageService {
  constructor(private readonly repository: LocalRepository) {}
  list(patientId?: string) { return this.repository.listMessages(patientId) }
  send(payload: unknown) { return this.repository.createMessage(messageSchema.parse(payload)) }
  markRead(patientId: string) { return this.repository.markMessagesRead(patientId) }
}
