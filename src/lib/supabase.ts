import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/*
 * Cloudflare Pages can build the frontend before runtime environment
 * variables are configured. Do not let a missing Supabase variable
 * crash the entire React bundle and produce a blank page.
 *
 * When the real variables are present, the real Supabase client is used.
 * When they are missing, the app can still render; backend actions will
 * fail normally until the variables are added in Cloudflare Pages.
 */
const clientUrl = supabaseUrl || 'https://placeholder.supabase.co'
const clientKey = supabaseAnonKey || 'placeholder-anon-key'

export const supabase = createClient(clientUrl, clientKey)

export const isSupabaseConfigured =
  Boolean(supabaseUrl && supabaseAnonKey)
