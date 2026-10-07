import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const MAX_AUTH_AGE_SECONDS = 24 * 60 * 60

interface TelegramUser {
  id: number
  is_bot: boolean
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
  is_premium?: boolean
}

interface TelegramInitData {
  user?: TelegramUser
  auth_date?: number
  start_param?: string
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function hmacSha256(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  return await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data))
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function validateTelegramInitData(initData: string): Promise<TelegramInitData> {
  if (!TELEGRAM_BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN is not configured')

  const params = new URLSearchParams(initData)
  const receivedHash = params.get('hash')
  if (!receivedHash) throw new Error('Telegram hash is missing')
  params.delete('hash')

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  // Telegram Mini Apps use HMAC-SHA256("WebAppData", bot_token)
  // as the secret key for validating initData.
  const secretKey = await hmacSha256(
    new TextEncoder().encode('WebAppData'),
    TELEGRAM_BOT_TOKEN,
  )
  const calculatedHashBuffer = await hmacSha256(secretKey, dataCheckString)
  const calculatedHash = bytesToHex(new Uint8Array(calculatedHashBuffer))

  if (calculatedHash.toLowerCase() !== receivedHash.toLowerCase()) {
    throw new Error('Invalid Telegram signature')
  }

  const authDateValue = params.get('auth_date')
  if (!authDateValue) throw new Error('Telegram auth_date is missing')

  const authDate = Number(authDateValue)
  if (!Number.isFinite(authDate)) throw new Error('Invalid Telegram auth_date')

  const currentTime = Math.floor(Date.now() / 1000)
  if (currentTime - authDate > MAX_AUTH_AGE_SECONDS) {
    throw new Error('Telegram authentication data has expired')
  }
  if (authDate > currentTime + 60) {
    throw new Error('Invalid Telegram authentication time')
  }

  const userValue = params.get('user')
  let telegramUser: TelegramUser | undefined

  if (userValue) {
    try {
      telegramUser = JSON.parse(userValue)
    } catch {
      throw new Error('Invalid Telegram user data')
    }
  }

  if (!telegramUser || !telegramUser.id) throw new Error('Telegram user is missing')

  return {
    user: telegramUser,
    auth_date: authDate,
    start_param: params.get('start_param') ?? undefined,
  }
}

function normalizeReferralCode(value?: string): string | null {
  if (!value) return null
  const normalized = value.trim()
  if (!normalized) return null
  if (normalized.toLowerCase().startsWith('ref_')) return normalized.substring(4)
  return normalized
}

function makeReferralCode(telegramId: number): string {
  return `TG${telegramId}`
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405)
  }

  try {
    if (!TELEGRAM_BOT_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Server configuration is missing')
    }

    const body = await request.json()
    const initData = body?.initData

    if (typeof initData !== 'string' || !initData.trim()) {
      throw new Error('Telegram initData is required')
    }

    const telegramData = await validateTelegramInitData(initData)
    const telegramUser = telegramData.user!

    const supabaseAdmin = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } },
    )

    const authorization = request.headers.get('Authorization') ?? ''
    const accessToken = authorization.replace(/^Bearer\s+/i, '').trim()
    let authUserId: string | null = null
    if (accessToken) {
      const { data: authData } = await supabaseAdmin.auth.getUser(accessToken)
      authUserId = authData.user?.id ?? null
    }

    const { data: existingUser, error: existingUserError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('telegram_id', telegramUser.id)
      .maybeSingle()

    if (existingUserError) throw new Error(existingUserError.message)

    let appUser = existingUser

    if (appUser) {
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          username: telegramUser.username ?? appUser.username,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name ?? null,
          avatar_url: telegramUser.photo_url ?? null,
          language: telegramUser.language_code ?? appUser.language ?? 'en',
          ...(authUserId ? { auth_user_id: authUserId } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', appUser.id)
        .select('*')
        .single()

      if (updateError) throw new Error(updateError.message)
      appUser = updatedUser
    } else {
      const { data: newUser, error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          telegram_id: telegramUser.id,
          username: telegramUser.username ?? `tg_${telegramUser.id}`,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name ?? null,
          avatar_url: telegramUser.photo_url ?? null,
          language: telegramUser.language_code ?? 'en',
          points_balance: 0,
          usd_equivalent: 0,
          level: 1,
          referral_code: makeReferralCode(telegramUser.id),
          ...(authUserId ? { auth_user_id: authUserId } : {}),
          is_active: true,
        })
        .select('*')
        .single()

      if (insertError) throw new Error(insertError.message)

      appUser = newUser

      const referralCode = normalizeReferralCode(telegramData.start_param)
      if (referralCode) {
        const { data: referralResult, error: referralError } = await supabaseAdmin.rpc(
          'process_referral_by_code',
          { p_referral_code: referralCode, p_referred_id: appUser.id },
        )

        if (referralError) {
          console.error('[DzCoinEren] Referral processing failed', referralError)
        } else {
          console.log('[DzCoinEren] Referral processed', { referralCode, result: referralResult })
        }
      }
    }

    return jsonResponse({
      success: true,
      app_user_id: appUser.id,
      user: {
        id: telegramUser.id,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        username: telegramUser.username,
        language_code: telegramUser.language_code,
        photo_url: telegramUser.photo_url,
        is_premium: telegramUser.is_premium,
      },
    })
  } catch (error) {
    console.error('[DzCoinEren] Telegram auth error', error)
    return jsonResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
    }, 401)
  }
})
