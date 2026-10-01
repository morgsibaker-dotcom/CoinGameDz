import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import {
  updateAdminEmail,
  updateAdminPassword,
  getAdminAppConfig,
  updateAdminAppConfig,
  AdminAppConfig,
} from '../services/adminSettingsService'

interface AppConfigForm {
  rewarded_video_points: string
  daily_login_points: string
  points_per_usd: string
  referral_reward_points: string
  referrals_per_reward: string
  minimum_withdrawal_points: string
}

const DEFAULT_CONFIG: AppConfigForm = {
  rewarded_video_points: '2',
  daily_login_points: '10',
  points_per_usd: '1000',
  referral_reward_points: '100',
  referrals_per_reward: '10',
  minimum_withdrawal_points: '1000',
}

export default function AdminSettings() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [configForm, setConfigForm] =
    useState<AppConfigForm>(DEFAULT_CONFIG)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatingConfigKey, setUpdatingConfigKey] =
    useState<string | null>(null)

  useEffect(() => {
    void loadAppConfig()
  }, [])

  async function loadAppConfig() {
    try {
      setLoading(true)
      setError('')

      const configs = await getAdminAppConfig()

      const newForm: AppConfigForm = {
        ...DEFAULT_CONFIG,
      }

      configs.forEach((config: AdminAppConfig) => {
        if (config.key in newForm) {
          newForm[config.key as keyof AppConfigForm] =
            String(config.value)
        }
      })

      setConfigForm(newForm)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load app configuration.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleEmailSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setMessage('')
    setError('')
    setSaving(true)

    try {
      await updateAdminEmail(email)

      setMessage(
        'Email update requested. Check the new email inbox for confirmation.',
      )

      setEmail('')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update email.',
      )
    } finally {
      setSaving(false)
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

    setSaving(true)

    try {
      await updateAdminPassword(password)

      setMessage('Password updated successfully.')

      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update password.',
      )
    } finally {
      setSaving(false)
    }
  }

  function handleConfigChange(
    key: keyof AppConfigForm,
    value: string,
  ) {
    setConfigForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  async function saveConfigValue(
    key: keyof AppConfigForm,
  ) {
    try {
      setUpdatingConfigKey(key)
      setError('')
      setMessage('')

      const value = configForm[key]
      const numValue = Number(value)

      if (
        !Number.isFinite(numValue) ||
        numValue < 0
      ) {
        throw new Error(
          `Invalid value for ${key}: must be a non-negative number.`,
        )
      }

      await updateAdminAppConfig(key, numValue)

      setMessage(`${key} updated successfully.`)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to update ${key}.`,
      )
    } finally {
      setUpdatingConfigKey(null)
    }
  }

  const configLabels: Record<
    keyof AppConfigForm,
    string
  > = {
    rewarded_video_points: 'Rewarded Video Points',
    daily_login_points: 'Daily Login Points',
    points_per_usd: 'Points per USD',
    referral_reward_points:
      'Referral Reward Points',
    referrals_per_reward:
      'Referrals per Reward',
    minimum_withdrawal_points:
      'Minimum Withdrawal Points',
  }

  const configDescriptions: Record<
    keyof AppConfigForm,
    string
  > = {
    rewarded_video_points:
      'Points awarded for watching one rewarded video.',
    daily_login_points:
      'Points awarded for the daily login bonus.',
    points_per_usd:
      'Number of points equal to 1 USD.',
    referral_reward_points:
      'Points awarded after reaching the referral reward threshold.',
    referrals_per_reward:
      'Number of successful referrals required for one reward.',
    minimum_withdrawal_points:
      'Minimum points required to request a withdrawal.',
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900 px-4 py-4">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="rounded-xl bg-slate-800 p-3 hover:bg-slate-700"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              Admin Settings
            </h1>

            <p className="text-sm text-slate-400">
              Manage administrator account and app configuration
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadAppConfig()}
            disabled={loading}
            className="rounded-xl bg-slate-800 p-3 hover:bg-slate-700 disabled:opacity-50"
            title="Refresh config"
          >
            <RefreshCw
              size={19}
              className={
                loading ? 'animate-spin' : ''
              }
            />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {message && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        <section className="mb-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold">
              App Configuration
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Manage core game economy settings
            </p>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
              Loading configuration...
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {(
                Object.keys(
                  configLabels,
                ) as (keyof AppConfigForm)[]
              ).map((key) => (
                <div
                  key={key}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                >
                  <label className="mb-2 block text-sm font-semibold">
                    {configLabels[key]}
                  </label>

                  <p className="mb-3 text-xs text-slate-500">
                    {configDescriptions[key]}
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={configForm[key]}
                      onChange={(event) =>
                        handleConfigChange(
                          key,
                          event.target.value,
                        )
                      }
                      className="flex-1 rounded-xl bg-slate-800 px-4 py-3 outline-none"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        void saveConfigValue(key)
                      }
                      disabled={
                        updatingConfigKey !== null
                      }
                      className="rounded-xl bg-blue-600 px-4 py-3 font-semibold disabled:opacity-50"
                    >
                      {updatingConfigKey === key
                        ? 'Saving...'
                        : 'Save'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">
              Account Settings
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Manage your administrator account
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-xl font-semibold">
                Change Email
              </h3>

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
                  disabled={saving}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold disabled:opacity-50"
                >
                  {saving
                    ? 'Updating...'
                    : 'Change Email'}
                </button>
              </form>

              <p className="mt-3 text-sm text-slate-500">
                Supabase may require confirmation from
                the new email address.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-xl font-semibold">
                Change Password
              </h3>

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
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                  className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none"
                />

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold disabled:opacity-50"
                >
                  {saving
                    ? 'Updating...'
                    : 'Change Password'}
                </button>
              </form>
            </section>
          </div>
        </section>
      </main>
    </div>
  )
}
