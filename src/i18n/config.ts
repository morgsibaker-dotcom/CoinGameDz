import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslation from './locales/en.json'
import arTranslation from './locales/ar.json'
import frTranslation from './locales/fr.json'

const resources = {
  en: { translation: enTranslation },
  ar: { translation: arTranslation },
  fr: { translation: frTranslation },
}

export const supportedLanguages = [
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'fr', name: 'Français', dir: 'ltr' },
] as const

export type LanguageCode = (typeof supportedLanguages)[number]['code']

const isLanguageCode = (value: string | null): value is LanguageCode =>
  value === 'ar' || value === 'en' || value === 'fr'

const savedLanguage =
  typeof window !== 'undefined'
    ? window.localStorage.getItem('dze_language')
    : null

const initialLanguage: LanguageCode = isLanguageCode(savedLanguage)
  ? savedLanguage
  : 'ar'

export function applyLanguage(language: LanguageCode) {
  void i18n.changeLanguage(language)

  if (typeof document !== 'undefined') {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem('dze_language', language)
  }
}

void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

applyLanguage(initialLanguage)

export default i18n
