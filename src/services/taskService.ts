import { supabase } from '../lib/supabase'

export type TaskCategory = 'watch' | 'click' | 'survey' | 'game'

export interface Task {
  id: string
  title: string
  description: string
  category: TaskCategory
  reward_points: number
  max_completions_per_user: number | null
  completion_count: number
  completed: boolean
}

export async function getActiveTasks(): Promise<Task[]> {
  const { data, error } = await supabase.rpc('get_active_tasks')
  if (error) throw new Error(error.message)
  return (data ?? []) as Task[]
}

export async function completeTask(taskId: string, userId: string) {
  const { data, error } = await supabase.rpc('complete_task', {
    p_task_id: taskId,
  })

  if (error) throw new Error(error.message)
  if (!data?.success) throw new Error(data?.error ?? 'Task completion failed')

  return {
    pointsAwarded: Number(data.points_awarded ?? 0),
    pointsBalance: Number(data.points_balance ?? 0),
  }
}
