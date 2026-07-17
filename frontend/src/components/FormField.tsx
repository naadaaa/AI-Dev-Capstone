import type { ReactNode } from 'react'

type FormFieldProps = {
  id: string
  label: string
  error?: string
  hint?: string
  children: ReactNode
}

export function FormField({
  id,
  label,
  error,
  hint,
  children,
}: FormFieldProps): ReactNode {
  const errorId = error ? `${id}-error` : undefined
  const hintId = hint ? `${id}-hint` : undefined
  const describedBy =
    [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={`form-field${error ? ' form-field--invalid' : ''}`}>
      <label className="form-field__label" htmlFor={id}>
        {label}
      </label>
      <div
        className="form-field__control"
        aria-describedby={describedBy}
      >
        {children}
      </div>
      {hint && !error && (
        <p className="form-field__hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="form-field__error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
