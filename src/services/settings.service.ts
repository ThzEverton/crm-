import type { LocalRepository } from '../repositories/local.repository.js'
import { settingsSchema } from '../validators/settings.validator.js'

export class SettingsService {
  constructor(private readonly repository: LocalRepository) {}
  get() { return this.repository.getSettings() }
  update(payload: unknown) { return this.repository.updateSettings(settingsSchema.parse(payload)) }
}
