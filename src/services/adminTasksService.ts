import { supabase } from '../lib/supabase'

export interface AdminTask {
  id: string
  title: string
  description: string
  category: string
  reward_points: number
  is_active: boolean
  max_completions_per_user: number | null
  created_at: string
  updated_at: string
}

export async function getAdminTasks() {
  const { data, error } = await supabase.rpc(
    'get_admin_tasks',
  )

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as AdminTask[]
}

export async function createAdminTask(
  title: string,
  description: string,
  category: string,
  rewardPoints: number,
  maxCompletionsPerUser: number | null,
) {
  const { data, error } = await supabase.rpc(
    'create_admin_task',
    {
      p_title: title,
      p_description: description,
      p_category: category,
      p_reward_points: rewardPoints,
      p_max_completions_per_user:
        maxCompletionsPerUser,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateAdminTask(
  taskId: string,
  title: string,
  description: string,
  category: string,
  rewardPoints: number,
  maxCompletionsPerUser: number | null,
) {
  const { data, error } = await supabase.rpc(
    'update_admin_task',
    {
      p_task_id: taskId,
      p_title: title,
      p_description: description,
      p_category: category,
      p_reward_points: rewardPoints,
      p_max_completions_per_user:
        maxCompletionsPerUser,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateAdminTaskStatus(
  taskId: string,
  isActive: boolean,
) {
  const { data, error } = await supabase.rpc(
    'update_admin_task_status',
    {
      p_task_id: taskId,
      p_is_active: isActive,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}
