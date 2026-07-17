import { z } from 'zod'

export const MODEL_OPTIONS = [
  'gpt-4o',
  'gpt-4o-mini',
  'claude-sonnet-4',
] as const

export type ModelOption = (typeof MODEL_OPTIONS)[number]

export const settingsSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be at most 50 characters'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  defaultModel: z.enum(MODEL_OPTIONS, {
    message: 'Select a default model',
  }),
  temperature: z
    .number({ message: 'Temperature is required' })
    .min(0, 'Must be between 0 and 1')
    .max(1, 'Must be between 0 and 1'),
  maxTokens: z
    .number({ message: 'Max tokens is required' })
    .int('Must be a whole number')
    .min(1, 'Minimum is 1 token')
    .max(4096, 'Maximum is 4096 tokens'),
  emailNotifications: z.boolean(),
  streamResponses: z.boolean(),
})

export type SettingsFormValues = z.infer<typeof settingsSchema>

export const defaultSettings: SettingsFormValues = {
  displayName: '',
  email: '',
  defaultModel: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 1024,
  emailNotifications: true,
  streamResponses: true,
}
