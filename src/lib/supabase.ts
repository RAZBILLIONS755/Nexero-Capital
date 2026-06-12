/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js/dist/index.mjs'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check Cloudflare Pages settings.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)