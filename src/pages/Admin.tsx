import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Users,
  Wallet,
  ListChecks,
  Gift,
  CircleDot,
  Settings,
  LogOut,
} from 'lucide-react'
import { adminLogout } from '../services/adminAuthService'

export default function Admin() {
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)

    try {
      await adminLogout()
      navigate('/admin/login')
    } catch (error) {
      console.error('[CoinGameDz] Admin logout failed', error)
    } finally {
      setLoggingOut(false)
    }
  }

  const sections = [
    {
      title: 'Dashboard',
      description: 'Application statistics and overview',
      icon: BarChart3,
    },
    {
      title: 'Users',
      description: 'Manage CoinGameDz users',
      icon: Users,
    },
    {
      title: 'Withdrawals',
      description: 'Review and manage withdrawal requests',
      icon: Wallet,
    },
    {
      title: 'Tasks',
      description: 'Manage earning tasks',
      icon: ListChecks,
    },
    {
      title: 'Rewards',
      description: 'Manage rewards and bonuses',
      icon: Gift,
    },
    {
      title: 'Wheel',
      description: 'Manage Wheel of Luck prizes',
      icon: CircleDot,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/80 px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              CoinGameDz Admin
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Administration Panel
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/settings')}
              className="rounded-xl bg-slate-800 p-3 transition hover:bg-slate-700"
              title="Settings"
            >
              <Settings size={20} />
            </button>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-xl bg-red-600/90 p-3 transition hover:bg-red-600 disabled:opacity-50"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Dashboard
          </h2>

          <p className="mt-2 text-slate-400">
            Manage your CoinGameDz platform from one place.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon

            return (
              <button
                key={section.title}
                type="button"
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-left transition hover:border-blue-500/50 hover:bg-slate-800/80"
              >
                <div className="mb-4 inline-flex rounded-xl bg-blue-600/10 p-3 text-blue-400">
                  <Icon size={24} />
                </div>

                <h3 className="text-lg font-semibold">
                  {section.title}
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  {section.description}
                </p>
              </button>
            )
          })}
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => navigate('/admin/settings')}
            className="flex w-full items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-left transition hover:border-blue-500/50 hover:bg-slate-800/80"
          >
            <div className="rounded-xl bg-slate-800 p-3 text-slate-300">
              <Settings size={24} />
            </div>

            <div>
              <h3 className="text-lg font-semibold">
                Settings
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Manage admin account and application settings.
              </p>
            </div>
          </button>
        </div>
      </main>
    </div>
  )
}
