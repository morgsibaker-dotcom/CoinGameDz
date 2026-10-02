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
}

async function adminId() {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) throw new Error('Admin session not found')
  return data.user.id
}

export async function getAdminTasks() {
  const id = await adminId()
  const { data, error } = await supabase.rpc('admin_list_tasks', {
    p_admin_auth_user_id: id,
  })
  if (error) throw new Error(error.message)
  return (data ?? []) as AdminTask[]
}

export async function createAdminTask(
  title: string,
  description: string,
  category: string,
  rewardPoints: number,
  maxCompletionsPerUser: number | null,
) {
  const id = await adminId()
  const { data, error } = await supabase.rpc('admin_upsert_task', {
    p_admin_auth_user_id: id,
    p_task_id: null,
    p_title: title,
    p_description: description,
    p_category: category,
    p_reward_points: rewardPoints,
    p_max_completions_per_user: maxCompletionsPerUser,
    p_is_active: true,
  })
  if (error) throw new Error(error.message)
  if (!data?.success) throw new Error(data?.error ?? 'Task creation failed')
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
  const id = await adminId()
  const { data, error } = await supabase.rpc('admin_upsert_task', {
    p_admin_auth_user_id: id,
    p_task_id: taskId,
    p_title: title,
    p_description: description,
    p_category: category,
    p_reward_points: rewardPoints,
    p_max_completions_per_user: maxCompletionsPerUser,
    p_is_active: true,
  })
  if (error) throw new Error(error.message)
  if (!data?.success) throw new Error(data?.error ?? 'Task update failed')
  return data
}

export async function updateAdminTaskStatus(
  taskId: string,
  isActive: boolean,
) {
  const id = await adminId()
  const { data, error } = await supabase.rpc('admin_set_task_active', {
    p_admin_auth_user_id: id,
    p_task_id: taskId,
    p_is_active: isActive,
  })
  if (error) throw new Error(error.message)
  if (!data?.success) throw new Error(data?.error ?? 'Task status update failed')
  return data
}
