import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import {
  getAdminWithdrawals,
  updateWithdrawalStatus,
  AdminWithdrawal,
} from '../services/adminWithdrawalsService'

export default function AdminWithdrawals() {
  const navigate = useNavigate()

  const [withdrawals, setWithdrawals] = useState<
    AdminWithdrawal[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(
    null,
  )

  async function loadWithdrawals() {
    try {
      setLoading(true)
      setError('')

      const data = await getAdminWithdrawals()
      setWithdrawals(data)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to load withdrawals',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWithdrawals()
  }, [])

  async function changeStatus(
    id: string,
    status: string,
  ) {
    try {
      setUpdatingId(id)
      setError('')

      await updateWithdrawalStatus(id, status)

      setWithdrawals((items) =>
        items.map((item) =>
          item.id === id
            ? { ...item, status }
            : item,
        ),
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to update status',
      )
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900 px-4 py-4">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="rounded-xl bg-slate-800 p-3 hover:bg-slate-700"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              Withdrawal Requests
            </h1>
            <p className="text-sm text-slate-400">
              Manage user withdrawal requests
            </p>
          </div>

          <button
            type="button"
            onClick={loadWithdrawals}
            className="rounded-xl bg-slate-800 p-3 hover:bg-slate-700"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl bg-slate-900 p-8 text-center text-slate-400">
            Loading withdrawals...
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="rounded-2xl bg-slate-900 p-8 text-center text-slate-400">
            No withdrawal requests.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="border-b border-slate-800">
                <tr className="text-sm text-slate-400">
                  <th className="px-4 py-4">User</th>
                  <th className="px-4 py-4">Amount</th>
                  <th className="px-4 py-4">Method</th>
                  <th className="px-4 py-4">Account</th>
                  <th className="px-4 py-4">Date</th>
                  <th className="px-4 py-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {withdrawals.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-800 last:border-0"
                  >
                    <td className="px-4 py-4">
                      <div className="font-semibold">
                        @{item.username ?? 'no_username'}
                      </div>
                      <div className="text-sm text-slate-500">
                        {item.telegram_id}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-semibold">
                        {Number(
                          item.amount_points,
                        ).toLocaleString()}{' '}
                        points
                      </div>
                      <div className="text-sm text-emerald-400">
                        ${Number(
                          item.amount_usd,
                        ).toFixed(2)}
                      </div>
                    </td>

                    <td className="px-4 py-4 uppercase">
                      {item.method}
                    </td>

                    <td className="max-w-[250px] px-4 py-4 text-sm text-slate-400">
                      {Object.entries(
                        item.account_details ?? {},
                      )
                        .map(
                          ([key, value]) =>
                            `${key}: ${String(value)}`,
                        )
                        .join(' | ') || '—'}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-400">
                      {new Date(
                        item.created_at,
                      ).toLocaleString()}
                    </td>

                    <td className="px-4 py-4">
                      <select
                        value={item.status}
                        disabled={
                          updatingId === item.id
                        }
                        onChange={(event) =>
                          changeStatus(
                            item.id,
                            event.target.value,
                          )
                        }
                        className="rounded-xl bg-slate-800 px-3 py-2 text-sm outline-none"
                      >
                        <option value="pending">
                          Pending
                        </option>
                        <option value="processing">
                          Processing
                        </option>
                        <option value="completed">
                          Completed
                        </option>
                        <option value="rejected">
                          Rejected
                        </option>
                      </select>
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
