import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Earn from './pages/Earn'
import Rewards from './pages/Rewards'
import Referrals from './pages/Referrals'
import Wallet from './pages/Wallet'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import { initializeTelegramWebApp } from './services/telegramService'

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initializeTelegramWebApp()
    setReady(true)
  }, [])

  if (!ready) return <div className="min-h-screen bg-slate-950" />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/earn" element={<Earn />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/referrals" element={<Referrals />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
