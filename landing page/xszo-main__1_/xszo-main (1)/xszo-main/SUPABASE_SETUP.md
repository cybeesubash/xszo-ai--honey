# 🔑 SUPABASE API KEY SETUP - CYBER-EYE XZSO

## 🚨 CURRENT STATUS: DEMO MODE ACTIVE

Your landing page is currently running in **DEMO MODE** because the Supabase API key format is incorrect.

## 📋 HOW TO GET YOUR CORRECT SUPABASE API KEY:

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Login to your account
3. Select your project: **pfjkuypvxlcrvwgwvtif**

### Step 2: Get API Keys
1. Click **Settings** (⚙️) in the left sidebar
2. Click **API** 
3. Look for **Project API keys** section
4. Copy the **anon public** key (NOT the service_role key)

### Step 3: Verify Key Format
The correct key should:
- ✅ Start with `eyJ`
- ✅ Be very long (200+ characters) 
- ✅ Have 3 parts separated by dots (JWT format)
- ❌ NOT start with `sb_publishable_`

**Example of correct format:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByb2plY3RpZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjM0NTcyODAzLCJleHAiOjE5NTAxNDg4MDN9.signature_here
```

### Step 4: Update .env File
Replace the key in: `.env`
```env
VITE_SUPABASE_URL="https://pfjkuypvxlcrvwgwvtif.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJ...."  # Your correct anon key here
```

### Step 5: Restart Server
```bash
npm run dev
```

## 🎮 DEMO MODE CREDENTIALS (Current)

While in demo mode, you can use these test accounts:

| Email | Password | 
|-------|----------|
| admin@xzso.ai | admin123 |
| user@xzso.ai | user123 |
| demo@xzso.ai | demo123 |
| test@test.com | test123 |

## 🔍 TROUBLESHOOTING

### Problem: "Invalid API Key"
- ✅ Check key starts with `eyJ`
- ✅ Check key is complete (no truncation)
- ✅ Check no extra spaces/characters
- ✅ Restart npm server after changing .env

### Problem: "Connection Failed"
- ✅ Check internet connection
- ✅ Check Supabase project is active
- ✅ Check project URL is correct
- ✅ Verify RLS policies are set up

## ✅ SUCCESS INDICATORS

When Supabase is working correctly:
- ✅ Console shows: "Supabase client initialized successfully"
- ✅ Login form shows: "Powered by Supabase • Secure Authentication"
- ✅ You can create real user accounts
- ✅ Users get email verification

## 📞 NEED HELP?

If you're still having issues:
1. Check browser console (F12) for errors
2. Verify your Supabase project is active
3. Make sure you copied the **anon** key, not service_role
4. Try creating a new API key in Supabase dashboard

---
**Current Mode:** DEMO (Working with local test accounts)
**Target Mode:** PRODUCTION (Real Supabase authentication)