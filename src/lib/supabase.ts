/// <reference types="vite/client" />

// We are using the global `supabase` variable from the CDN script
// @ts-ignore
const supabaseGlobal: any = window.supabase

// Debug logs
console.log('Supabase debug: window.supabase =', supabaseGlobal)
console.log('Supabase debug: window =', window)

if (!supabaseGlobal) {
  throw new Error('Supabase not loaded. Check the CDN script in index.html.')
}

const { createClient } = supabaseGlobal

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check Cloudflare Pages settings.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)