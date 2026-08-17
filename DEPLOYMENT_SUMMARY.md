# 🚀 CYBER-EYE Render Deployment - SUMMARY

**By: Subash - GOD OF CYBER 🦅**

---

## 📦 **OPTION SELECTED: Combined Service (Recommended)**

You're deploying **Backend + Dashboard as ONE service** to save a free tier slot!

---

## 🎯 **EXACT CONFIGURATION FOR RENDER**

### **Copy-Paste These Values:**

```
Service Name: cyber-eye-platform
Environment: Python 3
Branch: main
Root Directory: (leave blank)
Plan: Free
Region: Oregon (US West)
```

### **Build Command:**
```
cd dashboard && npm install --legacy-peer-deps && npm run build && cd ../backend && pip install -r requirements.txt
```

### **Start Command:**
```
python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

### **Environment Variables:**
```
PYTHON_VERSION=3.11.0
NODE_VERSION=18.17.0
OPENROUTER_API_KEY=<your-key>
GEMINI_API_KEY=<your-key>
TELEGRAM_BOT_TOKEN=<your-token>
TELEGRAM_CHAT_ID=<your-id>
```

---

## 📋 **DEPLOYMENT CHECKLIST**

- [ ] **1. Push code to GitHub**
  ```bash
  git add .
  git commit -m "feat: ready for Render deployment"
  git push origin main
  ```

- [ ] **2. Go to Render Dashboard**
  - URL: https://dashboard.render.com
  - Sign up or login

- [ ] **3. Create New Web Service**
  - Click "New +" → "Web Service"
  - Connect GitHub repo: `cybeesubash/xszo-ai--honey`

- [ ] **4. Configure Service**
  - Copy-paste the values above
  - Add environment variables
  - Click "Create Web Service"

- [ ] **5. Wait for Build (5-10 minutes)**
  - Watch logs for progress
  - Build creates: dashboard → backend

- [ ] **6. Test Deployment**
  - Dashboard: `https://your-service.onrender.com/`
  - API Docs: `https://your-service.onrender.com/docs`
  - Health: `https://your-service.onrender.com/health`

---

## 🌐 **WHAT YOU'LL GET**

### **Single URL for Everything:**
```
Main URL: https://cyber-eye-platform.onrender.com

Dashboard (/):       3D honeypot dashboard
API (/api/*):        All backend endpoints
Docs (/docs):        Interactive API documentation
Health (/health):    Health check endpoint
WebSocket (/ws/live): Real-time attack stream
```

---

## ✅ **ADVANTAGES**

| Feature | Benefit |
|---------|---------|
| **1 Service** | Uses only 1 free tier slot (save 2 slots!) |
| **No CORS** | Same origin = no cross-origin issues |
| **Simple URL** | One URL for everything |
| **Faster** | No network latency between services |
| **Lower Cost** | 1 service = lower bill |

---

## 📊 **WHAT HAPPENS DURING BUILD**

```
Step 1: Install Node.js → Build Dashboard
  ├── npm install (dashboard dependencies)
  ├── npm run build (creates dist/)
  └── Output: dashboard/dist/ folder with HTML/CSS/JS

Step 2: Install Python → Setup Backend
  ├── pip install requirements.txt
  └── Backend ready to serve API + dashboard files

Step 3: Start Service
  ├── FastAPI starts on port $PORT
  ├── Serves dashboard at /
  ├── Serves dashboard assets at /assets/*
  └── Serves API at /api/*, /logs, /stats, etc.
```

---

## 🐛 **IF BUILD FAILS**

### **Common Issues:**

**1. npm install fails:**
```
Solution: Check dashboard/package.json exists
Fix: Ensure dashboard folder is committed to GitHub
```

**2. pip install fails:**
```
Solution: Check backend/requirements.txt exists
Fix: Ensure all Python packages are listed
```

**3. Build timeout (>10 minutes):**
```
Solution: Free tier has 10 min build limit
Fix: Remove unnecessary dependencies or upgrade plan
```

**4. Start command fails:**
```
Solution: Check $PORT is used in uvicorn command
Fix: Must use: --port $PORT (not hardcoded 8000)
```

---

## 🔧 **AFTER DEPLOYMENT**

### **Update ESP32 Configuration:**
```
Backend URL: https://cyber-eye-platform.onrender.com
API Key: honeypot-secret-soc-key-2026
```

### **Test All Features:**
- [ ] Dashboard loads and looks correct
- [ ] 3D globe renders
- [ ] Attack logs display
- [ ] WebSocket real-time updates work
- [ ] API endpoints respond
- [ ] ESP32 can connect and send data

---

## 📱 **ACCESS FROM ANYWHERE**

Once deployed, access your platform from:
- Desktop browser
- Mobile phone
- Tablet
- Any device with internet!

**Your honeypot is now live on the internet! 🌐**

---

## 💡 **NEXT STEPS**

1. **Deploy to Render** (follow checklist above)
2. **Test thoroughly** (use demo attack generator)
3. **Connect real ESP32 devices**
4. **Monitor for 24 hours**
5. **Set up UptimeRobot** to keep awake
6. **Share URL with team**
7. **Add custom domain** (optional)

---

## 📞 **NEED HELP?**

### **Reference Files:**
- `RENDER_ONE_SERVICE.txt` - Quick copy-paste commands
- `RENDER_COMBINED_SERVICE.md` - Detailed guide
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist

### **Render Support:**
- Dashboard: https://dashboard.render.com
- Docs: https://render.com/docs
- Discord: https://render.com/discord

---

## 🎉 **YOU'RE READY TO DEPLOY!**

**Everything is configured and ready. Just:**
1. Push to GitHub
2. Create service on Render
3. Copy-paste the commands above
4. Wait for build
5. Test your live URL!

**🚀 Your CYBER-EYE platform will be live in ~10 minutes!**

---

**Built with ❤️ by Subash - GOD OF CYBER 🦅**
**Date: August 13, 2026**