import { useState } from 'react'
import { SettingsForm } from '../components/SettingsForm/SettingsForm'
import { saveSettings } from '../services/settings'
import type { SettingsFormValues } from '../types/settings'
import './SettingsPage.css'

export function SettingsPage(): React.ReactNode {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (values: SettingsFormValues): Promise<void> => {
    setStatus('idle')
    try {
      await saveSettings(values)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <main className="settings-page">
      <header className="settings-page__header">
        <h1>Settings</h1>
        <p>Manage your profile and AI defaults. Fields validate on blur.</p>
      </header>

      {status === 'success' && (
        <p className="settings-page__banner settings-page__banner--success" role="status">
          Settings saved successfully.
        </p>
      )}
      {status === 'error' && (
        <p className="settings-page__banner settings-page__banner--error" role="alert">
          Could not save settings. Please try again.
        </p>
      )}

      <SettingsForm onSubmit={handleSubmit} />
    </main>
  )
}
