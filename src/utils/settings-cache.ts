import { Setting } from '../models'

export const SETTINGS = new Map<string, any>()

export async function loadSettings(): Promise<void> {
  const allSettings = await Setting.findAll({ attributes: ['key', 'value'] })
  allSettings.forEach((s) => {
    SETTINGS.set(s.key, s.value.value)
  })
}

export function getSetting(key: string, defaultValue?: any): any {
  return SETTINGS.get(key) ?? defaultValue
}

export function updateCache(key: string, value: any): void {
  SETTINGS.set(key, value)
}

// On startup: await loadSettings(); in app.ts
// On update: await updateCache(key, parsedValue); emit if needed
