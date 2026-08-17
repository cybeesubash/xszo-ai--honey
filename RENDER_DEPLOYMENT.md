# 🚀 CYBER-EYE Platform - Render.com Deployment Guide

> **Deploy your AI-powered honeypot platform to production in minutes!**

Built by **Subash - GOD OF CYBER 🦅**

---

## 📋 **Prerequisites**

1. **GitHub Repository**: Your code must be pushed to GitHub
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **API Keys**: Prepare your environment variables

---

## 🎯 **Quick Deploy (Automatic)**

### **Option 1: One-Click Deploy with render.yaml**

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: ready for Render deployment"
   git push origin main
   ```

2. **Deploy to Render**:
   - Go to [render.com/dashboard](https://dashboard.render.com)
   - Click **"New"** → **"Blueprint"**
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml` and deploy all services

---

## 🛠️ **Manual Deploy (Individual Services)**

### **Service 1: Backend API**

1. **Create Web Service**:
   - Go to Render Dashboard → **"New"** → **"Web Service"**
   - Connect GitHub repository
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`

2. **Environment Variables**:
   ```
   OPENROUTER_API_KEY=your_openrouter_key
   GEMINI_API_KEY=your_gemini_key
   TELEGRAM_BOT_TOKEN=your_telegram_token
   TELEGRAM_CHAT_ID=your_chat_id
   ```

### **Service 2: Dashboard Frontend**

1. **Create Web Service**:
   - **Root Directory**: `dashboard`
   - **Environment**: `Node.js`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s dist -l $PORT`

2. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-service.onrender.com
   VITE_BACKEND_PROXY=https://your-backend-service.onrender.com
   ```

### **Service 3: XZSO Landing Page**

1. **Create Web Service**:
   - **Root Directory**: `landing page/xszo-main__1_/xszo-main (1)/xszo-main`
   - **Environment**: `Node.js`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview -- --host 0.0.0.0 --port $PORT`

2. **Environment Variables**:
   ```
   VITE_DEMO_MODE=true
   ```

---

## 🌐 **Service URLs (After Deployment)**

| Service | URL Format | Purpose |
|---------|------------|---------|
| **Backend API** | `https://cyber-eye-backend.onrender.com` | REST API & WebSocket |
| **Dashboard** | `https://cyber-eye-dashboard.onrender.com` | Real-time monitoring |
| **Landing Page** | `https://xzso-landing.onrender.com` | Public website |

---

## ⚙️ **Environment Variables Setup**

### **Backend (.env)**
```env
# AI Services
OPENROUTER_API_KEY=sk-or-v1-...
GEMINI_API_KEY=AIza...

# Telegram Integration
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_CHAT_ID=123456789

# Production Settings
ENVIRONMENT=production
LOG_LEVEL=INFO
```

### **Dashboard (.env)**
```env
VITE_API_URL=https://cyber-eye-backend.onrender.com
VITE_BACKEND_PROXY=https://cyber-eye-backend.onrender.com
VITE_PRODUCTION=true
```

### **Landing Page (.env)**
```env
VITE_DEMO_MODE=true
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (optional for demo mode)
```

---

## 🔧 **Custom Domain Setup (Optional)**

1. **Go to Service Settings** in Render
2. **Add Custom Domain**: `yourdomain.com`
3. **Update DNS Records**:
   - Add CNAME: `www` → `your-service.onrender.com`
   - Add ALIAS: `@` → `your-service.onrender.com`

---

## 📊 **Production Deployment Checklist**

### **Before Deployment**
- [ ] All API keys added to environment variables
- [ ] GitHub repository is public or Render has access
- [ ] `render.yaml` configuration reviewed
- [ ] Build scripts tested locally

### **After Deployment**
- [ ] All services show "Live" status
- [ ] Backend API responds: `/health` endpoint
- [ ] Dashboard loads and connects to backend
- [ ] Landing page authentication works
- [ ] ESP32 devices can connect to production backend

### **Security & Performance**
- [ ] Environment variables secured (not in code)
- [ ] CORS properly configured for production domains
- [ ] Rate limiting enabled
- [ ] SSL certificates active (automatic on Render)

---

## 🐛 **Troubleshooting**

### **Common Issues**

**Build Failures**
```bash
# Check build logs in Render dashboard
# Common fixes:
- Verify package.json dependencies
- Check Node.js version compatibility
- Ensure Python requirements.txt is complete
```

**Service Connection Issues**
```bash
# Update environment variables:
VITE_API_URL=https://actual-backend-url.onrender.com
```

**ESP32 Connection Problems**
```bash
# Update ESP32 firmware with production URL:
Backend URL: https://cyber-eye-backend.onrender.com
API Key: honeypot-secret-soc-key-2026
```

### **Render Free Tier Limitations**
- **Sleep Mode**: Services sleep after 15 minutes of inactivity
- **Cold Start**: ~30 seconds to wake up
- **Build Time**: 10 minutes maximum
- **Bandwidth**: 100GB/month per service

---

## 🚀 **Performance Optimization**

### **For Production Use**
1. **Upgrade to Paid Plan**: Prevents sleep mode
2. **Enable Redis**: For session storage and caching
3. **Add PostgreSQL**: For persistent data storage
4. **Configure CDN**: For faster static asset delivery

### **Cost Optimization**
- **Free Tier**: Perfect for demos and testing
- **Starter Plan**: $7/month for always-on services
- **Professional**: $25/month for high-traffic applications

---

## 📈 **Monitoring & Analytics**

### **Render Metrics**
- **CPU Usage**: Monitor in Render dashboard
- **Memory Usage**: Watch for memory leaks
- **Request Volume**: Track API calls
- **Error Rates**: Monitor application health

### **Application Monitoring**
```bash
# Add to backend for better monitoring:
pip install sentry-sdk
pip install prometheus-client
```

---

## 🔄 **Continuous Deployment**

### **Auto-Deploy on Git Push**
```yaml
# render.yaml includes auto-deploy
# Every push to main branch triggers deployment
branches: [main]
```

### **Manual Deploy**
```bash
# Force deploy from Render dashboard:
# Services → Manual Deploy → Deploy Latest Commit
```

---

## 📞 **Support & Resources**

### **Render Documentation**
- [Render Web Services Guide](https://render.com/docs/web-services)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Custom Domains](https://render.com/docs/custom-domains)

### **CYBER-EYE Support**
- **GitHub Issues**: Report bugs and feature requests
- **Discord**: Join community for real-time help
- **Email**: contact@xzso.ai

---

**🎉 Ready to deploy? Follow the steps above and your CYBER-EYE platform will be live on the internet!**

**Built with ❤️ by Subash - GOD OF CYBER 🦅**