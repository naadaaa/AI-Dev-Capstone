import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Requires a non-empty local part and domain, e.g. "a@b.co".
// Deliberately stricter than z.string().email() so that syntactically
// "valid-looking" but semantically empty addresses (e.g. "@example.com")
// are rejected.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const settingsSchema = z.object({
  displayName: z
    .string()
    // trim() runs before the length checks below, so whitespace-only
    // input (e.g. "   ") collapses to "" and correctly fails min(2).
    .trim()
    .min(2, 'Display name must be between 2 and 50 characters')
    .max(50, 'Display name must be between 2 and 50 characters'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .regex(EMAIL_REGEX, 'Please enter a valid email address'),
  bio: z
    .string()
    .max(280, 'Bio must be 280 characters or fewer')
    .optional()
    .or(z.literal('')),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  defaultValues?: Partial<SettingsFormValues>;
  onSubmit: (values: SettingsFormValues) => void | Promise<void>;
}

export default function SettingsForm({ defaultValues, onSubmit }: SettingsFormProps) {
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isValid, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    mode: 'onChange',
    defaultValues: {
      displayName: '',
      email: '',
      bio: '',
      ...defaultValues,
    },
  });

  // react-hook-form's `isValid` is undefined/true until the first
  // validation pass has run. Trigger validation on mount so the submit
  // button is correctly disabled for an empty/required-but-unfilled form
  // from the very first render, without requiring the user to touch a field.
  useEffect(() => {
    trigger();
  }, [trigger]);

  const submitHandler = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <form onSubmit={submitHandler} noValidate>
      <div>
        <label htmlFor="displayName">Display name</label>
        <input
          id="displayName"
          type="text"
          {...register('displayName')}
          aria-invalid={errors.displayName ? 'true' : 'false'}
          aria-describedby={errors.displayName ? 'displayName-error' : undefined}
        />
        {errors.displayName && (
          <p id="displayName-error" role="alert">
            {errors.displayName.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          {...register('bio')}
          aria-invalid={errors.bio ? 'true' : 'false'}
          aria-describedby={errors.bio ? 'bio-error' : undefined}
        />
        {errors.bio && (
          <p id="bio-error" role="alert">
            {errors.bio.message}
          </p>
        )}
      </div>

      <button type="submit" disabled={!isValid || isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  );
}