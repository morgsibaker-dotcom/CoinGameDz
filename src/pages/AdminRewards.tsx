import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Pencil,
  Power,
} from 'lucide-react'
import {
  getAdminRewards,
  createAdminReward,
  updateAdminReward,
  updateAdminRewardStatus,
  AdminReward,
} from '../services/adminRewardsService'

interface RewardForm {
  title: string
  description: string
  rewardType: string
  pointsReward: string
}

const emptyForm: RewardForm = {
  title: '',
  description: '',
  rewardType: 'gift',
  pointsReward: '10',
}

export default function AdminRewards() {
  const navigate = useNavigate()

  const [rewards, setRewards] = useState<AdminReward[]>([])
  const [form, setForm] = useState<RewardForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadRewards() {
    try {
      setLoading(true)
      setError('')

      const data = await getAdminRewards()
      setRewards(data)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to load rewards',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRewards()
  }, [])

  function openCreateForm() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
    setError('')
    setMessage('')
  }

  function openEditForm(reward: AdminReward) {
    setEditingId(reward.id)

    setForm({
      title: reward.title,
      description: reward.description,
      rewardType: reward.reward_type,
      pointsReward: String(reward.points_reward),
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

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')
      setMessage('')

      const points = Number(form.pointsReward)

      if (!form.title.trim()) {
        throw new Error('Reward title is required')
      }

      if (!Number.isFinite(points) || points < 0) {
        throw new Error('Invalid reward points')
      }

      if (editingId) {
        await updateAdminReward(
          editingId,
          form.title,
          form.description,
          form.rewardType,
          points,
        )

        setMessage('Reward updated successfully.')
      } else {
        await createAdminReward(
          form.title,
          form.description,
          form.rewardType,
          points,
        )

        setMessage('Reward created successfully.')
      }

      closeForm()
      await loadRewards()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to save reward',
      )
    } finally {
      setSaving(false)
    }
  }

  async function toggleStatus(reward: AdminReward) {
    try {
      setUpdatingId(reward.id)
      setError('')
      setMessage('')

      await updateAdminRewardStatus(
        reward.id,
        !reward.is_active,
      )

      setRewards((current) =>
        current.map((item) =>
          item.id === reward.id
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
          : 'Failed to update reward status',
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
              Rewards Management
            </h1>

            <p className="text-sm text-slate-400">
              Create and manage user rewards
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-500"
          >
            <Plus size={18} />
            Add Reward
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
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
                ? 'Edit Reward'
                : 'Create Reward'}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="mt-5 grid gap-4 md:grid-cols-2"
            >
              <input
                value={form.title}
                onChange={(event) =>
                  setForm({
                    ...form,
                    title: event.target.value,
                  })
                }
                placeholder="Reward title"
                required
                className="rounded-xl bg-slate-800 px-4 py-3 outline-none"
              />

              <select
                value={form.rewardType}
                onChange={(event) =>
                  setForm({
                    ...form,
                    rewardType: event.target.value,
                  })
                }
                className="rounded-xl bg-slate-800 px-4 py-3 outline-none"
              >
                <option value="welcome">Welcome</option>
                <option value="daily">Daily</option>
                <option value="streak">Streak</option>
                <option value="gift">Gift</option>
                <option value="achievement">
                  Achievement
                </option>
              </select>

              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    description: event.target.value,
                  })
                }
                placeholder="Reward description"
                className="min-h-[110px] rounded-xl bg-slate-800 px-4 py-3 outline-none md:col-span-2"
              />

              <input
                type="number"
                min="0"
                value={form.pointsReward}
                onChange={(event) =>
                  setForm({
                    ...form,
                    pointsReward: event.target.value,
                  })
                }
                placeholder="Points reward"
                required
                className="rounded-xl bg-slate-800 px-4 py-3 outline-none"
              />

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Save Changes'
                      : 'Create Reward'}
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
            Loading rewards...
          </div>
        ) : rewards.length === 0 ? (
          <div className="rounded-2xl bg-slate-900 p-8 text-center text-slate-400">
            No rewards found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
            <table className="w-full min-w-[950px] text-left">
              <thead className="border-b border-slate-800">
                <tr className="text-sm text-slate-400">
                  <th className="px-4 py-4">Reward</th>
                  <th className="px-4 py-4">Type</th>
                  <th className="px-4 py-4">Points</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {rewards.map((reward) => (
                  <tr
                    key={reward.id}
                    className="border-b border-slate-800 last:border-0"
                  >
                    <td className="px-4 py-4">
                      <div className="font-semibold">
                        {reward.title}
                      </div>

                      <div className="max-w-[400px] text-sm text-slate-400">
                        {reward.description}
                      </div>
                    </td>

                    <td className="px-4 py-4 uppercase">
                      {reward.reward_type}
                    </td>

                    <td className="px-4 py-4 font-semibold">
                      {Number(
                        reward.points_reward,
                      ).toLocaleString()}{' '}
                      pts
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={
                          reward.is_active
                            ? 'text-emerald-400'
                            : 'text-red-400'
                        }
                      >
                        {reward.is_active
                          ? 'Active'
                          : 'Disabled'}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(reward)
                          }
                          className="rounded-xl bg-slate-800 p-3 hover:bg-slate-700"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          type="button"
                          disabled={
                            updatingId === reward.id
                          }
                          onClick={() =>
                            toggleStatus(reward)
                          }
                          className={`rounded-xl p-3 ${
                            reward.is_active
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
