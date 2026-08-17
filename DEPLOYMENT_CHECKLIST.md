# ✅ CYBER-EYE Render Deployment Checklist

## 📋 Pre-Deployment

- [ ] Code pushed to GitHub repository
- [ ] GitHub repo URL: `https://github.com/cybeesubash/xszo-ai--honey`
- [ ] Render.com account created
- [ ] API keys ready (OpenRouter, Gemini, Telegram)

---

## 🚀 SERVICE 1: Backend Deployment

### Setup:
- [ ] New Web Service created on Render
- [ ] GitHub repo connected
- [ ] Service name: `cyber-eye-backend`
- [ ] Environment: Python 3
- [ ] Region selected (Oregon US-West recommended)
- [ ] Branch: `main`

### Configuration:
- [ ] Root Directory: `backend`
- [ ] Build Command: `pip install -r requirements.txt`
- [ ] Start Command: `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Plan: Free

### Environment Variables Added:
- [ ] `OPENROUTER_API_KEY`
- [ ] `GEMINI_API_KEY`
- [ ] `TELEGRAM_BOT_TOKEN`
- [ ] `TELEGRAM_CHAT_ID`
- [ ] `PYTHON_VERSION = 3.11.0`

### Verification:
- [ ] Service status: ✅ Live
- [ ] URL copied: `https://______________________.onrender.com`
- [ ] Health check working: `/health` endpoint returns OK
- [ ] Build logs reviewed (no errors)

---

## 📊 SERVICE 2: Dashboard Deployment

### Setup:
- [ ] New Web Service created on Render
- [ ] GitHub repo connected (same as backend)
- [ ] Service name: `cyber-eye-dashboard`
- [ ] Environment: Node
- [ ] Branch: `main`

### Configuration:
- [ ] Root Directory: `dashboard`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npx serve -s dist -p $PORT`
- [ ] Plan: Free

### Environment Variables Added:
- [ ] `VITE_API_URL` = (backend URL from Service 1)
- [ ] `VITE_BACKEND_PROXY` = (backend URL from Service 1)
- [ ] `NODE_VERSION = 18.17.0`

### Verification:
- [ ] Service status: ✅ Live
- [ ] URL copied: `https://______________________.onrender.com`
- [ ] Dashboard loads in browser
- [ ] Dashboard connects to backend
- [ ] Build logs reviewed (no errors)

---

## 🌐 SERVICE 3: Landing Page Deployment

### Setup:
- [ ] New Web Service created on Render
- [ ] GitHub repo connected (same as backend)
- [ ] Service name: `xzso-landing`
- [ ] Environment: Node
- [ ] Branch: `main`

### Configuration:
- [ ] Root Directory: `landing page/xszo-main__1_/xszo-main (1)/xszo-main`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm run start`
- [ ] Plan: Free

### Environment Variables Added:
- [ ] `VITE_DEMO_MODE = true`
- [ ] `NODE_VERSION = 18.17.0`

### Verification:
- [ ] Service status: ✅ Live
- [ ] URL copied: `https://______________________.onrender.com`
- [ ] Landing page loads in browser
- [ ] Login works with demo credentials
- [ ] "AI HONEYPOT" button opens dashboard
- [ ] Build logs reviewed (no errors)

---

## 🔧 Post-Deployment Configuration

### Backend CORS Update:
- [ ] Add production URLs to `backend/main.py` CORS origins
- [ ] Dashboard URL added
- [ ] Landing page URL added
- [ ] Backend redeployed with new CORS settings

### ESP32 Configuration:
- [ ] ESP32 firmware updated with production backend URL
- [ ] API key verified
- [ ] ESP32 connects to production backend
- [ ] Heartbeats visible in dashboard

---

## 🧪 End-to-End Testing

### Backend API:
- [ ] `/health` endpoint responds
- [ ] `/stats` returns data
- [ ] `/logs` returns attack logs
- [ ] `/devices` shows registered devices
- [ ] WebSocket connection works

### Dashboard:
- [ ] Page loads without errors
- [ ] Real-time metrics display
- [ ] 3D attack map renders
- [ ] Attack logs stream updates
- [ ] Device panel shows ESP32 status
- [ ] IP intelligence panel works

### Landing Page:
- [ ] Home page loads
- [ ] Login page accessible
- [ ] Demo login works:
  - [ ] admin@xzso.ai / admin123
  - [ ] user@xzso.ai / user123
  - [ ] demo@xzso.ai / demo123
- [ ] "AI HONEYPOT" button redirects to dashboard
- [ ] Navigation works correctly

---

## 📈 Performance & Monitoring

### Service Health:
- [ ] All 3 services show "Live" status in Render
- [ ] No build or runtime errors in logs
- [ ] CPU/Memory usage within limits
- [ ] Response times acceptable

### Optional Enhancements:
- [ ] UptimeRobot configured to ping services every 10 min
- [ ] Custom domain names configured (optional)
- [ ] SSL certificates verified (auto by Render)
- [ ] Monitoring dashboards set up

---

## 🐛 Troubleshooting Completed

### If Issues Found:
- [ ] Build errors resolved
- [ ] Environment variables verified
- [ ] CORS configuration updated
- [ ] Port configuration verified ($PORT used)
- [ ] Dependencies installed correctly
- [ ] Logs reviewed for errors

---

## 📝 Documentation Updated

- [ ] Production URLs added to README.md
- [ ] Deployment guide verified
- [ ] API documentation accessible
- [ ] Team notified of deployment

---

## 🎉 DEPLOYMENT COMPLETE!

**Production URLs:**
```
Backend:    https://______________________.onrender.com
Dashboard:  https://______________________.onrender.com
Landing:    https://______________________.onrender.com
```

**Deployed by:** Subash - GOD OF CYBER 🦅
**Date:** _______________
**Status:** ✅ LIVE IN PRODUCTION

---

**Next Steps:**
1. Monitor services for first 24 hours
2. Test with real ESP32 devices
3. Share production URLs with team
4. Set up alerts and monitoring
5. Plan for scaling if needed

**🚀 CYBER-EYE Platform is now live on the internet!**