import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ success: false, error: 'Method not allowed' }, 405)

  try {
    const url = Deno.env.get('SUPABASE_URL') ?? ''
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
    if (!url || !key || !token) throw new Error('Unauthorized')

    const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
    const { data: auth, error: authError } = await db.auth.getUser(token)
    if (authError || !auth.user) throw new Error('Unauthorized')

    const body = await req.json()
    const { data, error } = await db.rpc('admin_save_ad_settings', {
      p_admin_auth_user_id: auth.user.id,
      p_provider: String(body?.provider ?? 'AdsGram'),
      p_platform_url: String(body?.platform_url ?? ''),
      p_placement: String(body?.placement ?? ''),
    })

    if (error) throw new Error(error.message)
    return json(data ?? { success: true })
  } catch (e) {
    return json({ success: false, error: e instanceof Error ? e.message : 'Request failed' }, 400)
  }
})
