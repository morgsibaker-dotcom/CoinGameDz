import { supabase } from '../lib/supabase'

export async function completeTask(
  userId: string,
  taskId: string
) {
  const { data, error } = await supabase.rpc('complete_task', {
    p_user_id: userId,
    p_task_id: taskId,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}
