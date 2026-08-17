# 🚀 RENDER.COM DEPLOYMENT COMMANDS

## Quick Reference for CYBER-EYE Platform
**By: Subash - GOD OF CYBER 🦅**

---

## 📡 **SERVICE 1: BACKEND API**

### **Render Settings:**
- **Name**: `cyber-eye-backend`
- **Environment**: `Python 3`
- **Branch**: `main`
- **Root Directory**: `backend`

### **Build Command:**
```bash
pip install -r requirements.txt
```

### **Start Command:**
```bash
python -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

### **Environment Variables:**
```
OPENROUTER_API_KEY = <your-openrouter-key>
GEMINI_API_KEY = <your-gemini-key>
TELEGRAM_BOT_TOKEN = <your-telegram-token>
TELEGRAM_CHAT_ID = <your-chat-id>
PYTHON_VERSION = 3.11.0
```

### **Health Check Path:**
```
/health
```

---

## 📊 **SERVICE 2: DASHBOARD (Frontend)**

### **Render Settings:**
- **Name**: `cyber-eye-dashboard`
- **Environment**: `Node`
- **Branch**: `main`
- **Root Directory**: `dashboard`

### **Build Command:**
```bash
npm install && npm run build
```

### **Start Command:**
```bash
npx serve -s dist -p $PORT
```

### **Environment Variables:**
```
NODE_VERSION = 18.17.0
VITE_API_URL = https://cyber-eye-backend.onrender.com
VITE_BACKEND_PROXY = https://cyber-eye-backend.onrender.com
```

---

## 🌐 **SERVICE 3: XZSO LANDING PAGE**

### **Render Settings:**
- **Name**: `xzso-landing`
- **Environment**: `Node`
- **Branch**: `main`
- **Root Directory**: `landing page/xszo-main__1_/xszo-main (1)/xszo-main`

### **Build Command:**
```bash
npm install && npm run build
```

### **Start Command:**
```bash
npm run start
```

### **Environment Variables:**
```
NODE_VERSION = 18.17.0
VITE_DEMO_MODE = true
VITE_SUPABASE_URL = https://pfjkuypvxlcrvwgwvtif.supabase.co
```

---

## 📋 **STEP-BY-STEP DEPLOYMENT PROCESS**

### **1️⃣ BACKEND DEPLOYMENT**

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo: `cybeesubash/xszo-ai--honey`
4. Fill in these details:

   ```
   Name: cyber-eye-backend
   Region: Oregon (US West) or closest to you
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: python -m uvicorn main:app --host 0.0.0.0 --port $PORT
   Plan: Free
   ```

5. **Add Environment Variables** (click "Advanced"):
   - `OPENROUTER_API_KEY` → Your OpenRouter key
   - `GEMINI_API_KEY` → Your Gemini key
   - `TELEGRAM_BOT_TOKEN` → Your bot token
   - `TELEGRAM_CHAT_ID` → Your chat ID

6. Click **"Create Web Service"**
7. Wait 5-10 minutes for build to complete
8. **Copy the URL**: `https://cyber-eye-backend.onrender.com`

---

### **2️⃣ DASHBOARD DEPLOYMENT**

1. Click **"New +"** → **"Web Service"** again
2. Connect same GitHub repo
3. Fill in these details:

   ```
   Name: cyber-eye-dashboard
   Region: Same as backend
   Branch: main
   Root Directory: dashboard
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npx serve -s dist -p $PORT
   Plan: Free
   ```

4. **Add Environment Variables**:
   - `VITE_API_URL` → `https://cyber-eye-backend.onrender.com` (use YOUR backend URL)
   - `VITE_BACKEND_PROXY` → `https://cyber-eye-backend.onrender.com`
   - `NODE_VERSION` → `18.17.0`

5. Click **"Create Web Service"**
6. Wait for build to complete
7. **Your dashboard URL**: `https://cyber-eye-dashboard.onrender.com`

---

### **3️⃣ XZSO LANDING PAGE DEPLOYMENT**

1. Click **"New +"** → **"Web Service"** again
2. Connect same GitHub repo
3. Fill in these details:

   ```
   Name: xzso-landing
   Region: Same as backend
   Branch: main
   Root Directory: landing page/xszo-main__1_/xszo-main (1)/xszo-main
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm run start
   Plan: Free
   ```

4. **Add Environment Variables**:
   - `VITE_DEMO_MODE` → `true`
   - `NODE_VERSION` → `18.17.0`

5. Click **"Create Web Service"**
6. Wait for build to complete
7. **Your landing URL**: `https://xzso-landing.onrender.com`

---

## 🔥 **IMPORTANT NOTES**

### **Free Tier Limitations:**
- Services **sleep after 15 minutes** of inactivity
- **First request** after sleep takes ~30 seconds (cold start)
- **Build time limit**: 10 minutes
- **750 hours/month** per service

### **Wake-Up Solution:**
Add this to your services to keep them alive:
```bash
# Use UptimeRobot or cron-job.org to ping every 10 minutes:
https://cyber-eye-backend.onrender.com/health
https://cyber-eye-dashboard.onrender.com/
https://xzso-landing.onrender.com/
```

---

## ✅ **VERIFICATION CHECKLIST**

After deployment, verify each service:

### **Backend:**
```bash
curl https://cyber-eye-backend.onrender.com/health
# Should return: {"status": "ok"}
```

### **Dashboard:**
```bash
# Open in browser:
https://cyber-eye-dashboard.onrender.com/
# Should show the honeypot dashboard
```

### **Landing Page:**
```bash
# Open in browser:
https://xzso-landing.onrender.com/
# Should show XZSO landing with login
```

---

## 🐛 **COMMON ISSUES & FIXES**

### **Build Failed:**
```
Check Logs → Look for missing dependencies
Fix: Update package.json or requirements.txt
```

### **Service Not Starting:**
```
Check Start Command → Verify $PORT is used
Fix: Use --port $PORT or -p $PORT in command
```

### **CORS Errors:**
```
Update backend main.py CORS origins:
origins = [
    "https://cyber-eye-dashboard.onrender.com",
    "https://xzso-landing.onrender.com"
]
```

### **Environment Variables Not Working:**
```
1. Go to Service → Environment
2. Add variables
3. Click "Save Changes"
4. Manually trigger "Deploy"
```

---

## 🎯 **FINAL URLS (Example)**

After deployment, you'll have:

```
Backend API:      https://cyber-eye-backend.onrender.com
Dashboard:        https://cyber-eye-dashboard.onrender.com  
Landing Page:     https://xzso-landing.onrender.com

API Docs:         https://cyber-eye-backend.onrender.com/docs
Health Check:     https://cyber-eye-backend.onrender.com/health
```

---

## 💡 **PRO TIPS**

1. **Deploy Backend First** - Dashboard needs backend URL
2. **Copy URLs Immediately** - Use them in next service's env vars
3. **Enable Auto-Deploy** - Automatic deployment on git push
4. **Monitor Logs** - Check Render dashboard for errors
5. **Use Custom Domains** - Add your own domain later

---

**🚀 Ready to deploy? Copy these commands and paste them into Render!**

**Questions? Check the logs in Render dashboard or contact support.**

---

**Built with ❤️ by Subash - GOD OF CYBER 🦅**