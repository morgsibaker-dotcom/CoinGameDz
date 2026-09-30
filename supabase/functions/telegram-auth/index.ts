const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

async function hmacSha256(
  key: ArrayBuffer,
  data: string,
): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    {
      name: 'HMAC',
      hash: 'SHA-256',
    },
    false,
    ['sign'],
  )

  return crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    new TextEncoder().encode(data),
  )
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function validateTelegramInitData(
  initData: string,
  botToken: string,
): Promise<Record<string, string>> {
  const params = new URLSearchParams(initData)

  const receivedHash = params.get('hash')

  if (!receivedHash) {
    throw new Error('Missing Telegram hash')
  }

  const authDate = params.get('auth_date')

  if (!authDate) {
    throw new Error('Missing Telegram auth_date')
  }

  const authTimestamp = Number(authDate)

  if (!Number.isFinite(authTimestamp)) {
    throw new Error('Invalid Telegram auth_date')
  }

  const now = Math.floor(Date.now() / 1000)
  const maxAge = 24 * 60 * 60

  if (Math.abs(now - authTimestamp) > maxAge) {
    throw new Error('Telegram authentication data expired')
  }

  params.delete('hash')

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  const secretKey = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(botToken),
  )

  const calculatedHash = toHex(
    await hmacSha256(
      secretKey,
      dataCheckString,
    ),
  )

  if (calculatedHash !== receivedHash) {
    throw new Error('Invalid Telegram initData')
  }

  return Object.fromEntries(params.entries())
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({
          error: 'Method not allowed',
        }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      )
    }

    const { initData } = await req.json()

    if (!initData || typeof initData !== 'string') {
      return new Response(
        JSON.stringify({
          error: 'Missing initData',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      )
    }

    const botToken =
      Deno.env.get('TELEGRAM_BOT_TOKEN')

    if (!botToken) {
      throw new Error(
        'TELEGRAM_BOT_TOKEN secret is not configured',
      )
    }

    const validatedData =
      await validateTelegramInitData(
        initData,
        botToken,
      )

    const userJson = validatedData.user

    if (!userJson) {
      throw new Error(
        'Telegram user data not found',
      )
    }

    const telegramUser = JSON.parse(userJson)

    if (!telegramUser.id || !telegramUser.first_name) {
      throw new Error(
        'Invalid Telegram user data',
      )
    }

    const referralCode =
      validatedData.start_param ?? null

    const supabaseUrl =
      Deno.env.get('SUPABASE_URL')

    const serviceRoleKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        'Supabase server credentials are not configured',
      )
    }

    const existingResponse = await fetch(
      `${supabaseUrl}/rest/v1/users?telegram_id=eq.${telegramUser.id}&select=id,telegram_id`,
      {
        method: 'GET',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      },
    )

    if (!existingResponse.ok) {
      const errorText =
        await existingResponse.text()

      throw new Error(
        `Failed to check existing user: ${errorText}`,
      )
    }

    const existingUsers =
      await existingResponse.json()

    const isNewUser =
      !existingUsers?.length

    const response = await fetch(
      `${supabaseUrl}/rest/v1/users?on_conflict=telegram_id`,
      {
        method: 'POST',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          Prefer:
            'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify({
          telegram_id: telegramUser.id,
          username: telegramUser.username ?? null,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name ?? null,
          language:
            telegramUser.language_code ?? 'en',
          avatar_url:
            telegramUser.photo_url ?? null,
        }),
      },
    )

    if (!response.ok) {
      const errorText =
        await response.text()

      throw new Error(
        `Failed to register user: ${errorText}`,
      )
    }

    const users = await response.json()
    const user = users?.[0]

    if (!user) {
      throw new Error(
        'User registration returned no data',
      )
    }

    if (isNewUser && referralCode) {
      const referralResponse = await fetch(
        `${supabaseUrl}/rest/v1/rpc/process_referral_by_code`,
        {
          method: 'POST',
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            p_referral_code: referralCode,
            p_referred_id: user.id,
          }),
        },
      )

      if (!referralResponse.ok) {
        console.error(
          '[CoinGameDz] Referral processing failed',
          await referralResponse.text(),
        )
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: telegramUser,
        databaseUser: user,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Authentication failed',
      }),
      {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  }
})
