import { createClient } from '@supabase/supabase-js'

// Supabase credentials are loaded from Vite env vars when available.
// Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env for local development.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pfjkuypvxlcrvwgwvtif.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmanV5cHZ4bGNydndnd3Z0aWYiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNDAxMTgwMywiZXhwIjoyMDQ5NTg3ODAzfQ.sb_publishable_t7vaE3o3r1wnf1YNVXg0ow__aG2J1o'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration: please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helper functions
export const auth = {
  // Sign up new user
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  },

  // Sign in user
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  async getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helper functions
export const db = {
  // Save user profile
  async saveProfile(userId: string, profile: any) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...profile })
    return { data, error }
  },

  // Get user profile
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  }
}

export default supabase