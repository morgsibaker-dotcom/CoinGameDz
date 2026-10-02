import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { applyLanguage, supportedLanguages } from '../../i18n/config'

export default function LanguageSelector() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setOpen(false)
    window.addEventListener('languagechange', handler)
    return () => window.removeEventListener('languagechange', handler)
  }, [])

  const current =
    supportedLanguages.find(language => language.code === i18n.language) ??
    supportedLanguages[0]

  const change = (code: 'ar' | 'en' | 'fr') => {
    applyLanguage(code)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm font-semibold"
      >
        {current.name}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 min-w-32 overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-xl">
          {supportedLanguages.map(language => (
            <button
              key={language.code}
              type="button"
              onClick={() => change(language.code)}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-white/5"
            >
              {language.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
