import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Pencil,
  Power,
} from 'lucide-react'
import {
  getAdminWheelPrizes,
  createAdminWheelPrize,
  updateAdminWheelPrize,
  updateAdminWheelPrizeStatus,
  AdminWheelPrize,
} from '../services/adminWheelService'

interface PrizeForm {
  label: string
  points: string
  probability: string
}

const emptyForm: PrizeForm = {
  label: '',
  points: '0',
  probability: '10',
}

export default function AdminWheel() {
  const navigate = useNavigate()

  const [prizes, setPrizes] = useState<AdminWheelPrize[]>([])
  const [form, setForm] = useState<PrizeForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadPrizes() {
    try {
      setLoading(true)
      setError('')

      const data = await getAdminWheelPrizes()
      setPrizes(data)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to load wheel prizes',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPrizes()
  }, [])

  function openCreateForm() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
    setError('')
    setMessage('')
  }

  function openEditForm(prize: AdminWheelPrize) {
    setEditingId(prize.id)

    setForm({
      label: prize.label,
      points: String(prize.points),
      probability: String(prize.probability),
    })

    setShowForm(true)
    setError('')
    setMessage('')
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const activeProbabilityTotal = prizes
    .filter((item) => item.is_active)
    .reduce(
      (total, item) =>
        total + Number(item.probability),
      0,
    )

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')
      setMessage('')

      const points = Number(form.points)
      const probability = Number(form.probability)

      if (points > 0 && !form.label.trim()) {
        throw new Error('Prize label is required for a reward')
      }

      if (!Number.isFinite(points) || points < 0) {
        throw new Error('Invalid points')
      }

      if (
        !Number.isFinite(probability) ||
        probability < 0
      ) {
        throw new Error('Invalid probability')
      }

      if (editingId) {
        await updateAdminWheelPrize(
          editingId,
          form.label,
          points,
          probability,
        )

        setMessage('Wheel prize updated successfully.')
      } else {
        await createAdminWheelPrize(
          form.label,
          points,
          probability,
        )

        setMessage('Wheel prize created successfully.')
      }

      closeForm()
      await loadPrizes()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to save wheel prize',
      )
    } finally {
      setSaving(false)
    }
  }

  async function toggleStatus(
    prize: AdminWheelPrize,
  ) {
    try {
      setUpdatingId(prize.id)
      setError('')
      setMessage('')

      await updateAdminWheelPrizeStatus(
        prize.id,
        !prize.is_active,
      )

      setPrizes((current) =>
        current.map((item) =>
          item.id === prize.id
            ? {
                ...item,
                is_active: !item.is_active,
              }
            : item,
        ),
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to update prize status',
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
              Wheel Management
            </h1>

            <p className="text-sm text-slate-400">
              Manage prizes and probabilities
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-500"
          >
            <Plus size={18} />
            Add Prize
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="text-sm text-slate-400">
            Active probability total
          </div>

          <div
            className={`mt-1 text-2xl font-bold ${
              Math.abs(activeProbabilityTotal - 100) <
              0.001
                ? 'text-emerald-400'
                : 'text-amber-400'
            }`}
          >
            {activeProbabilityTotal.toFixed(2)}%
          </div>

          {Math.abs(activeProbabilityTotal - 100) >=
            0.001 && (
            <p className="mt-2 text-sm text-amber-400">
              Active probabilities should total 100%.
            </p>
          )}
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {showForm && (
          <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">
              {editingId
                ? 'Edit Wheel Prize'
                : 'Create Wheel Prize'}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="mt-5 grid gap-4 md:grid-cols-3"
            >
              <input
                value={form.label}
                onChange={(event) =>
                  setForm({
                    ...form,
                    label: event.target.value,
                  })
                }
                placeholder="Prize label (leave empty for 😔)"
                className="rounded-xl bg-slate-800 px-4 py-3 outline-none"
              />

              <input
                type="number"
                min="0"
                value={form.points}
                onChange={(event) =>
                  setForm({
                    ...form,
                    points: event.target.value,
                  })
                }
                placeholder="Points"
                required
                className="rounded-xl bg-slate-800 px-4 py-3 outline-none"
              />

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.probability}
                onChange={(event) =>
                  setForm({
                    ...form,
                    probability: event.target.value,
                  })
                }
                placeholder="Probability %"
                required
                className="rounded-xl bg-slate-800 px-4 py-3 outline-none"
              />

              <div className="flex gap-3 md:col-span-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Save Changes'
                      : 'Create Prize'}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl bg-slate-800 px-5 py-3"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {loading ? (
          <div className="rounded-2xl bg-slate-900 p-8 text-center text-slate-400">
            Loading wheel prizes...
          </div>
        ) : prizes.length === 0 ? (
          <div className="rounded-2xl bg-slate-900 p-8 text-center text-slate-400">
            No wheel prizes found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
            <table className="w-full min-w-[850px] text-left">
              <thead className="border-b border-slate-800">
                <tr className="text-sm text-slate-400">
                  <th className="px-4 py-4">Prize</th>
                  <th className="px-4 py-4">Points</th>
                  <th className="px-4 py-4">Probability</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {prizes.map((prize) => (
                  <tr
                    key={prize.id}
                    className="border-b border-slate-800 last:border-0"
                  >
                    <td className="px-4 py-4 font-semibold">
                      {prize.points === 0 ? '😔' : prize.label}
                    </td>

                    <td className="px-4 py-4">
                      {Number(prize.points).toLocaleString()} pts
                    </td>

                    <td className="px-4 py-4">
                      {Number(prize.probability).toFixed(2)}%
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={
                          prize.is_active
                            ? 'text-emerald-400'
                            : 'text-red-400'
                        }
                      >
                        {prize.is_active
                          ? 'Active'
                          : 'Disabled'}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(prize)
                          }
                          className="rounded-xl bg-slate-800 p-3 hover:bg-slate-700"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          type="button"
                          disabled={
                            updatingId === prize.id
                          }
                          onClick={() =>
                            toggleStatus(prize)
                          }
                          className={`rounded-xl p-3 ${
                            prize.is_active
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-emerald-500/10 text-emerald-400'
                          } disabled:opacity-50`}
                        >
                          <Power size={18} />
                        </button>
                      </div>
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
