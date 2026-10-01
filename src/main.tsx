import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import i18n from './i18n/config'
import { initializeTelegramWebApp } from './services/telegramService'
import { useTelegramStore } from './store/telegramStore'
import { mapTelegramLanguageToApp } from './utils/languageMapper'
import { useUserStore } from './store/userStore'

initializeTelegramWebApp()

i18n.init()

function AppWrapper() {
  useEffect(() => {
    const initialize = async () => {
      const store = useTelegramStore.getState()

      await store.initializeTelegram()

      const { loadUser } = useUserStore.getState()
      await loadUser()

      const languageCode =
        useTelegramStore.getState().telegramLanguageCode

      const appLanguage = mapTelegramLanguageToApp(
        languageCode,
        'en'
      )

      i18n.changeLanguage(appLanguage)

      document.documentElement.dir =
        appLanguage === 'ar' ? 'rtl' : 'ltr'
    }

    initialize()
  }, [])

  return <App />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>,
)
