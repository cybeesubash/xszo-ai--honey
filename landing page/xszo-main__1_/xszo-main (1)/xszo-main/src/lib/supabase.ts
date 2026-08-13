import { createClient } from '@supabase/supabase-js'

// Check if we're in demo mode
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || !import.meta.env.VITE_SUPABASE_ANON_KEY

// Demo credentials for local development
const DEMO_USERS = [
  { email: 'admin@xzso.ai', password: 'admin123', role: 'admin' },
  { email: 'user@xzso.ai', password: 'user123', role: 'user' },
  { email: 'demo@xzso.ai', password: 'demo123', role: 'demo' }
]

// Supabase configuration (only used if not in demo mode)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key'

// Create Supabase client (will be null in demo mode)
export const supabase = isDemoMode ? null : createClient(supabaseUrl, supabaseAnonKey)

// Auth helper functions
export const auth = {
  // Sign up new user
  async signUp(email: string, password: string) {
    if (isDemoMode) {
      // Demo mode: just return success for any valid email format
      if (email.includes('@')) {
        return { 
          data: { 
            user: { id: 'demo-' + Date.now(), email }, 
            session: { access_token: 'demo-token' } 
          }, 
          error: null 
        }
      }
      return { data: null, error: { message: 'Invalid email format' } }
    }
    
    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
    })
    return { data, error }
  },

  // Sign in user  
  async signIn(email: string, password: string) {
    if (isDemoMode) {
      // Demo mode: check against predefined users
      const user = DEMO_USERS.find(u => u.email === email && u.password === password)
      if (user) {
        return { 
          data: { 
            user: { id: user.role + '-demo', email: user.email }, 
            session: { access_token: 'demo-token-' + user.role } 
          }, 
          error: null 
        }
      }
      return { data: null, error: { message: 'Invalid credentials' } }
    }

    const { data, error } = await supabase!.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Sign out user
  async signOut() {
    if (isDemoMode) {
      return { error: null }
    }
    
    const { error } = await supabase!.auth.signOut()
    return { error }
  },

  // Get current user
  async getUser() {
    if (isDemoMode) {
      return { id: 'demo-user', email: 'demo@xzso.ai' }
    }
    
    const { data: { user } } = await supabase!.auth.getUser()
    return user
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (isDemoMode) {
      // Demo mode: return a dummy unsubscribe function
      return { data: { subscription: { unsubscribe: () => {} } } }
    }
    
    return supabase!.auth.onAuthStateChange(callback)
  }
}

// Database helper functions
export const db = {
  // Save user profile
  async saveProfile(userId: string, profile: any) {
    if (isDemoMode) {
      // Demo mode: just return success
      return { data: { id: userId, ...profile }, error: null }
    }
    
    const { data, error } = await supabase!
      .from('profiles')
      .upsert({ id: userId, ...profile })
    return { data, error }
  },

  // Get user profile
  async getProfile(userId: string) {
    if (isDemoMode) {
      // Demo mode: return default profile
      return { 
        data: { 
          id: userId, 
          name: 'Demo User', 
          role: 'demo',
          created_at: new Date().toISOString()
        }, 
        error: null 
      }
    }
    
    const { data, error } = await supabase!
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  }
}

// Export demo mode status for other components
export const demoMode = isDemoMode
export const demoCredentials = isDemoMode ? DEMO_USERS : []

export default supabase