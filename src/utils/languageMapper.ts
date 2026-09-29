/**
 * Map Telegram language codes to supported app languages
 * Telegram supports many languages; we only support: en, ar, fr
 */
export const mapTelegramLanguageToApp = (
  telegramLang: string | null | undefined,
  defaultLang: 'en' | 'ar' | 'fr' = 'en'
): 'en' | 'ar' | 'fr' => {
  if (!telegramLang) return defaultLang

  const langCode = telegramLang.toLowerCase()

  // Map Telegram language codes to app languages
  const languageMap: Record<string, 'en' | 'ar' | 'fr'> = {
    // English variants
    en: 'en',
    'en-us': 'en',
    'en-gb': 'en',
    'en-au': 'en',
    'en-ca': 'en',
    'en-in': 'en',
    'en-nz': 'en',
    'en-za': 'en',

    // Arabic variants
    ar: 'ar',
    'ar-ae': 'ar',
    'ar-bh': 'ar',
    'ar-dz': 'ar',
    'ar-eg': 'ar',
    'ar-iq': 'ar',
    'ar-jo': 'ar',
    'ar-kw': 'ar',
    'ar-lb': 'ar',
    'ar-ly': 'ar',
    'ar-ma': 'ar',
    'ar-om': 'ar',
    'ar-qa': 'ar',
    'ar-sa': 'ar',
    'ar-sd': 'ar',
    'ar-sy': 'ar',
    'ar-tn': 'ar',
    'ar-ye': 'ar',

    // French variants
    fr: 'fr',
    'fr-be': 'fr',
    'fr-ca': 'fr',
    'fr-ch': 'fr',
    'fr-fr': 'fr',
    'fr-lu': 'fr',
  }

  return languageMap[langCode] || defaultLang
}
