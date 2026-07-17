import type { SettingsFormValues } from '../types/settings'

export async function saveSettings(
  values: SettingsFormValues,
): Promise<SettingsFormValues> {
  await new Promise((resolve) => setTimeout(resolve, 600))
  return values
}
