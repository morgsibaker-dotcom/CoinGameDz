import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Earn from './pages/Earn'
import Rewards from './pages/Rewards'
import Referrals from './pages/Referrals'
import Wallet from './pages/Wallet'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import Admin from './pages/Admin'
import AdminUsers from './pages/AdminUsers'
import AdminTasks from './pages/AdminTasks'
import AdminWithdrawals from './pages/AdminWithdrawals'
import { initializeTelegramWebApp } from './services/telegramService'
import { useTelegramStore } from './store/telegramStore'
import { useUserStore } from './store/userStore'

export default function App() {
  const [ready, setReady] = useState(false)
  const initializeTelegram = useTelegramStore((s) => s.initializeTelegram)
  const loadUser = useUserStore((s) => s.loadUser)

  useEffect(() => {
    let mounted = true
    const boot = async () => {
      initializeTelegramWebApp()
      await initializeTelegram()
      if (mounted) {
        await loadUser()
        setReady(true)
      }
    }
    void boot()
    return () => { mounted = false }
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
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/tasks" element={<AdminTasks />} />
        <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
