import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { adminLogin } from '../services/adminAuthService'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [language, setLanguage] = useState(
    localStorage.getItem('coingamedz_admin_language') ||
      'en',
  )

  useEffect(() => {
    i18n.changeLanguage(language)

    document.documentElement.dir =
      language === 'ar' ? 'rtl' : 'ltr'

    document.documentElement.lang = language
  }, [language, i18n])

  function handleLanguageChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    const selectedLanguage = event.target.value

    setLanguage(selectedLanguage)

    localStorage.setItem(
      'coingamedz_admin_language',
      selectedLanguage,
    )
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await adminLogin(email, password)
      navigate('/admin')
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : t('common.error'),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">

        <div className="flex justify-end">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="rounded-xl bg-slate-800 px-3 py-2 text-sm outline-none"
            aria-label="Language"
          >
            <option value="ar">🇩🇿 العربية</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="en">🇬🇧 English</option>
          </select>
        </div>

        <h1 className="mt-4 text-2xl font-bold text-center">
          {t('admin.title')}
        </h1>

        <p className="mt-2 text-center text-slate-400">
          {t('admin.login')}
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >
          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder={t('admin.newEmail')}
            required
            className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none"
          />

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder={t('admin.newPassword')}
            required
            className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none"
          />

          {error && (
            <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold disabled:opacity-50"
          >
            {loading
              ? t('common.loading')
              : t('admin.login')}
          </button>
        </form>
      </div>
    </div>
  )
}
