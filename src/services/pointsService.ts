import { supabase } from '../lib/supabase'

export async function completeTask(
  userId: string,
  taskId: string,
  reward: number,
  description: string
) {
  const { data, error } = await supabase.rpc('complete_task', {
    p_user_id: userId,
    p_task_id: taskId,
    p_reward: reward,
    p_description: description,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}
