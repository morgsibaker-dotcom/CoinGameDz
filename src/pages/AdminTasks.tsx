import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Pencil,
  Power,
} from 'lucide-react'
import {
  getAdminTasks,
  createAdminTask,
  updateAdminTask,
  updateAdminTaskStatus,
  AdminTask,
} from '../services/adminTasksService'

interface TaskForm {
  title: string
  description: string
  category: string
  rewardPoints: string
  maxCompletions: string
}

const emptyForm: TaskForm = {
  title: '',
  description: '',
  category: 'click',
  rewardPoints: '10',
  maxCompletions: '1',
}

export default function AdminTasks() {
  const navigate = useNavigate()

  const [tasks, setTasks] = useState<AdminTask[]>([])
  const [form, setForm] = useState<TaskForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] =
    useState<string | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadTasks() {
    try {
      setLoading(true)
      setError('')

      const data = await getAdminTasks()
      setTasks(data)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to load tasks',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  function openCreateForm() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
    setError('')
    setMessage('')
  }

  function openEditForm(task: AdminTask) {
    setEditingId(task.id)

    setForm({
      title: task.title,
      description: task.description,
      category: task.category,
      rewardPoints: String(task.reward_points),
      maxCompletions:
        task.max_completions_per_user === null
          ? ''
          : String(task.max_completions_per_user),
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

      const rewardPoints = Number(form.rewardPoints)

      const maxCompletions =
        form.maxCompletions.trim() === ''
          ? null
          : Number(form.maxCompletions)

      if (!form.title.trim()) {
        throw new Error('Task title is required')
      }

      if (
        !Number.isFinite(rewardPoints) ||
        rewardPoints < 0
      ) {
        throw new Error('Invalid reward points')
      }

      if (
        maxCompletions !== null &&
        (!Number.isFinite(maxCompletions) ||
          maxCompletions < 1)
      ) {
        throw new Error(
          'Invalid maximum completions',
        )
      }

      if (editingId) {
        await updateAdminTask(
          editingId,
          form.title,
          form.description,
          form.category,
          rewardPoints,
          maxCompletions,
        )

        setMessage('Task updated successfully.')
      } else {
        await createAdminTask(
          form.title,
          form.description,
          form.category,
          rewardPoints,
          maxCompletions,
        )

        setMessage('Task created successfully.')
      }

      closeForm()
      await loadTasks()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to save task',
      )
    } finally {
      setSaving(false)
    }
  }

  async function toggleStatus(task: AdminTask) {
    try {
      setUpdatingId(task.id)
      setError('')
      setMessage('')

      await updateAdminTaskStatus(
        task.id,
        !task.is_active,
      )

      setTasks((current) =>
        current.map((item) =>
          item.id === task.id
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
          : 'Failed to update task status',
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
              Tasks Management
            </h1>

            <p className="text-sm text-slate-400">
              Create and manage earning tasks
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-500"
          >
            <Plus size={18} />
            Add Task
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
                ? 'Edit Task'
                : 'Create Task'}
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
                placeholder="Task title"
                required
                className="rounded-xl bg-slate-800 px-4 py-3 outline-none"
              />

              <select
                value={form.category}
                onChange={(event) =>
                  setForm({
                    ...form,
                    category: event.target.value,
                  })
                }
                className="rounded-xl bg-slate-800 px-4 py-3 outline-none"
              >
                <option value="click">Click</option>
                <option value="watch">Watch</option>
                <option value="survey">Survey</option>
                <option value="game">Game</option>
              </select>

              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    description: event.target.value,
                  })
                }
                placeholder="Task description"
                className="min-h-[110px] rounded-xl bg-slate-800 px-4 py-3 outline-none md:col-span-2"
              />

              <input
                type="number"
                min="0"
                value={form.rewardPoints}
                onChange={(event) =>
                  setForm({
                    ...form,
                    rewardPoints: event.target.value,
                  })
                }
                placeholder="Reward points"
                required
                className="rounded-xl bg-slate-800 px-4 py-3 outline-none"
              />

              <input
                type="number"
                min="1"
                value={form.maxCompletions}
                onChange={(event) =>
                  setForm({
                    ...form,
                    maxCompletions:
                      event.target.value,
                  })
                }
                placeholder="Max completions per user"
                className="rounded-xl bg-slate-800 px-4 py-3 outline-none"
              />

              <div className="flex gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Save Changes'
                      : 'Create Task'}
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
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl bg-slate-900 p-8 text-center text-slate-400">
            No tasks found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="border-b border-slate-800">
                <tr className="text-sm text-slate-400">
                  <th className="px-4 py-4">Task</th>
                  <th className="px-4 py-4">Category</th>
                  <th className="px-4 py-4">Reward</th>
                  <th className="px-4 py-4">Limit</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-slate-800 last:border-0"
                  >
                    <td className="px-4 py-4">
                      <div className="font-semibold">
                        {task.title}
                      </div>

                      <div className="max-w-[350px] text-sm text-slate-400">
                        {task.description}
                      </div>
                    </td>

                    <td className="px-4 py-4 uppercase">
                      {task.category}
                    </td>

                    <td className="px-4 py-4 font-semibold">
                      {Number(
                        task.reward_points,
                      ).toLocaleString()}{' '}
                      pts
                    </td>

                    <td className="px-4 py-4">
                      {task.max_completions_per_user ??
                        'Unlimited'}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={
                          task.is_active
                            ? 'text-emerald-400'
                            : 'text-red-400'
                        }
                      >
                        {task.is_active
                          ? 'Active'
                          : 'Disabled'}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(task)
                          }
                          className="rounded-xl bg-slate-800 p-3 hover:bg-slate-700"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          type="button"
                          disabled={
                            updatingId === task.id
                          }
                          onClick={() =>
                            toggleStatus(task)
                          }
                          className={`rounded-xl p-3 ${
                            task.is_active
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-emerald-500/10 text-emerald-400'
                          } disabled:opacity-50`}
                          title={
                            task.is_active
                              ? 'Disable'
                              : 'Enable'
                          }
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
