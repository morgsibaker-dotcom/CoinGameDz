import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type User = {
  id: string
  telegram_id: number
  username: string | null
  first_name: string | null
  points_balance: number
  level: number
  is_active: boolean
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    const { data, error: loadError } = await supabase
      .from('users')
      .select('id,telegram_id,username,first_name,points_balance,level,is_active')
      .order('created_at', { ascending: false })
      .limit(100)

    if (loadError) {
      setError(loadError.message)
      return
    }

    setUsers((data ?? []) as User[])
  }

  useEffect(() => {
    void load()
  }, [])

  const change = async (userId: string, delta: number) => {
    setBusy(userId)
    setError('')

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        'admin-balance',
        {
          body: {
            user_id: userId,
            delta,
            reason: delta > 0 ? 'Admin credit' : 'Admin debit',
          },
        },
      )

      if (invokeError) throw new Error(invokeError.message)
      if (!data?.success) throw new Error(data?.error ?? 'Balance update failed')

      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Balance update failed')
    } finally {
      setBusy('')
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-5 text-white">
      <h1 className="text-2xl font-black">DzCoinEren — Users</h1>

      {error && (
        <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-2xl border border-white/10 bg-slate-900 p-4"
          >
            <div className="flex justify-between gap-3">
              <b>{user.first_name || user.username || user.telegram_id}</b>
              <span className="text-sky-400">
                {Number(user.points_balance).toLocaleString()} DZE
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              @{user.username || 'no_username'} · Level {user.level}
            </p>

            <div className="mt-3 flex gap-2">
              <button
                disabled={busy === user.id}
                onClick={() => change(user.id, 100)}
                className="flex-1 rounded-xl bg-emerald-500 p-2 font-bold text-slate-950 disabled:opacity-50"
              >
                +100
              </button>

              <button
                disabled={busy === user.id}
                onClick={() => change(user.id, -100)}
                className="flex-1 rounded-xl bg-red-500 p-2 font-bold disabled:opacity-50"
              >
                -100
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
