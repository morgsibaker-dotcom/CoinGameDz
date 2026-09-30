import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  ArrowLeft,
  UserCheck,
  UserX,
} from 'lucide-react'
import {
  getAdminUsers,
  AdminUser,
} from '../services/adminUsersService'

export default function AdminUsers() {
  const navigate = useNavigate()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadUsers(value = '') {
    try {
      setLoading(true)
      setError('')

      const data = await getAdminUsers(value)
      setUsers(data)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to load users',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  function handleSearch() {
    loadUsers(search)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900 px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="rounded-xl bg-slate-800 p-3 hover:bg-slate-700"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold">
              Users Management
            </h1>

            <p className="text-sm text-slate-400">
              Manage CoinGameDz users
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex gap-2">
          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSearch()
              }
            }}
            placeholder="Search username, name or Telegram ID"
            className="flex-1 rounded-xl bg-slate-900 px-4 py-3 outline-none ring-1 ring-slate-800 focus:ring-blue-500"
          />

          <button
            type="button"
            onClick={handleSearch}
            className="rounded-xl bg-blue-600 px-5 py-3 hover:bg-blue-500"
          >
            <Search size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl bg-slate-900 p-8 text-center text-slate-400">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-2xl bg-slate-900 p-8 text-center text-slate-400">
            No users found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-slate-800">
                <tr className="text-sm text-slate-400">
                  <th className="px-4 py-4">User</th>
                  <th className="px-4 py-4">Telegram ID</th>
                  <th className="px-4 py-4">Language</th>
                  <th className="px-4 py-4">Points</th>
                  <th className="px-4 py-4">Level</th>
                  <th className="px-4 py-4">Referrals</th>
                  <th className="px-4 py-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-800 last:border-0"
                  >
                    <td className="px-4 py-4">
                      <div className="font-semibold">
                        {user.first_name}{' '}
                        {user.last_name ?? ''}
                      </div>

                      <div className="text-sm text-slate-400">
                        @{user.username ?? 'no_username'}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-300">
                      {user.telegram_id}
                    </td>

                    <td className="px-4 py-4 uppercase">
                      {user.language ?? '—'}
                    </td>

                    <td className="px-4 py-4 font-semibold">
                      {Number(
                        user.points_balance ?? 0,
                      ).toLocaleString()}
                    </td>

                    <td className="px-4 py-4">
                      {user.level}
                    </td>

                    <td className="px-4 py-4">
                      {user.referral_count}
                    </td>

                    <td className="px-4 py-4">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2 py-1 text-sm text-emerald-400">
                          <UserCheck size={16} />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-red-500/10 px-2 py-1 text-sm text-red-400">
                          <UserX size={16} />
                          Disabled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
