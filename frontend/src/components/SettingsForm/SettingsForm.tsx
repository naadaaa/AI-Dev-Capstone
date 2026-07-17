import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  defaultSettings,
  MODEL_OPTIONS,
  settingsSchema,
  type SettingsFormValues,
} from '../../types/settings'
import { FormField } from '../FormField'
import './SettingsForm.css'

type SettingsFormProps = {
  initialValues?: SettingsFormValues
  onSubmit: (values: SettingsFormValues) => Promise<void>
}

export function SettingsForm({
  initialValues = defaultSettings,
  onSubmit,
}: SettingsFormProps): React.ReactNode {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialValues,
    mode: 'onBlur',
  })

  const submitHandler = handleSubmit(async (values) => {
    await onSubmit(values)
    reset(values)
  })

  return (
    <form className="settings-form" onSubmit={submitHandler} noValidate>
      <section className="settings-form__section">
        <h2>Profile</h2>
        <p className="settings-form__section-desc">
          Basic account details used across the app.
        </p>

        <FormField
          id="displayName"
          label="Display name"
          error={errors.displayName?.message}
        >
          <input
            id="displayName"
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            aria-invalid={Boolean(errors.displayName)}
            {...register('displayName')}
          />
        </FormField>

        <FormField
          id="email"
          label="Email"
          error={errors.email?.message}
        >
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </FormField>
      </section>

      <section className="settings-form__section">
        <h2>AI preferences</h2>
        <p className="settings-form__section-desc">
          Defaults for model calls and response behavior.
        </p>

        <FormField
          id="defaultModel"
          label="Default model"
          error={errors.defaultModel?.message}
        >
          <select
            id="defaultModel"
            aria-invalid={Boolean(errors.defaultModel)}
            {...register('defaultModel')}
          >
            {MODEL_OPTIONS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          id="temperature"
          label="Temperature"
          hint="Lower values are more focused; higher values are more creative."
          error={errors.temperature?.message}
        >
          <input
            id="temperature"
            type="number"
            step="0.1"
            min="0"
            max="1"
            aria-invalid={Boolean(errors.temperature)}
            {...register('temperature', { valueAsNumber: true })}
          />
        </FormField>

        <FormField
          id="maxTokens"
          label="Max tokens"
          hint="Upper bound for each model response (1–4096)."
          error={errors.maxTokens?.message}
        >
          <input
            id="maxTokens"
            type="number"
            step="1"
            min="1"
            max="4096"
            aria-invalid={Boolean(errors.maxTokens)}
            {...register('maxTokens', { valueAsNumber: true })}
          />
        </FormField>
      </section>

      <section className="settings-form__section">
        <h2>Notifications &amp; UX</h2>

        <div className="settings-form__checkbox">
          <input
            id="emailNotifications"
            type="checkbox"
            {...register('emailNotifications')}
          />
          <label htmlFor="emailNotifications">
            Email me when long-running jobs finish
          </label>
        </div>

        <div className="settings-form__checkbox">
          <input
            id="streamResponses"
            type="checkbox"
            {...register('streamResponses')}
          />
          <label htmlFor="streamResponses">
            Stream AI responses in the chat UI
          </label>
        </div>
      </section>

      <div className="settings-form__actions">
        <button
          type="button"
          className="settings-form__button settings-form__button--secondary"
          disabled={!isDirty || isSubmitting}
          onClick={() => reset(initialValues)}
        >
          Reset
        </button>
        <button
          type="submit"
          className="settings-form__button settings-form__button--primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </form>
  )
}
