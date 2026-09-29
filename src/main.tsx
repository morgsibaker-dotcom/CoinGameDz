import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import i18n from './i18n/config'
import { initializeTelegramWebApp } from './services/telegramService'
import { useTelegramStore } from './store/telegramStore'
import { mapTelegramLanguageToApp } from './utils/languageMapper'

// Initialize Telegram WebApp first
initializeTelegramWebApp()

// Initialize i18n
i18n.init()

function AppWrapper() {
  useEffect(() => {
    // Initialize Telegram store and set language
    const { initializeTelegram, telegramLanguageCode } = useTelegramStore.getState()
    initializeTelegram()

    // Map Telegram language to app language and set it
    const appLanguage = mapTelegramLanguageToApp(telegramLanguageCode, 'en')
    i18n.changeLanguage(appLanguage)

    // Set RTL for Arabic
    if (appLanguage === 'ar') {
      document.documentElement.dir = 'rtl'
    } else {
      document.documentElement.dir = 'ltr'
    }
  }, [])

  return <App />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>,
)
