import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Users,
  Wallet,
  ListChecks,
  Gift,
  CircleDot,
  Settings,
  LogOut,
  RefreshCw,
  LucideIcon,
} from 'lucide-react'
import { adminLogout } from '../services/adminAuthService'
import {
  getAdminDashboardStats,
  AdminDashboardStats,
} from '../services/adminDashboardService'

export default function Admin() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [loggingOut, setLoggingOut] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] =
    useState<AdminDashboardStats | null>(null)

  async function loadStats() {
    try {
      setError('')
      const data = await getAdminDashboardStats()
      setStats(data)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : t('common.error'),
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  async function handleRefresh() {
    setRefreshing(true)
    await loadStats()
  }

  async function handleLogout() {
    setLoggingOut(true)

    try {
      await adminLogout()
      navigate('/admin/login')
    } catch (error) {
      console.error(
        '[CoinGameDz] Admin logout failed',
        error,
      )
    } finally {
      setLoggingOut(false)
    }
  }

  const sections = [
    {
      title: t('admin.users'),
      description: t('admin.manageUsers'),
      icon: Users,
    },
    {
      title: t('admin.withdrawals'),
      description: t('admin.manageWithdrawals'),
      icon: Wallet,
    },
    {
      title: t('admin.tasks'),
      description: t('admin.manageTasks'),
      icon: ListChecks,
    },
    {
      title: t('admin.rewards'),
      description: t('admin.manageRewards'),
      icon: Gift,
    },
    {
      title: t('admin.wheel'),
      description: t('admin.manageWheel'),
      icon: CircleDot,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/80 px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {t('admin.title')}
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              {t('admin.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="rounded-xl bg-slate-800 p-3 transition hover:bg-slate-700 disabled:opacity-50"
              title={t('common.search')}
            >
              <RefreshCw
                size={20}
                className={refreshing ? 'animate-spin' : ''}
              />
            </button>

            <button
              onClick={() => navigate('/admin/settings')}
              className="rounded-xl bg-slate-800 p-3 transition hover:bg-slate-700"
              title={t('admin.settings')}
            >
              <Settings size={20} />
            </button>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-xl bg-red-600/90 p-3 transition hover:bg-red-600 disabled:opacity-50"
              title={t('admin.logout')}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            {t('admin.dashboard')}
          </h2>

          <p className="mt-2 text-slate-400">
            {t('admin.platformManagement')}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={t('admin.users')}
            value={stats?.users_count ?? 0}
            icon={Users}
            loading={loading}
          />

          <StatCard
            title={t('admin.tasks')}
            value={stats?.active_tasks_count ?? 0}
            icon={ListChecks}
            loading={loading}
          />

          <StatCard
            title={t('admin.rewards')}
            value={stats?.active_rewards_count ?? 0}
            icon={Gift}
            loading={loading}
          />

          <StatCard
            title={t('admin.withdrawals')}
            value={stats?.pending_withdrawals_count ?? 0}
            icon={Wallet}
            loading={loading}
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <InfoCard
            title="Total Points"
            value={stats?.total_points ?? 0}
            loading={loading}
          />

          <InfoCard
            title="Withdrawal Requests"
            value={stats?.withdrawals_count ?? 0}
            loading={loading}
          />

          <InfoCard
            title="Processed USD"
            value={`$${Number(
              stats?.total_withdrawal_usd ?? 0,
            ).toFixed(2)}`}
            loading={loading}
          />
        </div>

        <div className="mt-8">
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
                {t('admin.settings')}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                {t('admin.accountSettings')}
              </p>
            </div>
          </button>
        </div>
      </main>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: LucideIcon
  loading: boolean
}

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold">
            {loading ? '...' : value.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl bg-blue-600/10 p-3 text-blue-400">
          <Icon size={24} />
        </div>
      </div>
    </div>
  )
}

interface InfoCardProps {
  title: string
  value: number | string
  loading: boolean
}

function InfoCard({
  title,
  value,
  loading,
}: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {loading ? '...' : value}
      </p>
    </div>
  )
}
