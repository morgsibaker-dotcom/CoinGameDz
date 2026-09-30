
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

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')

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

    return new Response(
      JSON.stringify({
        success: true,
        user: telegramUser,
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
