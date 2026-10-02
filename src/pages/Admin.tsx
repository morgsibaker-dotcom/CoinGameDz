import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Wallet,
  ListTodo,
  Gift,
  CircleDot,
  Settings,
  LogOut,
  RefreshCw,
} from 'lucide-react'

import { adminLogout } from '../services/adminAuthService'
import {
  getAdminDashboardStats,
  AdminDashboardStats,
} from '../services/adminDashboardService'

interface StatCardProps {
  title: string
  value: number
  subtitle: string
  icon: typeof Users
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold">
            {Number(value).toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {subtitle}
          </p>
        </div>

        <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}

import { supabase } from '../lib/supabase'


function AdSettings(){const [provider,setProvider]=useState('');const [url,setUrl]=useState('');const [placement,setPlacement]=useState('');const [saved,setSaved]=useState(false);useEffect(()=>{supabase.from('app_settings').select('key,value').in('key',['ad_provider','ad_platform_url','ad_placement']).then(({data})=>{for(const x of data||[]){const v=(x.value as any)?.value??'';if(x.key==='ad_provider')setProvider(String(v));if(x.key==='ad_platform_url')setUrl(String(v));if(x.key==='ad_placement')setPlacement(String(v))}})},[]);const save=async()=>{setSaved(false);for(const [key,value] of [['ad_provider',provider],['ad_platform_url',url],['ad_placement',placement]])await supabase.from('app_settings').upsert({key,value:{value},updated_at:new Date().toISOString()});setSaved(true)};return <section className="mt-6 rounded-2xl border border-white/10 bg-slate-900 p-5"><h2 className="text-lg font-bold">إعدادات الإعلانات</h2><div className="mt-4 space-y-3"><input value={provider} onChange={e=>setProvider(e.target.value)} placeholder="اسم منصة الإعلانات" className="w-full rounded-xl bg-slate-800 p-3"/><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="رابط منصة الإعلانات" className="w-full rounded-xl bg-slate-800 p-3"/><input value={placement} onChange={e=>setPlacement(e.target.value)} placeholder="AdsGram Block ID / Ad Unit ID" className="w-full rounded-xl bg-slate-800 p-3"/><button onClick={save} className="w-full rounded-xl bg-sky-500 p-3 font-bold text-slate-950">حفظ إعدادات الإعلانات</button>{saved&&<p className="text-sm text-emerald-400">تم الحفظ ✓</p>}</div></section>}
export default function Admin() {
  const navigate = useNavigate()

  const [stats, setStats] =
    useState<AdminDashboardStats | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadStats() {
    try {
      setLoading(true)
      setError('')

      const data = await getAdminDashboardStats()

      setStats(data)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to load dashboard',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  async function handleLogout() {
    try {
      await adminLogout()
      navigate('/admin/login')
    } catch (error) {
      console.error(
        '[CoinGameDz] Admin logout failed',
        error,
      )
    }
  }

  const menuItems = [
    {
      title: 'Users',
      description: 'Manage registered users',
      icon: Users,
      path: '/admin/users',
    },
    {
      title: 'Withdrawals',
      description: 'Manage withdrawal requests',
      icon: Wallet,
      path: '/admin/withdrawals',
    },
    {
      title: 'Tasks',
      description: 'Create and manage earning tasks',
      icon: ListTodo,
      path: '/admin/tasks',
    },
    {
      title: 'Rewards',
      description: 'Manage rewards and bonuses',
      icon: Gift,
      path: '/admin/rewards',
    },
    {
      title: 'Wheel',
      description: 'Manage Wheel of Luck prizes',
      icon: CircleDot,
      path: '/admin/wheel',
    },
    {
      title: 'Settings',
      description: 'Admin account settings',
      icon: Settings,
      path: '/admin/settings',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold">
              DzCoinEren Admin
            </h1>

            <p className="text-sm text-slate-400">
              Administration Dashboard
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadStats}
              disabled={loading}
              className="rounded-xl bg-slate-800 p-3 hover:bg-slate-700 disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw
                size={19}
                className={
                  loading ? 'animate-spin' : ''
                }
              />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-red-400 hover:bg-red-500/20"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-bold">
            Dashboard
          </h2>

          {loading && !stats ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
              Loading dashboard...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Users"
                value={stats?.users_count ?? 0}
                subtitle={`${stats?.active_users_count ?? 0} active`}
                icon={Users}
              />

              <StatCard
                title="Tasks"
                value={stats?.tasks_count ?? 0}
                subtitle={`${stats?.active_tasks_count ?? 0} active`}
                icon={ListTodo}
              />

              <StatCard
                title="Rewards"
                value={stats?.rewards_count ?? 0}
                subtitle={`${stats?.active_rewards_count ?? 0} active`}
                icon={Gift}
              />

              <StatCard
                title="Withdrawals"
                value={stats?.withdrawals_count ?? 0}
                subtitle={`${stats?.pending_withdrawals_count ?? 0} pending`}
                icon={Wallet}
              />
            </div>
          )}
        </section>

        <section className="mb-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Total User Points
              </p>

              <p className="mt-2 text-3xl font-bold">
                {Number(
                  stats?.total_points ?? 0,
                ).toLocaleString()}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Current points held by users
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Withdrawals Value
              </p>

              <p className="mt-2 text-3xl font-bold">
                $
                {Number(
                  stats?.total_withdrawal_usd ?? 0,
                ).toFixed(2)}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Processing + completed withdrawals
              </p>
            </div>
          </div>
        </section>

        <AdSettings />

        <section>
          <h2 className="mb-4 text-xl font-bold">Management
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => {
              const Icon = item.icon

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 text-left transition hover:border-blue-500/50 hover:bg-slate-800"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
                    <Icon size={24} />
                  </div>

                  <h3 className="text-lg font-bold">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    {item.description}
                  </p>
                </button>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}