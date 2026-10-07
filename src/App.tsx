import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Earn from './pages/Earn'
import Rewards from './pages/Rewards'
import Referrals from './pages/Referrals'
import Wallet from './pages/Wallet'
import Profile from './pages/Profile'
import History from './pages/History'
import NotFound from './pages/NotFound'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import AdminGuard from './components/admin/AdminGuard'
import AdminUsers from './pages/AdminUsers'
import AdminTasks from './pages/AdminTasks'
import AdminWithdrawals from './pages/AdminWithdrawals'
import AdminRewards from './pages/AdminRewards'
import AdminSettings from './pages/AdminSettings'
import AdminWheel from './pages/AdminWheel'
import { initializeTelegramWebApp, getTelegramWebApp } from './services/telegramService'
import { useTelegramStore } from './store/telegramStore'
import { useUserStore } from './store/userStore'
import { applyLanguage } from './i18n/config'
import { supabase } from './lib/supabase'

const TELEGRAM_AUTH_FUNCTION = 'rapid-endpoint'

export default function App() {
  const [ready, setReady] = useState(false)
  const initializeTelegram = useTelegramStore((s) => s.initializeTelegram)
  const loadUser = useUserStore((s) => s.loadUser)

  useEffect(() => {
    let mounted = true

    const boot = async () => {
      initializeTelegramWebApp()
      await initializeTelegram()

      let { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session) {
        const { error: signInError } = await supabase.auth.signInAnonymously()

        if (signInError) {
          console.error('[CoinGameDz] Anonymous auth failed:', signInError)
        } else {
          const refreshed = await supabase.auth.getSession()
          sessionData = refreshed.data
        }
      }

      const webApp = getTelegramWebApp()

      if (!webApp?.initData) {
        console.error('[CoinGameDz] Telegram initData is missing. Open the Mini App from Telegram.')
      } else if (!sessionData.session) {
        console.error('[CoinGameDz] Supabase session is missing.')
      } else {
        const { data: authData, error: authError } =
          await supabase.functions.invoke(TELEGRAM_AUTH_FUNCTION, {
            body: {
              initData: webApp.initData,
              startParam: webApp.initDataUnsafe?.start_param ?? null,
            },
            headers: {
              Authorization: `Bearer ${sessionData.session.access_token}`,
            },
          })

        if (authError) {
          console.error('[CoinGameDz] Telegram auth failed:', authError)
        } else {
          console.log('[CoinGameDz] Telegram auth completed:', authData)
        }
      }

      const telegramLanguage = useTelegramStore.getState().telegramLanguageCode

      if (telegramLanguage && ['ar', 'fr', 'en'].includes(telegramLanguage)) {
        applyLanguage(telegramLanguage)
      }

      if (mounted) {
        for (let attempt = 0; attempt < 5; attempt += 1) {
          await loadUser()

          if (useUserStore.getState().user) {
            break
          }

          if (attempt < 4) {
            await new Promise((resolve) => setTimeout(resolve, 700))
          }
        }

        setReady(true)
      }
    }

    void boot()

    return () => {
      mounted = false
    }
  }, [initializeTelegram, loadUser])

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-sm text-slate-400">Loading DzCoinEren…</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/earn" element={<Earn />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/referrals" element={<Referrals />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/history" element={<History />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminGuard />}>
          <Route index element={<Admin />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="tasks" element={<AdminTasks />} />
          <Route path="withdrawals" element={<AdminWithdrawals />} />
          <Route path="rewards" element={<AdminRewards />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="wheel" element={<AdminWheel />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
