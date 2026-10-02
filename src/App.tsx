import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import LoadingSpinner from './components/common/LoadingSpinner'
import AdminGuard from './components/admin/AdminGuard'

const Home = lazy(() => import('./pages/Home'))
const Earn = lazy(() => import('./pages/Earn'))
const Rewards = lazy(() => import('./pages/Rewards'))
const Referrals = lazy(() => import('./pages/Referrals'))
const Wallet = lazy(() => import('./pages/Wallet'))
const Profile = lazy(() => import('./pages/Profile'))

const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const Admin = lazy(() => import('./pages/Admin'))
const AdminSettings = lazy(() => import('./pages/AdminSettings'))
const AdminUsers = lazy(() => import('./pages/AdminUsers'))
const AdminWithdrawals = lazy(() => import('./pages/AdminWithdrawals'))
const AdminTasks = lazy(() => import('./pages/AdminTasks'))
const AdminRewards = lazy(() => import('./pages/AdminRewards'))
const AdminWheel = lazy(() => import('./pages/AdminWheel'))

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

            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <Admin />
                </AdminGuard>
              }
            />

            <Route
              path="/admin/users"
              element={
                <AdminGuard>
                  <AdminUsers />
                </AdminGuard>
              }
            />

            <Route
              path="/admin/withdrawals"
              element={
                <AdminGuard>
                  <AdminWithdrawals />
                </AdminGuard>
              }
            />

            <Route
              path="/admin/tasks"
              element={
                <AdminGuard>
                  <AdminTasks />
                </AdminGuard>
              }
            />

            <Route
              path="/admin/rewards"
              element={
                <AdminGuard>
                  <AdminRewards />
                </AdminGuard>
              }
            />

            <Route
              path="/admin/wheel"
              element={
                <AdminGuard>
                  <AdminWheel />
                </AdminGuard>
              }
            />

            <Route
              path="/admin/settings"
              element={
                <AdminGuard>
                  <AdminSettings />
                </AdminGuard>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  )
}

export default App
