# 🍯 CYBER-EYE AI HoneyBot Platform

> **Next-generation AI-powered cybersecurity honeypot system with ESP32 integration and real-time threat intelligence**

Built by **Subash - GOD OF CYBER 🦅**

---

## 🚀 **Platform Overview**

CYBER-EYE is a comprehensive cybersecurity platform featuring:
- **🍯 ESP32-powered honeypot devices** for distributed threat detection
- **🤖 AI threat analysis** using OpenRouter DeepSeek/Gemini models
- **🌐 Professional XZSO landing page** with Supabase authentication
- **📊 Real-time 3D attack visualization** dashboard
- **📱 Telegram integration** for instant threat notifications

---

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   XZSO Landing  │───▶│  AI HoneyBot    │───▶│     ESP32       │
│   (Port 3000)   │    │   Dashboard     │    │   Honeypots     │
│                 │    │  (Port 5173/4)  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Backend API   │
                    │   (Port 8000)   │ 
                    │                 │
                    └─────────────────┘
```

---

## 🎯 **Quick Start**

### **Prerequisites**
- **Node.js 18+**
- **Python 3.8+** 
- **ESP32 WROOM-32** (optional for physical honeypots)

### **Installation**
```bash
# Clone the repository
git clone <your-repo-url>
cd AI HONEY

# Install Python dependencies
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r backend/requirements.txt

# Install Node dependencies
npm install
cd dashboard && npm install
cd "../landing page/xszo-main__1_/xszo-main (1)/xszo-main" && npm install
```

### **Environment Setup**
```bash
# Backend configuration
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys:
# - OPENROUTER_API_KEY
# - GEMINI_API_KEY  
# - TELEGRAM_BOT_TOKEN

# XZSO Landing page (optional)
cp "landing page/xszo-main__1_/xszo-main (1)/xszo-main/.env.example" "landing page/xszo-main__1_/xszo-main (1)/xszo-main/.env"
# Add your Supabase credentials (or leave blank for demo mode)
```

### **Start All Services**
```bash
# Option 1: Start everything at once
npm run dev

# Option 2: Start individually
# Terminal 1 - Backend
cd backend && python main.py

# Terminal 2 - Dashboard  
cd dashboard && npm run dev

# Terminal 3 - Landing Page
cd "landing page/xszo-main__1_/xszo-main (1)/xszo-main" && npm run dev
```

---

## 🌐 **Access URLs**

| Service | URL | Purpose |
|---------|-----|---------|
| **XZSO Landing** | http://localhost:3000 | Professional company site with auth |
| **AI Dashboard** | http://127.0.0.1:5173 | Real-time threat monitoring |
| **Backend API** | http://192.168.1.100:8000 | REST API & WebSocket |
| **API Docs** | http://192.168.1.100:8000/docs | Interactive API documentation |

---

## 🔧 **ESP32 Honeypot Setup**

### **Hardware Requirements**
- ESP32 WROOM-32 development board
- USB cable for programming
- WiFi network (2.4GHz required)

### **Firmware Installation**
1. **Install Arduino IDE** with ESP32 board support
2. **Open** `firmware/honeypot/honeypot.ino`
3. **Configure libraries:** ArduinoJson, WiFiManager, HTTPClient
4. **Upload** to ESP32
5. **Configure** via WiFi portal "HoneyBot_Setup"

### **Configuration**
- **WiFi SSID:** Your 2.4GHz network
- **Backend URL:** `http://192.168.1.100:8000`  
- **API Key:** `honeypot-secret-soc-key-2026`

### **Services Provided**
- **HTTP Server** (Port 80) - Web application honeypot
- **FTP Server** (Port 21) - File transfer honeypot  
- **SSH Server** (Port 22) - Secure shell honeypot
- **Telnet Server** (Port 23) - Remote access honeypot

---

## 🤖 **AI Features**

### **Threat Analysis Engine**
- **MITRE ATT&CK** framework classification
- **CVSS scoring** for vulnerability assessment
- **Behavioral analysis** of attack patterns
- **Real-time threat intelligence** correlation

### **Supported AI Models**
- **OpenRouter:** DeepSeek, GPT-4, Claude, Llama
- **Google Gemini:** 2.0-flash for rapid analysis
- **Automatic failover** between providers

### **Analysis Capabilities**
- **Attack type detection** (brute force, injection, scan, etc.)
- **Severity classification** (Low/Medium/High/Critical)
- **Payload analysis** and IOC extraction
- **Mitigation recommendations**

---

## 📊 **Dashboard Features**

### **Real-time Visualization**
- **🌍 3D Global Attack Map** with animated attack paths
- **📈 Live metrics** and statistics
- **⚡ Real-time attack feed** with severity indicators
- **📱 Mobile-responsive** design

### **Intelligence Panels**
- **🔍 IP Intelligence** with geolocation & ISP data
- **🛡️ Mitigation Tools** with firewall rules
- **📊 Analytics Charts** showing attack trends
- **🤖 AI Chat Interface** for threat consultation

### **Security Operations**
- **📋 Device Management** for ESP32 honeypots
- **🚨 Alert System** with Telegram integration
- **📈 Threat Timeline** and historical analysis
- **⚙️ Configuration Management**

---

## 🔐 **Authentication & Security**

### **XZSO Landing Page**
- **Supabase Authentication** for production
- **Demo Mode** for testing without Supabase
- **Professional branding** with company information
- **Direct dashboard access** via honeypot button

### **Demo Credentials (Demo Mode)**
| Email | Password |
|-------|----------|
| admin@xzso.ai | admin123 |
| user@xzso.ai | user123 |
| demo@xzso.ai | demo123 |

### **Security Features**
- **API key authentication** for device registration
- **CORS protection** for web access
- **Rate limiting** on sensitive endpoints
- **Input validation** and sanitization

---

## 🛠️ **Development Scripts**

### **PowerShell Automation**
- `esp32_debug_full.ps1` - Complete ESP32 diagnostics
- `generate_demo_attacks.ps1` - Create test attack data
- `clear_attacks.ps1` - Remove demo attack data
- `ping_esp32.ps1` - Network ESP32 discovery
- `test_esp32_connection.ps1` - Connection testing

### **Utility Commands**
```bash
# Backend testing
python backend/test_api.py
python backend/virtual_esp32.py  # Simulate ESP32

# Clear demo data
powershell -ExecutionPolicy Bypass -File clear_attacks.ps1

# ESP32 diagnostics  
powershell -ExecutionPolicy Bypass -File esp32_debug_full.ps1
```

---

## 🔌 **API Reference**

### **Device Management**
- `POST /device/register` - Register new honeypot device
- `POST /device/heartbeat` - Device status update
- `GET /devices` - List all registered devices

### **Attack Data**
- `POST /api/event` - Submit honeypot event
- `GET /logs` - Retrieve attack logs
- `GET /stats` - Platform statistics
- `GET /timeline` - Attack timeline data

### **Intelligence**
- `GET /api/ip/{ip}` - IP intelligence lookup
- `GET /chat/{ip}` - AI analysis for specific IP
- `POST /api/chat` - Global threat consultation

### **Utilities**  
- `POST /api/demo/event` - Generate demo attack
- `POST /api/clear` - Clear all data (dev mode)
- `GET /health` - System health check

---

## 📱 **Telegram Integration**

### **Bot Setup**
1. Create bot via **@BotFather**
2. Add `TELEGRAM_BOT_TOKEN` to backend/.env
3. Add `TELEGRAM_CHAT_ID` for notifications
4. Bot automatically starts with backend

### **Features**
- **Real-time attack alerts** with severity levels
- **Device status notifications** 
- **Interactive commands** for platform control
- **Attack summary reports**

---

## 🚀 **Deployment**

### **Local Development**
```bash
npm run dev  # Starts all services
```

### **Production Deployment**
```bash
# Build frontend
cd dashboard && npm run build
cd "../landing page/xszo-main__1_/xszo-main (1)/xszo-main" && npm run build

# Deploy backend
cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000

# Configure reverse proxy (nginx/apache) for frontend serving
```

### **Docker Support** (Future)
```yaml
# docker-compose.yml template
version: '3.8'
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
  dashboard:
    build: ./dashboard
    ports: ["5173:5173"]
  landing:
    build: ./landing
    ports: ["3000:3000"]
```

---

## 🐛 **Troubleshooting**

### **Common Issues**

**ESP32 Not Connecting**
- Verify 2.4GHz WiFi network
- Check backend URL accessibility
- Run `esp32_debug_full.ps1` for diagnostics

**AI Analysis Failing**
- Verify API keys in backend/.env
- Check OpenRouter/Gemini service status
- Monitor backend logs for errors

**Authentication Issues**
- Use demo mode if Supabase not configured
- Verify Supabase anon key format (starts with `eyJ`)
- Check browser console for errors

### **Log Locations**
- Backend: `backend/server_out.log`, `backend/server_err.log`
- Dashboard: Browser console (F12)
- ESP32: Serial monitor (115200 baud)

---

## 📈 **Performance**

### **Specifications**
- **Attack Processing:** 100+ events/minute
- **Concurrent Users:** 50+ dashboard users
- **ESP32 Support:** 25+ devices per backend
- **Response Time:** <100ms API latency

### **Optimization**
- **In-memory storage** for rapid access
- **WebSocket connections** for real-time updates
- **Efficient 3D rendering** with GPU acceleration
- **Lazy loading** for large datasets

---

## 🤝 **Contributing**

### **Development Setup**
1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Make changes and test thoroughly
4. Commit: `git commit -m "Add new feature"`
5. Push: `git push origin feature/new-feature`
6. Create Pull Request

### **Code Style**
- **Python:** Follow PEP 8, use black formatter
- **JavaScript/TypeScript:** Prettier + ESLint
- **Commit Messages:** Conventional Commits format

---

## 📄 **License**

This project is licensed under the **MIT License** - see LICENSE file for details.

---

## 🎖️ **Credits**

**Created by:** Subash - GOD OF CYBER 🦅  
**Company:** XZSO AI Cybersecurity Platform  
**Location:** Coimbatore, Tamil Nadu, India

### **Technologies Used**
- **Backend:** Python, FastAPI, Uvicorn
- **Frontend:** React, TypeScript, Tailwind CSS
- **3D Graphics:** Three.js, React Three Fiber
- **Hardware:** ESP32 WROOM-32, Arduino IDE
- **AI:** OpenRouter, Google Gemini
- **Database:** SQLite, Supabase (optional)
- **Deployment:** Node.js, PowerShell automation

---

## 🔗 **Links**

- **Live Demo:** [Coming Soon]
- **Documentation:** [API Docs](http://192.168.1.100:8000/docs)
- **Issues:** [GitHub Issues](https://github.com/your-repo/issues)
- **Contact:** contact@xzso.ai

---

*Built with ❤️ for the cybersecurity community*