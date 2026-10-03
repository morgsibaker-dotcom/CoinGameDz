import { createClient } from '@supabase/supabase-js'

/*
 * Version 3: keep the public Supabase project URL in the frontend code.
 * The URL is not a secret. The browser key remains supplied by Cloudflare.
 */
export const supabaseUrl = 'https://ozuastidpblufoegekbp.supabase.co'

const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseKey = supabasePublishableKey || supabaseAnonKey

const safeClientKey = supabaseKey || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, safeClientKey)

export const isSupabaseConfigured = Boolean(supabaseKey)
