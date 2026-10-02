import { useEffect, useState } from 'react'
import { getAdminWithdrawals, AdminWithdrawal } from '../services/adminWithdrawalService'
import { supabase } from '../lib/supabase'

export default function AdminWithdrawals() {
  const [rows, setRows] = useState<AdminWithdrawal[]>([])
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    try {
      setRows(await getAdminWithdrawals())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load withdrawals')
    }
  }

  useEffect(() => { void load() }, [])

  const setStatus = async (id: string, status: 'approved' | 'rejected') => {
    setBusy(id)
    setError('')
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('admin-withdrawal', {
        body: { withdrawal_id: id, status },
      })
      if (invokeError) throw new Error(invokeError.message)
      if (!data?.success) throw new Error(data?.error ?? 'Action failed')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed')
    } finally {
      setBusy('')
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-5 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-black">DzCoinEren — Withdrawals</h1>
        {error && <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
        <div className="mt-6 space-y-3">
          {rows.map(row => (
            <div key={row.id} className="rounded-2xl border border-white/10 bg-slate-900 p-4">
              <div className="flex justify-between gap-3">
                <b>{row.method}</b>
                <span className="text-sky-400">{row.status}</span>
              </div>
              <p className="mt-2">{Number(row.amount_points).toLocaleString()} DZE · $ {Number(row.amount_usd).toFixed(2)}</p>
              <p className="mt-1 break-all text-xs text-slate-500">{row.destination}</p>
              {row.status === 'pending' && (
                <div className="mt-3 flex gap-2">
                  <button disabled={busy === row.id} onClick={() => setStatus(row.id, 'approved')} className="flex-1 rounded-xl bg-emerald-500 p-2 font-bold text-slate-950 disabled:opacity-50">Approve</button>
                  <button disabled={busy === row.id} onClick={() => setStatus(row.id, 'rejected')} className="flex-1 rounded-xl bg-red-500 p-2 font-bold disabled:opacity-50">Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
