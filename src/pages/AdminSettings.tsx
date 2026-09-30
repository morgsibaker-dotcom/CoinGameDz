import { FormEvent, useState } from 'react'
import {
  updateAdminEmail,
  updateAdminPassword,
} from '../services/adminSettingsService'

export default function AdminSettings() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleEmailSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)

    try {
      await updateAdminEmail(email)
      setMessage(
        'Email update requested. Check the new email inbox for confirmation.',
      )
      setEmail('')
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to update email.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setMessage('')
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await updateAdminPassword(password)
      setMessage('Password updated successfully.')
      setPassword('')
      setConfirmPassword('')
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to update password.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Admin Settings
          </h1>

          <p className="mt-2 text-slate-400">
            Manage your administrator account.
          </p>
        </div>

        {message && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">
            Change Email
          </h2>

          <form
            onSubmit={handleEmailSubmit}
            className="mt-5 space-y-4"
          >
            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="New email address"
              required
              className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Change Email'}
            </button>
          </form>

          <p className="mt-3 text-sm text-slate-500">
            Supabase may require confirmation from the new email address.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">
            Change Password
          </h2>

          <form
            onSubmit={handlePasswordSubmit}
            className="mt-5 space-y-4"
          >
            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="New password"
              required
              minLength={6}
              className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none"
            />

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Confirm new password"
              required
              minLength={6}
              className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold disabled:opacity-50"
            >
              {loading
                ? 'Updating...'
                : 'Change Password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
