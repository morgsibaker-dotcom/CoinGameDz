import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import {
  getAdminCoreSettings,
  updateAdminCoreSettings,
  updateAdminEmail,
  updateAdminPassword,
  AdminCoreSettings,
} from '../services/adminSettingsService'

const defaults: AdminCoreSettings = {
  withdrawal_min_points: 10000,
  points_per_usd: 1000,
  usd_to_dzd: 130,
  usd_to_usdt: 1,
  tap_limit_per_minute: 60,
  daily_ad_limit: 10,
  ad_reward_points: 100,
}

export default function AdminSettings() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<AdminCoreSettings>(defaults)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function load() {
    try {
      setLoading(true)
      setError('')
      setSettings(await getAdminCoreSettings())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const update = (key: keyof AdminCoreSettings, value: string) => {
    setSettings(current => ({ ...current, [key]: Number(value) }))
  }

  async function saveSettings() {
    setSaving(true)
    setMessage('')
    setError('')
    try {
      await updateAdminCoreSettings(settings)
      setMessage('Core settings saved successfully.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  async function saveEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      await updateAdminEmail(email)
      setEmail('')
      setMessage('Email update requested. Check the new email for confirmation.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update email')
    } finally {
      setSaving(false)
    }
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
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
      setPassword('')
      setConfirmPassword('')
      setMessage('Password updated successfully.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  const fields: Array<{ key: keyof AdminCoreSettings; label: string; min: number; step?: string }> = [
    { key: 'withdrawal_min_points', label: 'Minimum withdrawal points', min: 1 },
    { key: 'points_per_usd', label: 'Points = 1 USD', min: 1 },
    { key: 'usd_to_dzd', label: '1 USD = DZD', min: 0.01, step: '0.01' },
    { key: 'usd_to_usdt', label: '1 USD = USDT', min: 0.000001, step: '0.000001' },
    { key: 'tap_limit_per_minute', label: 'Tap limit per minute', min: 1 },
    { key: 'daily_ad_limit', label: 'Daily rewarded-ad limit', min: 0 },
    { key: 'ad_reward_points', label: 'Points per rewarded ad', min: 0 },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900 px-4 py-4">
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          <button type="button" onClick={() => navigate('/admin')} className="rounded-xl bg-slate-800 p-3">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Admin Settings</h1>
            <p className="text-sm text-slate-400">Core economy and administrator settings</p>
          </div>
          <button type="button" onClick={() => void load()} disabled={loading} className="rounded-xl bg-slate-800 p-3">
            <RefreshCw size={19} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        {message && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400">{message}</div>}
        {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">{error}</div>}

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold">Core Economy</h2>
          <p className="mt-1 text-sm text-slate-400">You control the points and payout exchange rates here.</p>
          {loading ? (
            <p className="mt-6 text-slate-400">Loading...</p>
          ) : (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {fields.map(field => (
                  <label key={field.key} className="block">
                    <span className="mb-2 block text-sm text-slate-300">{field.label}</span>
                    <input
                      type="number"
                      min={field.min}
                      step={field.step}
                      value={settings[field.key]}
                      onChange={e => update(field.key, e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3"
                    />
                  </label>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-slate-950 p-4 text-sm text-slate-300">
                {settings.points_per_usd.toLocaleString()} points = $1 = {settings.usd_to_dzd.toLocaleString()} DZD = {settings.usd_to_usdt.toFixed(6)} USDT
                <p className="mt-1 text-xs text-slate-500">These are your configured payout rates, not live market prices.</p>
              </div>
              <button type="button" onClick={() => void saveSettings()} disabled={saving} className="mt-5 w-full rounded-xl bg-sky-500 p-3 font-bold text-slate-950 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Core Settings'}
              </button>
            </>
          )}
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <form onSubmit={saveEmail} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">Change Email</h2>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="New email" className="mt-5 w-full rounded-xl bg-slate-800 p-3" />
            <button type="submit" disabled={saving} className="mt-4 w-full rounded-xl bg-sky-500 p-3 font-bold text-slate-950 disabled:opacity-50">Update Email</button>
          </form>

          <form onSubmit={savePassword} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">Change Password</h2>
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" className="mt-5 w-full rounded-xl bg-slate-800 p-3" />
            <input type="password" required minLength={6} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="mt-3 w-full rounded-xl bg-slate-800 p-3" />
            <button type="submit" disabled={saving} className="mt-4 w-full rounded-xl bg-sky-500 p-3 font-bold text-slate-950 disabled:opacity-50">Update Password</button>
          </form>
        </section>
      </main>
    </div>
  )
}
