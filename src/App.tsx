import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import LoadingSpinner from './components/common/LoadingSpinner'

const Home = lazy(() => import('./pages/Home'))
const Earn = lazy(() => import('./pages/Earn'))
const Rewards = lazy(() => import('./pages/Rewards'))
const Referrals = lazy(() => import('./pages/Referrals'))
const Wallet = lazy(() => import('./pages/Wallet'))
const Profile = lazy(() => import('./pages/Profile'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminSettings = lazy(() => import('./pages/AdminSettings'))
const NotFoundPage = lazy(() => import('./pages/NotFound'))

function App() {
  const { i18n } = useTranslation()

  useEffect(() => {
    if (i18n.language === 'ar') {
      document.documentElement.dir = 'rtl'
      document.documentElement.lang = 'ar'
    } else {
      document.documentElement.dir = 'ltr'
      document.documentElement.lang = i18n.language
    }
  }, [i18n.language])

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-white">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/earn" element={<Earn />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/profile" element={<Profile />} />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/settings" element={<AdminSettings />} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  )
}

export default App
