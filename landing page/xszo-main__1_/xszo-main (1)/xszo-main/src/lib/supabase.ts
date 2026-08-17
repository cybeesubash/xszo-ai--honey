import { createClient } from '@supabase/supabase-js'

// Check if we're in demo mode
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || !import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🎭 XZSO Auth Debug:', {
  VITE_DEMO_MODE: import.meta.env.VITE_DEMO_MODE,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
  isDemoMode,
  timestamp: new Date().toISOString()
});

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
      // Demo mode: Allow creating new accounts (stored in localStorage)
      if (!email.includes('@')) {
        return { data: null, error: { message: 'Invalid email format' } };
      }
      
      if (password.length < 6) {
        return { data: null, error: { message: 'Password must be at least 6 characters' } };
      }
      
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('demo_users') || '[]');
      if (existingUsers.find((u: any) => u.email === email)) {
        return { data: null, error: { message: 'Email already registered. Please sign in.' } };
      }
      
      // Create new user
      const newUser = {
        id: 'user-' + Date.now(),
        email,
        password, // In real app, this would be hashed!
        role: 'user',
        createdAt: new Date().toISOString()
      };
      
      existingUsers.push(newUser);
      localStorage.setItem('demo_users', JSON.stringify(existingUsers));
      
      console.log('✅ Demo sign up successful for:', email);
      
      return { 
        data: { 
          user: { id: newUser.id, email: newUser.email }, 
          session: null // No auto-login on sign up
        }, 
        error: null 
      };
    }
    
    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
    })
    return { data, error }
  },

  // Sign in user  
  async signIn(email: string, password: string) {
    console.log('🔐 Login attempt:', { email, password: '***', isDemoMode });
    
    if (isDemoMode) {
      // Demo mode: check against predefined users AND custom users
      console.log('🎭 Demo mode active');
      
      // Check custom users first (from sign up)
      const customUsers = JSON.parse(localStorage.getItem('demo_users') || '[]');
      const customUser = customUsers.find((u: any) => u.email === email && u.password === password);
      
      if (customUser) {
        console.log('✅ Custom user login successful for:', customUser.email);
        
        // Create a session token
        const sessionData = {
          userId: customUser.id,
          email: customUser.email,
          role: customUser.role,
          expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };
        localStorage.setItem('demo_session_token', JSON.stringify(sessionData));
        
        return { 
          data: { 
            user: { id: customUser.id, email: customUser.email }, 
            session: { access_token: 'demo-token-' + customUser.id } 
          }, 
          error: null 
        };
      }
      
      // Check predefined demo users
      console.log('Checking predefined users:', DEMO_USERS.map(u => u.email));
      const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
      
      if (demoUser) {
        console.log('✅ Demo login successful for:', demoUser.email);
        
        // Create a session token
        const sessionData = {
          userId: demoUser.role + '-demo',
          email: demoUser.email,
          role: demoUser.role,
          expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };
        localStorage.setItem('demo_session_token', JSON.stringify(sessionData));
        
        return { 
          data: { 
            user: { id: demoUser.role + '-demo', email: demoUser.email }, 
            session: { access_token: 'demo-token-' + demoUser.role } 
          }, 
          error: null 
        };
      }
      
      console.log('❌ Login failed - credentials not found');
      return { 
        data: null, 
        error: { message: 'Invalid email or password. Try: admin@xzso.ai/admin123' } 
      };
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
      // Clear demo session
      localStorage.removeItem('demo_session_token');
      return { error: null }
    }
    
    const { error } = await supabase!.auth.signOut()
    return { error }
  },

  // Get current user
  async getUser() {
    if (isDemoMode) {
      // In demo mode, check if there's actually a logged-in session
      // Don't return a user if they haven't logged in yet
      const sessionToken = localStorage.getItem('demo_session_token');
      if (sessionToken) {
        const sessionData = JSON.parse(sessionToken);
        // Check if session is still valid (not expired)
        if (sessionData.expiresAt && sessionData.expiresAt > Date.now()) {
          return { id: sessionData.userId, email: sessionData.email };
        }
      }
      return null; // No valid session
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