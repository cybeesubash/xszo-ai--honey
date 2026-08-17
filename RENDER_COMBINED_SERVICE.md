# 🚀 CYBER-EYE Combined Service - Render Deployment

## 📦 Backend + Dashboard in ONE Service!

**By: Subash - GOD OF CYBER 🦅**

This setup combines both backend API and dashboard frontend into a single Render service, saving you a free tier slot!

---

## 🎯 **RENDER CONFIGURATION**

### **Service Details:**
```
Name: cyber-eye-platform
Environment: Python 3
Branch: main
Root Directory: (leave blank - uses root)
Region: Oregon (US West)
Plan: Free
```

### **Build Command:**
```bash
cd dashboard && npm install --legacy-peer-deps && npm run build && cd ../backend && pip install -r requirements.txt
```

### **Start Command:**
```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

### **Environment Variables:**
```
# Python Version
PYTHON_VERSION = 3.11.0

# Node Version (for build)
NODE_VERSION = 18.17.0

# API Keys
OPENROUTER_API_KEY = <your-openrouter-key>
GEMINI_API_KEY = <your-gemini-key>
TELEGRAM_BOT_TOKEN = <your-telegram-token>
TELEGRAM_CHAT_ID = <your-chat-id>

# CORS (add your production URL after deployment)
CORS_ORIGINS = http://localhost:5173,http://127.0.0.1:5173
```

---

## 📋 **STEP-BY-STEP DEPLOYMENT**

### **1. Create Web Service on Render**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo: `cybeesubash/xszo-ai--honey`

### **2. Configure Service**
Fill in these exact values:

| Field | Value |
|-------|-------|
| **Name** | `cyber-eye-platform` |
| **Region** | Oregon (US West) |
| **Branch** | `main` |
| **Root Directory** | _(leave blank)_ |
| **Runtime** | `Python 3` |
| **Build Command** | `cd dashboard && npm install && npm run build && cd ../backend && pip install -r requirements.txt` |
| **Start Command** | `cd backend && python -m uvicorn main:app --host 0.0.0.0 --port $PORT` |

### **3. Add Environment Variables**
Click "Advanced" and add these:

```
PYTHON_VERSION = 3.11.0
NODE_VERSION = 18.17.0
OPENROUTER_API_KEY = sk-or-v1-your-key-here
GEMINI_API_KEY = AIza-your-key-here
TELEGRAM_BOT_TOKEN = 123456:ABC-your-token
TELEGRAM_CHAT_ID = 123456789
```

### **4. Create Service**
- Click **"Create Web Service"**
- Wait 5-10 minutes for build
- Watch the logs for any errors

### **5. Get Your URL**
After deployment completes:
```
Your Service URL: https://cyber-eye-platform.onrender.com

Dashboard:  https://cyber-eye-platform.onrender.com/
API Docs:   https://cyber-eye-platform.onrender.com/docs
Health:     https://cyber-eye-platform.onrender.com/health
API:        https://cyber-eye-platform.onrender.com/api/...
```

---

## 🌐 **HOW IT WORKS**

### **Architecture:**
```
┌─────────────────────────────────────────┐
│   Render.com Server (Single Service)    │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  FastAPI Backend (Port $PORT)      │ │
│  │                                     │ │
│  │  • Serves API endpoints            │ │
│  │    /api/*, /logs, /stats, etc.    │ │
│  │                                     │ │
│  │  • Serves Dashboard Static Files   │ │
│  │    / → index.html                  │ │
│  │    /assets/* → CSS, JS, images    │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Dashboard Files (Built)           │ │
│  │  dashboard/dist/                   │ │
│  │    - index.html                    │ │
│  │    - assets/                       │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### **Request Flow:**
- `GET /` → Serves dashboard HTML
- `GET /assets/*` → Serves dashboard CSS/JS
- `GET /api/*` → API responses
- `GET /logs` → API responses
- `WebSocket /ws/live` → Real-time updates

---

## ✅ **VERIFICATION**

After deployment, test these URLs:

### **Dashboard (Frontend):**
```bash
# Open in browser:
https://cyber-eye-platform.onrender.com/

# Should show: CYBER-EYE Dashboard with 3D globe
```

### **API Endpoints:**
```bash
# Health check:
curl https://cyber-eye-platform.onrender.com/health

# API docs:
https://cyber-eye-platform.onrender.com/docs

# Stats:
curl https://cyber-eye-platform.onrender.com/stats
```

---

## 🔧 **LOCAL TESTING (Before Deploy)**

Test the combined setup locally:

```bash
# Terminal 1: Build dashboard
cd dashboard
npm install
npm run build
cd ..

# Terminal 2: Run backend (serves both)
cd backend
python main.py
```

Then open: http://localhost:8000/ (should show dashboard)
API docs: http://localhost:8000/docs

---

## 🐛 **TROUBLESHOOTING**

### **Issue: Dashboard Not Loading**
```
Problem: Root path / shows API info instead of dashboard
Solution: Check build logs - dashboard/dist/ must exist
Fix: Ensure build command completed successfully
```

### **Issue: CSS/JS Not Loading**
```
Problem: Dashboard loads but looks broken (no styles)
Solution: Check browser console for 404 errors
Fix: Verify /assets path is correctly mounted
```

### **Issue: API Endpoints Not Working**
```
Problem: API calls return 404
Solution: Check if API routes start with /api/, /logs, etc.
Fix: Update dashboard API calls if needed
```

### **Issue: Build Takes Too Long**
```
Problem: Build exceeds 10 minute limit
Solution: Free tier has 10 min build limit
Fix: Upgrade to Starter plan ($7/mo) or optimize build
```

---

## 📊 **PROS & CONS**

### **✅ Advantages:**
- **Only 1 service needed** (saves free tier slots)
- **No CORS issues** (same origin)
- **Simpler deployment** (one URL)
- **Faster** (no cross-origin requests)
- **Lower costs** (1 service vs 2)

### **⚠️ Considerations:**
- **Build time longer** (both frontend + backend)
- **Redeploys both** when either changes
- **Mixed logs** (frontend build + backend runtime)

---

## 🎯 **PRODUCTION TIPS**

### **Update CORS After Deployment:**
Once you have your Render URL, update the CORS environment variable:

```
CORS_ORIGINS = https://cyber-eye-platform.onrender.com,http://localhost:5173
```

Then **manually trigger a redeploy** from Render dashboard.

### **Custom Domain:**
Add your own domain in Render settings:
```
yourdomain.com → cyber-eye-platform.onrender.com
```

### **Keep Service Awake:**
Use UptimeRobot to ping every 10 minutes:
```
https://cyber-eye-platform.onrender.com/health
```

---

## 🔄 **ALTERNATIVE: Separate Services**

If you prefer separate services (more flexibility):

### **Service 1: Backend Only**
```
Root Directory: backend
Build: pip install -r requirements.txt
Start: python -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

### **Service 2: Dashboard Only**
```
Root Directory: dashboard
Build: npm install && npm run build
Start: npx serve -s dist -p $PORT
Env: VITE_API_URL=https://backend-url.onrender.com
```

---

## 📈 **MONITORING**

### **Check Service Health:**
```bash
# Quick health check:
curl https://cyber-eye-platform.onrender.com/health

# Expected response:
{
  "service": "CYBER-EYE SOC Backend API",
  "status": "ok",
  "engine": "openrouter",
  "timestamp": "2026-08-13T19:45:00.000Z"
}
```

### **View Logs:**
- Go to Render Dashboard
- Click on your service
- Click "Logs" tab
- Monitor real-time logs

---

## 🚀 **READY TO DEPLOY?**

**Copy these exact values into Render:**

```
Name: cyber-eye-platform
Runtime: Python 3
Branch: main
Root Directory: (blank)

Build Command:
cd dashboard && npm install && npm run build && cd ../backend && pip install -r requirements.txt

Start Command:
cd backend && python -m uvicorn main:app --host 0.0.0.0 --port $PORT

Environment Variables:
PYTHON_VERSION = 3.11.0
NODE_VERSION = 18.17.0
OPENROUTER_API_KEY = (your key)
GEMINI_API_KEY = (your key)
TELEGRAM_BOT_TOKEN = (your token)
TELEGRAM_CHAT_ID = (your id)
```

---

**🎉 One service = Backend API + Dashboard + Less complexity!**

**Built with ❤️ by Subash - GOD OF CYBER 🦅**