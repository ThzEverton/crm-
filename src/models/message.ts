export type MessageAuthor = 'nutritionist' | 'patient'
export type ChatMessage = { id: string; patientId: string; author: MessageAuthor; body: string; sentAt: Date; read: boolean }
export type CreateMessageInput = Pick<ChatMessage, 'patientId' | 'body'>
