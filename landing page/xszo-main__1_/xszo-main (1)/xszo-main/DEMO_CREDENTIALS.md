# 🔐 CYBER-EYE Demo Authentication

## Demo Mode Active ✅

The system is currently running in **DEMO MODE** - no Supabase connection required.

### 📝 Demo Login Credentials:

| **Email** | **Password** | **Role** |
|-----------|--------------|----------|
| `admin@xzso.ai` | `admin123` | Admin |
| `user@xzso.ai` | `user123` | User |
| `demo@xzso.ai` | `demo123` | Demo |

### 🚀 Quick Access:

1. **Go to**: http://localhost:3000
2. **Click**: "EXPLORE" → "LOGIN" 
3. **Use any credentials above**
4. **Click**: "AI HONEYPOT" button to access dashboard

### ⚙️ Enable Production Mode:

To use real Supabase authentication:

1. Get your proper Supabase anon key (starts with `eyJ` and 200+ characters)
2. Update `.env` file:
   ```
   VITE_SUPABASE_URL="https://pfjkuypvxlcrvwgwvtif.supabase.co"
   VITE_SUPABASE_ANON_KEY="eyJ..."
   VITE_DEMO_MODE="false"
   ```
3. Restart the landing page service

---
**Created by: Subash - GOD OF CYBER 🦅**