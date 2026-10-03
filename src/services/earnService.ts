import { supabase, isSupabaseConfigured } from '../lib/supabase'

export type EarnAction = 'tap' | 'daily_checkin' | 'task' | 'ad'

export async function awardPoints(
  action: EarnAction,
  extra?: { provider_event_id?: string; provider?: string },
) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured in the deployed app.')
  }

  // Make sure the Edge Function receives the current authenticated
  // Supabase session instead of relying on a stale/missing token.
  let { data: sessionData, error: sessionError } =
    await supabase.auth.getSession()

  if (sessionError) {
    throw new Error(`Supabase session error: ${sessionError.message}`)
  }

  if (!sessionData.session) {
    const { data: refreshData, error: refreshError } =
      await supabase.auth.refreshSession()

    if (refreshError) {
      throw new Error(
        'No active Supabase session. Please reopen the Telegram Mini App and try again.',
      )
    }

    sessionData = refreshData
  }

  if (!sessionData.session) {
    throw new Error(
      'No active Supabase session. Please reopen the Telegram Mini App and try again.',
    )
  }

  const { data, error } = await supabase.functions.invoke('earn-points', {
    body: { action, ...extra },
    headers: {
      Authorization: `Bearer ${sessionData.session.access_token}`,
    },
  })

  if (error) {
    const context =
      typeof error.context === 'object' &&
      error.context !== null &&
      'status' in error.context
        ? ` (HTTP ${String((error.context as { status?: unknown }).status ?? '')})`
        : ''

    throw new Error(
      `earn-points request failed${context}: ${error.message}`,
    )
  }

  if (!data?.success) {
    throw new Error(data?.error ?? 'Reward failed')
  }

  return {
    points: Number(data.points_balance),
    usdEquivalent: Number(data.usd_equivalent),
  }
}
