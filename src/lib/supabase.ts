import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined

// Supabase now recommends the publishable key for browser apps.
// Keep the legacy anon variable as a fallback for compatibility.
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const clientKey = supabasePublishableKey || supabaseAnonKey

/*
 * Do not let a missing Supabase variable crash the whole React bundle.
 * The app can still render, while backend requests fail normally until
 * the Cloudflare Pages variables are configured.
 */
const clientUrl = supabaseUrl || 'https://placeholder.supabase.co'
const safeClientKey = clientKey || 'placeholder-anon-key'

export const supabase = createClient(clientUrl, safeClientKey)

export const isSupabaseConfigured =
  Boolean(supabaseUrl && clientKey)
