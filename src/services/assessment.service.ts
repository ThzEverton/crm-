import type { LocalRepository } from '../repositories/local.repository.js'
import { createAssessmentSchema } from '../validators/assessment.validator.js'
import { calculateBodyFat, PROTOCOL_LABELS } from './anthropometry.service.js'

export class AssessmentService {
  constructor(private readonly repository: LocalRepository) {}
  listByPatient(patientId: string) { return this.repository.listAssessments(patientId) }

  create(payload: unknown) {
    const input = createAssessmentSchema.parse(payload)
    const patient = this.repository.findPatient(input.patientId)
    if (!patient) throw new Error('Paciente não encontrado.')
    const assessedAt = new Date(`${input.assessedOn}T12:00:00`)
    const bornAt = new Date(`${patient.birthDate}T12:00:00`)
    let age = assessedAt.getFullYear() - bornAt.getFullYear()
    if (assessedAt < new Date(assessedAt.getFullYear(), bornAt.getMonth(), bornAt.getDate())) age -= 1
    const skinfolds = { chest: input.skinfoldChestMm, midaxillary: input.skinfoldMidaxillaryMm, triceps: input.skinfoldTricepsMm, subscapular: input.skinfoldSubscapularMm, abdomen: input.skinfoldAbdomenMm, suprailiac: input.skinfoldSuprailiacMm, thigh: input.skinfoldThighMm }
    const calculated = calculateBodyFat(input.protocolCode, input.sex, age, skinfolds)
    const bodyFatPercent = calculated.bodyFatPercent ?? input.bodyFatPercent
    const circumferences = { neck: input.neckCm, shoulders: input.shouldersCm, chest: input.chestCm, waist: input.waistCm, abdomen: input.abdomenCm, hip: input.hipCm, rightArm: input.rightArmCm, leftArm: input.leftArmCm, rightForearm: input.rightForearmCm, leftForearm: input.leftForearmCm, rightThigh: input.rightThighCm, leftThigh: input.leftThighCm, rightCalf: input.rightCalfCm, leftCalf: input.leftCalfCm }
    return this.repository.createAssessment({
      patientId: input.patientId, assessedOn: input.assessedOn, weightKg: input.weightKg, heightCm: input.heightCm,
      bodyFatPercent, bodyDensity: calculated.bodyDensity, waterPercent: input.waterPercent, muscleMassKg: input.muscleMassKg, boneMassKg: input.boneMassKg,
      waistCm: input.waistCm, hipCm: input.hipCm, armCm: input.rightArmCm, protocol: PROTOCOL_LABELS[input.protocolCode], protocolCode: input.protocolCode, protocolVersion: '2026.1', sex: input.sex,
      circumferences, skinfolds, intermediateResults: calculated.sumSkinfolds === null ? {} : { age, sumSkinfoldsMm: calculated.sumSkinfolds, bodyDensity: calculated.bodyDensity! }, notes: input.notes,
    })
  }
}
