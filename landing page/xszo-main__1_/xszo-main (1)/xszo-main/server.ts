import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { 
  DeviceStatus, 
  AttackEvent, 
  AIThreatReport, 
  SOCStats, 
  AuditLog, 
  SeverityLevel 
} from "./src/types.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Allow overriding the port via environment (useful when 3000 is occupied)
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Body parser
app.use(express.json());

// In-Memory Database (RAM storage only, as requested)
const devices: Map<string, DeviceStatus> = new Map();
const attacks: AttackEvent[] = [];
const auditLogs: AuditLog[] = [];
const blockedIPs: Set<string> = new Set();

// Helper to push audit logs
function logEvent(level: 'INFO' | 'WARNING' | 'ERROR' | 'SECURITY', source: string, message: string) {
  const newLog: AuditLog = {
    id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    level,
    source,
    message
  };
  auditLogs.unshift(newLog);
  if (auditLogs.length > 500) auditLogs.pop(); // Cap log history size
  broadcastToWS("logs", newLog);
}

// Initialise Simulated Devices
const seedDevices = () => {
  const d1: DeviceStatus = {
    chipId: "ESP32_A8F932",
    deviceName: "ESP32-HONEY-PRIMARY",
    firmwareVersion: "v1.4.2-stable",
    macAddress: "24:0A:C4:A8:F9:32",
    ipAddress: "192.168.1.150",
    status: "Online",
    wifiRssi: -62,
    cpuUsage: 14,
    ramUsage: 42,
    honeypotEnabled: true,
    lastSeen: new Date().toISOString()
  };
  
  const d2: DeviceStatus = {
    chipId: "ESP32_74B211",
    deviceName: "ESP32-HONEY-DMZ",
    firmwareVersion: "v1.4.2-stable",
    macAddress: "24:0A:C4:74:B2:11",
    ipAddress: "10.0.10.45",
    status: "Online",
    wifiRssi: -71,
    cpuUsage: 8,
    ramUsage: 39,
    honeypotEnabled: true,
    lastSeen: new Date().toISOString()
  };

  devices.set(d1.chipId, d1);
  devices.set(d2.chipId, d2);
  logEvent('INFO', 'SYSTEM', 'Seeded initial simulated HoneyBot devices');
};

// Seed initial attacks with rich threat history
const seedAttacks = () => {
  const countries = [
    { country: "Russia", code: "RU", ip: "45.143.203.14" },
    { country: "China", code: "CN", ip: "103.87.210.15" },
    { country: "Germany", code: "DE", ip: "185.220.101.5" },
    { country: "United States", code: "US", ip: "198.51.100.42" },
    { country: "Netherlands", code: "NL", ip: "82.102.23.45" }
  ];

  const services = [
    { port: 22, proto: "SSH", service: "Dropbear SSH 2022" },
    { port: 3306, proto: "MySQL", service: "MySQL 8.0.25-community" },
    { port: 23, proto: "Telnet", service: "Telnetd Linux Busybox" },
    { port: 80, proto: "HTTP", service: "Nginx 1.18.0" },
    { port: 6379, proto: "Redis", service: "Redis Key-Value 6.2.1" }
  ];

  const attackTypes = ["Credential Brute Force", "SQL Injection", "Scanner Probe", "Exploit Attempt", "Command Execution"];
  const severities: SeverityLevel[] = ["Medium", "High", "Critical"];

  for (let i = 0; i < 25; i++) {
    const rCountry = countries[Math.floor(Math.random() * countries.length)];
    const rService = services[Math.floor(Math.random() * services.length)];
    const chipId = Math.random() > 0.5 ? "ESP32_A8F932" : "ESP32_74B211";
    const dev = devices.get(chipId);
    
    const timestamp = new Date(Date.now() - (25 - i) * 10 * 60 * 1000).toISOString();
    
    const attack: AttackEvent = {
      id: `ATK-${Date.now() - (25 - i) * 600000}-${Math.floor(Math.random() * 1000)}`,
      chipId,
      deviceName: dev?.deviceName || "Simulated HoneyBot",
      sourceIP: rCountry.ip,
      country: rCountry.country,
      countryCode: rCountry.code,
      destPort: rService.port,
      protocol: rService.proto,
      payload: `ATTACK ATTEMPT ON ${rService.service} - Payload signature #${i * 13}`,
      connectionCount: Math.floor(Math.random() * 8) + 1,
      timestamp,
      aiAnalyzed: true,
      analysis: generateRuleBasedAnalysis(rService.port, rCountry.ip, `Payload signature #${i * 13}`)
    };

    attacks.push(attack);
  }
  
  logEvent('INFO', 'SYSTEM', 'Seeded initial cyber attack telemetry database (in-memory)');
};

// WebSocket client sets
const wsClients = new Set<WebSocket>();

// Seeding DB on start
seedDevices();
seedAttacks();

// Blocklist Seeding
blockedIPs.add("203.0.113.88");
blockedIPs.add("198.51.100.99");

// AI client setup
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    logEvent('INFO', 'AI_ENGINE', 'Gemini AI Threat Analyzer loaded successfully with API key.');
  } catch (error: any) {
    console.error("Gemini init error:", error);
    logEvent('ERROR', 'AI_ENGINE', 'Failed to initialize Gemini Client: ' + error.message);
  }
} else {
  logEvent('WARNING', 'AI_ENGINE', 'No GEMINI_API_KEY environment variable. SOC platform is running in local rule-based hybrid heuristic analyzer mode.');
}

// Global rule-based backup threat analyzer (highly detailed as requested!)
function generateRuleBasedAnalysis(port: number, sourceIP: string, payload: string): AIThreatReport {
  let attackType = "Network Vulnerability Scan";
  let threatScore = 45;
  let severity: SeverityLevel = "Medium";
  let confidence = 85;
  let summary = `External client at ${sourceIP} scanned port ${port}. No exploit payload detected.`;
  let mitreAttack = "T1046: Network Service Discovery";
  let possibleCve = "N/A";
  let firewallRule = `iptables -A INPUT -s ${sourceIP} -j DROP`;
  let yaraRule = "rule Network_Scan_Generic { strings: $scan = /scan/i condition: $scan }";
  let sigmaRule = "title: Generic Port Scan\\nstatus: production\\nlogsource:\\n  product: linux\\n  service: iptables\\ndetection:\\n  selection:\\n    dst_port: " + port + "\\n  condition: selection";
  let snortRule = `alert tcp ${sourceIP} any -> any ${port} (msg:"Generic scanning probe"; sid:1000001; rev:1;)`;
  let suricataRule = `alert tcp ${sourceIP} any -> any ${port} (msg:"SURICATA Port Scan detected"; flow:stateless; flags:S; threshold:type both, track by_src, count 10, seconds 2; classtype:attempted-recon; sid:2000001;)`;
  let recommendations = [
    "Verify if service is exposed to the public Internet unnecessarily.",
    "Implement rate limiting on incoming connection attempts.",
    "Confirm firmware updates are fully patched on the firewall/ingress gateway."
  ];
  let incidentSummary = "Passive scanning activity targeting infrastructure services to identify entry points.";
  let riskRating: SeverityLevel = "Medium";

  switch (port) {
    case 22:
      attackType = "SSH Bruteforce Attack";
      threatScore = 78;
      severity = "High";
      summary = `SSH credential brute-force attempt targeting Secure Shell daemon. Multiple failed authentication attempts logged.`;
      mitreAttack = "T1110.001: Brute Force (Password Guessing)";
      possibleCve = "CVE-2018-15473 (SSH Username Enumeration)";
      firewallRule = `iptables -I INPUT -p tcp --dport 22 -s ${sourceIP} -m state --state NEW -m recent --set\\niptables -I INPUT -p tcp --dport 22 -s ${sourceIP} -m state --state NEW -m recent --update --seconds 60 --hitcount 4 -j DROP`;
      yaraRule = `rule SSH_Bruteforce_Attempt {
  meta:
    description = "Detects SSH password guessing tools"
    severity = "High"
  strings:
    $ssh_ssh = "SSH-2.0-"
    $libssh = "libssh"
  condition:
    $ssh_ssh and $libssh
}`;
      sigmaRule = `title: SSH Bruteforce Detected
status: production
logsource:
  product: linux
  service: auth
detection:
  selection:
    message|contains: 'Failed password for invalid user'
  condition: selection`;
      snortRule = `alert tcp ${sourceIP} any -> any 22 (msg:"SSH brute force password attempt"; flow:to_server,established; content:"Failed password for"; threshold:type threshold, track by_src, count 5, seconds 30; sid:1000022; rev:1;)`;
      suricataRule = `alert tcp ${sourceIP} any -> any 22 (msg:"SURICATA SSH brute force attempt"; flow:established,to_server; content:"SSH-2.0"; threshold:type limit, track by_src, count 1, seconds 10; sid:2000022;)`;
      recommendations = [
        "Block the source IP address immediately on the perimeter firewall.",
        "Disable root password login and enforce SSH Key-Based Authentication.",
        "Change default SSH listening port 22 to a non-standard port."
      ];
      incidentSummary = "Persistent authentication scanner testing credentials. Risk of administrative compromise.";
      riskRating = "High";
      break;

    case 3306:
      attackType = "MySQL Database Exploitation Probe";
      threatScore = 85;
      severity = "High";
      summary = `Unauthenticated handshake requests attempting SQL user bypass on MySQL service on port 3306.`;
      mitreAttack = "T1190: Exploit Public-Facing Application";
      possibleCve = "CVE-2012-2122 (MySQL Authentication Bypass)";
      firewallRule = `iptables -A INPUT -p tcp --dport 3306 -s ${sourceIP} -j DROP`;
      yaraRule = `rule MySQL_Auth_Bypass_CVE_2012_2122 {
  meta:
    description = "Detects MySQL protocol auth bypass exploit payload"
  strings:
    $mysql_payload = { 0a 00 00 01 08 00 00 00 00 00 00 00 }
  condition:
    $mysql_payload
}`;
      sigmaRule = `title: MySQL Remote Connection Attempt
logsource:
  product: database
  service: mysql
detection:
  selection:
    event_id: 'Access denied for user'
  condition: selection`;
      snortRule = `alert tcp ${sourceIP} any -> any 3306 (msg:"MySQL authentication failure brute force"; flow:to_server,established; content:"Access denied"; sid:1000306; rev:1;)`;
      suricataRule = `alert tcp ${sourceIP} any -> any 3306 (msg:"SURICATA MySQL Remote Root Exploit Attempt"; flow:established,to_server; content:"|00 00 00 01 08|"; sid:2000306;)`;
      recommendations = [
        "Restructure network access lists: restrict database ingress solely to trusted app servers.",
        "Enforce strict SSL/TLS encryption for database communication.",
        "Audit existing database users for weak passwords."
      ];
      incidentSummary = "Active exploit probe searching for vulnerable database endpoints. Immediate attention required to shield backend data.";
      riskRating = "High";
      break;

    case 23:
      attackType = "Mirai Botnet Telnet propagation Scan";
      threatScore = 92;
      severity = "Critical";
      summary = `Incoming Telnet request using hardcoded Mirai botnet password lists. Searching for default busybox accounts.`;
      mitreAttack = "T1584.005: Compromise Infrastructure (Botnet Recruitment)";
      possibleCve = "CVE-2016-10372 (BusyBox Telnetd vulnerability)";
      firewallRule = `iptables -A INPUT -p tcp --dport 23 -s ${sourceIP} -j DROP`;
      yaraRule = `rule Mirai_Telnet_Botnet_Logins {
  meta:
    description = "Detects Mirai router credentials in Telnet stream"
  strings:
    $u1 = "root"
    $u2 = "admin"
    $p1 = "xc3511"
    $p2 = "vizxv"
  condition:
    ($u1 or $u2) and ($p1 or $p2)
}`;
      sigmaRule = `title: IoT Botnet Telnet Propagation activity
logsource:
  product: linux
  service: telnet
detection:
  selection:
    message|contains: 'Login failed for user'
  condition: selection`;
      snortRule = `alert tcp ${sourceIP} any -> any 23 (msg:"Mirai Botnet login pattern"; flow:to_server,established; content:"root"; content:"xc3511"; sid:1000023; rev:1;)`;
      suricataRule = `alert tcp ${sourceIP} any -> any 23 (msg:"SURICATA Telnet Attack - Default Credentials"; flow:established,to_server; content:"admin"; content:"vizxv"; sid:2000023;)`;
      recommendations = [
        "Permanently disable Telnet protocol across all endpoints in the ecosystem.",
        "Implement secure, encrypted SSH connections for any system configuration requirements.",
        "Configure network routing rules to dump all ingress traffic headed for TCP port 23."
      ];
      incidentSummary = "Automated IoT worm scanner attempting to recruit the device into a global DDoS botnet swarm.";
      riskRating = "Critical";
      break;

    case 80:
    case 443:
      attackType = "SQL Injection Web Exploitation Attempt";
      threatScore = 80;
      severity = "High";
      summary = `HTTP request containing SQL injection payload aiming to breach backend server. Target: '${payload.substring(0, 40)}...'`;
      mitreAttack = "T1190: Exploit Public-Facing Application (SQL Injection)";
      possibleCve = "CVE-2021-44228 (Log4j / general injection vectors)";
      firewallRule = `iptables -A INPUT -p tcp -m multiport --dports 80,443 -s ${sourceIP} -j DROP`;
      yaraRule = `rule SQL_Injection_HTTP_Payload {
  strings:
    $sql1 = "UNION SELECT"
    $sql2 = "OR 1=1"
    $sql3 = "' OR '"
  condition:
    any of them
}`;
      sigmaRule = `title: Web Application SQL Injection Attack
logsource:
  product: webserver
  service: nginx
detection:
  selection:
    request|contains:
      - 'union select'
      - 'or 1=1'
  condition: selection`;
      snortRule = `alert tcp ${sourceIP} any -> any 80 (msg:"HTTP SQL Injection Attempt"; flow:to_server,established; content:"UNION"; content:"SELECT"; nocase; sid:1000080; rev:1;)`;
      suricataRule = `alert tcp ${sourceIP} any -> any 80 (msg:"SURICATA HTTP SQLi Injection bypass pattern"; flow:established,to_server; content:"' OR 1=1 --"; nocase; sid:2000080;)`;
      recommendations = [
        "Deploy a Web Application Firewall (WAF) to inspect HTTP/HTTPS packets.",
        "Implement parameterized SQL queries / ORMs and thoroughly sanitize all client inputs.",
        "Ensure HTTP server returns generic error messages instead of raw DB stacks."
      ];
      incidentSummary = "Targeted exploit attempt aiming to read, manipulate, or delete operational data through malicious queries.";
      riskRating = "High";
      break;

    case 445:
      attackType = "EternalBlue SMB exploit Scan";
      threatScore = 95;
      severity = "Critical";
      summary = `SMB network probe targeting vulnerable Windows/Linux Samba services on port 445. EternalBlue exploit pattern detected.`;
      mitreAttack = "T1210: Exploitation of Remote Services";
      possibleCve = "CVE-2017-0144 (MS17-010 EternalBlue)";
      firewallRule = `iptables -A INPUT -p tcp --dport 445 -s ${sourceIP} -j DROP`;
      yaraRule = `rule MS17_010_EternalBlue_SMB {
  strings:
    $eternal = { FF 53 4D 42 72 00 00 00 00 18 53 C8 00 00 }
  condition:
    $eternal
}`;
      sigmaRule = `title: EternalBlue Exploitation Attempt
logsource:
  product: windows
  service: security
detection:
  selection:
    EventID: 5140
    ShareName: IPC$
  condition: selection`;
      snortRule = `alert tcp ${sourceIP} any -> any 445 (msg:"SMB EternalBlue exploit attack"; flow:to_server,established; content:"|FF 53 4D 42 72|"; sid:1000445; rev:1;)`;
      suricataRule = `alert tcp ${sourceIP} any -> any 445 (msg:"SURICATA SMB Exploit MS17-010 Attempt"; flow:established,to_server; content:"|FF 53 4D 42|"; sid:2000445;)`;
      recommendations = [
        "Immediately disable SMB version 1 protocol globally on the host operating systems.",
        "Strictly isolate TCP port 445 to prevent lateral movement on internal network segments.",
        "Apply standard vendor security patches (MS17-010 or equivalent Samba patches)."
      ];
      incidentSummary = "Worm-like exploit payload seeking to gain SYSTEM level remote execution rights over the network interface.";
      riskRating = "Critical";
      break;
  }

  return {
    attackType,
    threatScore,
    severity,
    confidence,
    summary,
    mitreAttack,
    possibleCve,
    firewallRule,
    yaraRule,
    sigmaRule,
    snortRule,
    suricataRule,
    recommendations,
    incidentSummary,
    riskRating
  };
}

// Helper to robustly clean and parse JSON strings returned from Gemini, resolving bad control character errors
function sanitizeJSONControlChars(str: string): string {
  let inString = false;
  let result = "";
  let escapeNext = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (escapeNext) {
      result += char;
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      result += char;
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }

    if (inString) {
      if (char === '\n') {
        result += "\\n";
      } else if (char === '\r') {
        result += "\\r";
      } else if (char === '\t') {
        result += "\\t";
      } else {
        const code = char.charCodeAt(0);
        if (code < 32) {
          result += "\\u" + code.toString(16).padStart(4, '0');
        } else {
          result += char;
        }
      }
    } else {
      result += char;
    }
  }

  return result;
}

function cleanAndParseJSON(text: string): any {
  let cleaned = text.trim();
  
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    try {
      const sanitized = sanitizeJSONControlChars(cleaned);
      return JSON.parse(sanitized);
    } catch (innerErr) {
      throw err;
    }
  }
}

// AI Threat analysis orchestrator (Queries Gemini, falls back seamlessly to rule-based)
async function analyzeAttackAI(port: number, sourceIP: string, protocol: string, payload: string): Promise<AIThreatReport> {
  if (!aiClient) {
    // Return high quality rule-based response
    return generateRuleBasedAnalysis(port, sourceIP, payload);
  }

  const prompt = `Analyze the following honeypot security alert:
- Source IP: ${sourceIP}
- Destination Port: ${port}
- Protocol: ${protocol}
- Capture Payload: ${payload || 'No raw payload available'}

Generate a structured security analysis report. Keep strings on a single line where possible.`;

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert AI Cyber Security incident responder, YARA/Snort rule writer, and MITRE analyst. Analyze the raw attack logs from a virtual honeypot and return a precise JSON threat analysis matching the requested structure. Respond only with a raw, valid JSON object.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            attackType: { type: Type.STRING },
            threatScore: { type: Type.INTEGER },
            severity: { 
              type: Type.STRING, 
              enum: ["Low", "Medium", "High", "Critical"] 
            },
            confidence: { type: Type.INTEGER },
            summary: { type: Type.STRING },
            mitreAttack: { type: Type.STRING },
            possibleCve: { type: Type.STRING },
            firewallRule: { type: Type.STRING },
            yaraRule: { type: Type.STRING },
            sigmaRule: { type: Type.STRING },
            snortRule: { type: Type.STRING },
            suricataRule: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            incidentSummary: { type: Type.STRING },
            riskRating: { 
              type: Type.STRING, 
              enum: ["Low", "Medium", "High", "Critical"] 
            }
          },
          required: [
            "attackType", "threatScore", "severity", "confidence", "summary", 
            "mitreAttack", "possibleCve", "firewallRule", "yaraRule", "sigmaRule", 
            "snortRule", "suricataRule", "recommendations", "incidentSummary", "riskRating"
          ]
        },
        temperature: 0.2
      }
    });

    const text = response.text || "";
    if (text.trim()) {
      const parsed: AIThreatReport = cleanAndParseJSON(text);
      logEvent('INFO', 'AI_ENGINE', `AI Threat analysis successfully completed for attack source ${sourceIP} port ${port}`);
      return parsed;
    } else {
      throw new Error("Empty response text from Gemini API");
    }
  } catch (error: any) {
    console.error("Gemini threat analysis failed. Falling back to Rule-Based engine.", error);
    logEvent('WARNING', 'AI_ENGINE', `Gemini AI analysis failed (${error.message}). Reverted to Rule-Based Threat Analyzer.`);
    return generateRuleBasedAnalysis(port, sourceIP, payload);
  }
}

// Broadcast helper for WebSocket subscribers
function broadcastToWS(channel: string, payload: any) {
  const data = JSON.stringify({ channel, data: payload });
  wsClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// --- REST API ENDPOINTS ---

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString(), aiOnline: !!aiClient });
});

// Authentication Admin login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin") {
    logEvent('SECURITY', 'AUTHENTICATION', 'Admin user authenticated successfully.');
    res.json({
      success: true,
      token: "cyber-eye-soc-session-token-2026",
      user: { username: "admin", role: "SOC Manager" }
    });
  } else {
    logEvent('SECURITY', 'AUTHENTICATION', `Failed login attempt. Username: ${username}`);
    res.status(401).json({ success: false, message: "Invalid credentials. Hint: admin/admin" });
  }
});

app.post("/api/logout", (req, res) => {
  logEvent('SECURITY', 'AUTHENTICATION', 'Admin logged out.');
  res.json({ success: true });
});

// Dashboard Statistics Overview
app.get("/api/dashboard", (req, res) => {
  const totalAttacks = attacks.length;
  const liveConnections = Math.floor(Math.random() * 5) + 2; // Simulated fluctuating live connections
  const averageThreatScore = Math.round(attacks.reduce((acc, curr) => acc + (curr.analysis?.threatScore || 0), 0) / (totalAttacks || 1));
  const blockedIPsCount = blockedIPs.size;
  const onlineDevicesCount = Array.from(devices.values()).filter(d => d.status === "Online").length;

  const stats: SOCStats = {
    totalAttacks,
    liveConnections,
    averageThreatScore,
    blockedIPsCount,
    onlineDevicesCount
  };

  res.json(stats);
});

// Live Attack Feed with filters, search and sorting
app.get("/api/attacks", (req, res) => {
  const { severity, protocol, port, search } = req.query;
  let filtered = [...attacks];

  if (severity) {
    filtered = filtered.filter(a => a.analysis?.severity === severity);
  }
  if (protocol) {
    filtered = filtered.filter(a => a.protocol === protocol);
  }
  if (port) {
    filtered = filtered.filter(a => a.destPort === parseInt(port as string, 10));
  }
  if (search) {
    const s = (search as string).toLowerCase();
    filtered = filtered.filter(a => 
      a.sourceIP.toLowerCase().includes(s) || 
      a.country.toLowerCase().includes(s) || 
      a.payload.toLowerCase().includes(s) ||
      (a.analysis?.attackType || '').toLowerCase().includes(s)
    );
  }

  // Sort newest first
  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json(filtered);
});

// Individual Attack Incident Details
app.get("/api/attack/:id", (req, res) => {
  const attack = attacks.find(a => a.id === req.params.id);
  if (!attack) {
    return res.status(404).json({ error: "Attack incident not found" });
  }
  res.json(attack);
});

// Block or Unblock IPs
app.post("/api/attacks/block", (req, res) => {
  const { ip, block } = req.body;
  if (!ip) return res.status(400).json({ error: "IP address is required" });

  if (block) {
    blockedIPs.add(ip);
    logEvent('SECURITY', 'FIREWALL', `Source IP: ${ip} added to perimeter firewall blocked ACL list.`);
  } else {
    blockedIPs.delete(ip);
    logEvent('SECURITY', 'FIREWALL', `Source IP: ${ip} unblocked and whitelisted.`);
  }
  broadcastToWS("alerts", { type: block ? "IP_BLOCKED" : "IP_UNBLOCKED", ip });
  res.json({ success: true, ip, blocked: blockedIPs.has(ip), count: blockedIPs.size });
});

app.get("/api/attacks/blocked-ips", (req, res) => {
  res.json(Array.from(blockedIPs));
});

// System logs
app.get("/api/logs", (req, res) => {
  res.json(auditLogs);
});

// Analytics charts API
app.get("/api/analytics", (req, res) => {
  // Protocol breakdown
  const protocols: { [key: string]: number } = {};
  // Severity breakdown
  const severities = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  // Port frequency
  const ports: { [key: number]: number } = {};
  // Timeline: attacks over last 24 hours grouped by hour
  const timeline: { [hour: string]: number } = {};

  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hourKey = d.toLocaleTimeString([], { hour: '2-digit', hour12: false });
    timeline[hourKey] = 0;
  }

  attacks.forEach(a => {
    protocols[a.protocol] = (protocols[a.protocol] || 0) + 1;
    if (a.analysis) {
      severities[a.analysis.severity] += 1;
    }
    ports[a.destPort] = (ports[a.destPort] || 0) + 1;

    // Timeline match
    const aDate = new Date(a.timestamp);
    const aHour = aDate.toLocaleTimeString([], { hour: '2-digit', hour12: false });
    if (timeline[aHour] !== undefined) {
      timeline[aHour] += 1;
    }
  });

  res.json({
    protocols,
    severities,
    ports,
    timeline: Object.keys(timeline).map(hour => ({ hour, count: timeline[hour] }))
  });
});

// Device Registration & Heartbeat (ESP32 Endpoint)
app.post("/api/device/register", (req, res) => {
  const { chipId, deviceName, firmwareVersion, macAddress, ipAddress } = req.body;
  if (!chipId) return res.status(400).json({ error: "chipId is required" });

  const existing = devices.get(chipId);
  const newDevice: DeviceStatus = {
    chipId,
    deviceName: deviceName || existing?.deviceName || `ESP32-Honey-${chipId.slice(-4)}`,
    firmwareVersion: firmwareVersion || "v1.0.0",
    macAddress: macAddress || "00:00:00:00:00:00",
    ipAddress: ipAddress || "127.0.0.1",
    status: "Online",
    wifiRssi: -50,
    cpuUsage: 10,
    ramUsage: 35,
    honeypotEnabled: existing ? existing.honeypotEnabled : true,
    lastSeen: new Date().toISOString()
  };

  devices.set(chipId, newDevice);
  logEvent('INFO', 'DEVICE', `New HoneyBot Registered: ${newDevice.deviceName} (ID: ${chipId}) from IP ${newDevice.ipAddress}`);
  broadcastToWS("device", { type: "DEVICE_REGISTERED", device: newDevice });
  res.json({ success: true, message: "ESP32 HoneyBot registered successfully", device: newDevice });
});

app.post("/api/device/heartbeat", (req, res) => {
  const { chipId, wifiRssi, cpuUsage, ramUsage } = req.body;
  if (!chipId) return res.status(400).json({ error: "chipId is required" });

  const device = devices.get(chipId);
  if (!device) {
    return res.status(404).json({ error: "Device not registered" });
  }

  device.status = "Online";
  device.wifiRssi = wifiRssi ?? device.wifiRssi;
  device.cpuUsage = cpuUsage ?? device.cpuUsage;
  device.ramUsage = ramUsage ?? device.ramUsage;
  device.lastSeen = new Date().toISOString();

  devices.set(chipId, device);
  broadcastToWS("device", { type: "DEVICE_HEARTBEAT", device });
  res.json({ success: true, honeypotEnabled: device.honeypotEnabled });
});

// Receive Attack Telemetry Event directly from ESP32
app.post("/api/device/event", async (req, res) => {
  const { chipId, sourceIP, destPort, protocol, payload, connectionCount } = req.body;
  if (!chipId || !sourceIP || !destPort || !protocol) {
    return res.status(400).json({ error: "Missing required telemetry values (chipId, sourceIP, destPort, protocol)" });
  }

  // Map IP to mock countries for visual dashboard maps
  const countryPool = [
    { name: "Russia", code: "RU" },
    { name: "China", code: "CN" },
    { name: "Germany", code: "DE" },
    { name: "Netherlands", code: "NL" },
    { name: "United States", code: "US" },
    { name: "Ukraine", code: "UA" },
    { name: "Brazil", code: "BR" },
    { name: "South Korea", code: "KR" },
    { name: "Iran", code: "IR" },
    { name: "North Korea", code: "KP" }
  ];

  // Derive static country based on IP octets to maintain consistency
  const lastOctet = parseInt(sourceIP.split('.').pop() || "0", 10);
  const countryObj = countryPool[lastOctet % countryPool.length];

  const device = devices.get(chipId);
  const deviceName = device ? device.deviceName : `Unknown ESP32-SOC`;

  // Check if IP is in blocklist
  if (blockedIPs.has(sourceIP)) {
    logEvent('SECURITY', 'FIREWALL', `Blocked incoming honeypot traffic on port ${destPort} from blocked IP: ${sourceIP}`);
    return res.json({ success: false, reason: "IP is in Firewall blocked ACL lists." });
  }

  logEvent('WARNING', 'HONEYPOT', `Intrusion alert from device [${deviceName}]: ${sourceIP} -> port ${destPort} (${protocol})`);

  // Analyze the attack using AI Thread Analyzer (or Rule-Based fallback)
  const analysis = await analyzeAttackAI(destPort, sourceIP, protocol, payload || "");

  const newAttack: AttackEvent = {
    id: `ATK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    chipId,
    deviceName,
    sourceIP,
    country: countryObj.name,
    countryCode: countryObj.code,
    destPort,
    protocol,
    payload: payload || "No raw buffer capture",
    connectionCount: connectionCount || 1,
    timestamp: new Date().toISOString(),
    aiAnalyzed: true,
    analysis
  };

  attacks.unshift(newAttack);
  if (attacks.length > 1000) attacks.pop(); // Prevent memory overflow (RAM-only store)

  // Broadcast to WebSockets
  broadcastToWS("attacks", newAttack);
  
  // Also send brief Alert message
  broadcastToWS("alerts", {
    type: "NEW_ATTACK",
    message: `CRITICAL ALERT: [${analysis.attackType}] detected on port ${destPort} from ${sourceIP} (${countryObj.name}). AI Threat Score: ${analysis.threatScore}`,
    attack: newAttack
  });

  res.json({ success: true, incidentId: newAttack.id, threatScore: analysis.threatScore, action: "logged" });
});

// Device management endpoints
app.get("/api/device/status", (req, res) => {
  res.json(Array.from(devices.values()));
});

app.post("/api/device/restart", (req, res) => {
  const { chipId } = req.body;
  if (!chipId) return res.status(400).json({ error: "chipId is required" });

  const device = devices.get(chipId);
  if (!device) return res.status(404).json({ error: "Device not found" });

  logEvent('INFO', 'DEVICE', `Remote restart instruction transmitted to HoneyBot device: ${device.deviceName}`);
  
  device.status = "Offline";
  device.cpuUsage = 0;
  device.ramUsage = 0;
  devices.set(chipId, device);
  
  broadcastToWS("device", { type: "DEVICE_RESTART", chipId });

  // Simulate reconnecting device after 5 seconds
  setTimeout(() => {
    const d = devices.get(chipId);
    if (d) {
      d.status = "Online";
      d.cpuUsage = 12;
      d.ramUsage = 38;
      d.lastSeen = new Date().toISOString();
      devices.set(chipId, d);
      logEvent('INFO', 'DEVICE', `HoneyBot device ${d.deviceName} recovered and rejoined the network after remote reset cycle.`);
      broadcastToWS("device", { type: "DEVICE_HEARTBEAT", device: d });
    }
  }, 5000);

  res.json({ success: true, message: `Restart request sent to device ${device.deviceName}` });
});

app.post("/api/device/toggle-honeypot", (req, res) => {
  const { chipId, enabled } = req.body;
  if (!chipId) return res.status(400).json({ error: "chipId is required" });

  const device = devices.get(chipId);
  if (!device) return res.status(404).json({ error: "Device not found" });

  device.honeypotEnabled = enabled;
  devices.set(chipId, device);

  logEvent('WARNING', 'DEVICE', `Honeypot fake services turned ${enabled ? 'ON' : 'OFF'} on device ${device.deviceName}`);
  broadcastToWS("device", { type: "DEVICE_HEARTBEAT", device });

  res.json({ success: true, device });
});

// Generate Executive Report
app.get("/api/report", (req, res) => {
  const total = attacks.length;
  if (total === 0) {
    return res.json({
      executiveSummary: "No attacks recorded yet. System state is currently idle.",
      recommendations: ["Ensure ESP32 devices are powered and properly routed."],
      timestamp: new Date().toISOString()
    });
  }

  // Count by severity
  const severityCounts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  attacks.forEach(a => {
    if (a.analysis) severityCounts[a.analysis.severity]++;
  });

  // Most targeted ports
  const portFreq: { [key: number]: number } = {};
  attacks.forEach(a => portFreq[a.destPort] = (portFreq[a.destPort] || 0) + 1);
  const mostTargetedPort = Object.keys(portFreq).reduce((a, b) => portFreq[parseInt(a)] > portFreq[parseInt(b)] ? a : b, "N/A");

  // Top malicious IPs
  const ipFreq: { [key: string]: number } = {};
  attacks.forEach(a => ipFreq[a.sourceIP] = (ipFreq[a.sourceIP] || 0) + 1);
  const topAttackingIP = Object.keys(ipFreq).reduce((a, b) => ipFreq[a] > ipFreq[b] ? a : b, "N/A");

  const recommendations = [
    "Deploy perimeter firewall rules blocking top attacking IP subnet pools.",
    "Upgrade firmware on exposed gateway endpoints.",
    "Implement network segmentation for administrative protocols (SSH/RDP).",
    "Enable adaptive rate limiting on SSH and DB ingress interfaces."
  ];

  res.json({
    executiveSummary: `This executive threat analysis summary details ${total} logged cyber intrusions recorded by the CYBER-EYE honeypot node net. AI intelligence reports that ${severityCounts.Critical} attacks are categorized as Critical threats, while ${severityCounts.High} are tagged with High severity. The chief intrusion vector centers on TCP Port ${mostTargetedPort}.`,
    technicalDetails: {
      totalAttacksLogged: total,
      criticalIncidents: severityCounts.Critical,
      highSeverityIncidents: severityCounts.High,
      primaryIntrusionVector: `Port ${mostTargetedPort}`,
      primaryThreatActorIP: topAttackingIP,
      highestThreatActorIntensity: ipFreq[topAttackingIP] || 0,
      reportingSensors: Array.from(devices.values()).map(d => d.deviceName).join(", ")
    },
    threatDistribution: severityCounts,
    recommendations,
    generatedAt: new Date().toISOString()
  });
});

// Custom payload AI analysis endpoint
app.post("/api/ai/analyze-custom", async (req, res) => {
  const { payload, protocol, destPort, sourceIP } = req.body;
  const port = destPort ? parseInt(destPort, 10) : 80;
  const ip = sourceIP || "8.8.8.8";
  const proto = protocol || "TCP";
  const rawPayload = payload || "";

  try {
    const analysis = await analyzeAttackAI(port, ip, proto, rawPayload);
    res.json({ success: true, analysis });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Interactive SOC Analyst Chat endpoint
app.post("/api/ai/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Build contextual background for the AI about the SOC environment
  const onlineDevices = Array.from(devices.values()).filter(d => d.status === "Online").map(d => d.deviceName).join(", ");
  const recentAttackTypes = attacks.slice(0, 10).map(a => `${a.analysis?.attackType} on Port ${a.destPort} from ${a.sourceIP} (${a.country})`).join("\n");

  const socContext = `
You are the "CYBER-EYE AI Specialist", an elite, senior cybersecurity operations center (SOC) analyst and incident response AI.
Current SOC Status:
- Total logged honeypot intrusion alerts: ${attacks.length}
- Blocked IPs count in firewall ACL: ${blockedIPs.size}
- Active online HoneyBot nodes: ${onlineDevices || "None"}
- Average threat rating: ${Math.round(attacks.reduce((acc, curr) => acc + (curr.analysis?.threatScore || 0), 0) / (attacks.length || 1))} / 100

Recent 10 Attacks:
${recentAttackTypes || "No attacks recorded yet."}

Respond professionally, directly, and informatively. Avoid unnecessary fluff or generic marketing jargon. Focus on practical defense, mitigation steps, security signatures (such as YARA/Sigma/Snort rule syntax), or specific technical answers about ports and protocol exploits.
`;

  if (!aiClient) {
    // High quality fallback local expert chatbot
    let reply = "I am currently running in Local SOC Rule Heuristics mode because no GEMINI_API_KEY is active. However, I can analyze your query: ";
    const lowercase = message.toLowerCase();
    if (lowercase.includes("mirai") || lowercase.includes("port 23") || lowercase.includes("telnet")) {
      reply += "\n\n**Mirai Botnet Mitigation Protocol (Port 23 / Telnet):**\n1. **Disable Telnet:** It transmits all credentials in cleartext. Transition immediately to SSH (Port 22) with PKI certificate authentication.\n2. **Firewall ACL Block:** Implement a dropping firewall rule for the target attacker IPs:\n   `iptables -A INPUT -p tcp --dport 23 -j DROP`\n3. **Default Credentials Audit:** Mirai relies entirely on default manufacturer credentials (e.g., admin/admin, guest/12345). Reset all edge device passwords.";
    } else if (lowercase.includes("ssh") || lowercase.includes("port 22") || lowercase.includes("brute")) {
      reply += "\n\n**SSH Brute Force Mitigation:**\n1. **Enforce Public Key Authentication:** Disable password authentication in \`/etc/ssh/sshd_config\` by setting \`PasswordAuthentication no\`.\n2. **Deploy Fail2ban:** Monitor auth logs and dynamically block source IPs exceeding failed attempts.\n3. **Non-standard Port:** Shift SSH service to a high range port (e.g. TCP 2222) to avoid generic scanners.";
    } else if (lowercase.includes("sql") || lowercase.includes("injection") || lowercase.includes("db") || lowercase.includes("mysql")) {
      reply += "\n\n**SQL Injection Prevention playbook:**\n1. **Parameterized Queries:** Never concatenate user input directly into SQL strings. Use prepared statements or modern ORMs.\n2. **Web Application Firewall (WAF):** Place a WAF like ModSecurity in front of port 80/443 to dynamically inspect incoming HTTP parameters for injection payloads.\n3. **Least Privilege access:** Ensure database application users only have permissions required for their specific function (e.g. SELECT, INSERT) and cannot execute administrative commands.";
    } else if (lowercase.includes("status") || lowercase.includes("attacks") || lowercase.includes("threat")) {
      reply += `\n\n**CYBER-EYE SOC Dashboard Summary:**\n- We have logged **${attacks.length} total attacks**.\n- There are **${blockedIPs.size} blocked IPs** active on the firewall.\n- **${Array.from(devices.values()).filter(d => d.status === "Online").length} HoneyBot sensors** are online transmitting real-time socket events.\n- Primary active vectors target port 22 (SSH), port 23 (Telnet), port 3306 (MySQL), and port 445 (SMB).`;
    } else {
      reply += "\n\nBased on heuristic analytics, security threats should be isolated at the network perimeter. Configure ACL rules on edge nodes, inspect payload headers for signature matching, and ensure all firmware packages are fully updated. If you activate a \`GEMINI_API_KEY\` in the Settings menu, I can provide direct generative intelligence answers.";
    }
    return res.json({ success: true, reply });
  }

  try {
    // Construct chat contents array including history
    const contents: any[] = [];
    
    // Add history if present
    if (history && Array.isArray(history)) {
      history.forEach(item => {
        contents.push({
          role: item.role === "user" ? "user" : "model",
          parts: [{ text: item.text }]
        });
      });
    }
    
    // Add current message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await aiClient.models.generateContent({
      model: "gemini-3.6-flash",
      contents: contents,
      config: {
        systemInstruction: socContext,
        temperature: 0.3
      }
    });

    const reply = response.text || "No response generated.";
    res.json({ success: true, reply });
  } catch (error: any) {
    console.error("AI Chat failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- MASSIVE BACKGROUND SIMULATOR ---
// This runs a routine threat generator mimicking continuous network scanners targeting our virtual honeypot system.
// This is critical for making the applet instantly alive and gorgeous in AI Studio without needing a real hardware ESP32.
const runSimulationEngine = () => {
  const targetPorts = [22, 23, 80, 445, 3306, 6379, 3389];
  const protos = { 22: "SSH", 23: "Telnet", 80: "HTTP", 445: "SMB", 3306: "MySQL", 6379: "Redis", 3389: "RDP" };
  const payloads = {
    22: "SSH-2.0-libssh_0.8.7 password login brute force attempt. User: root, pwd: password123",
    23: "admin/admin telnet login probe, Mirai botnet signature matched.",
    80: "GET /index.php?id=1%20UNION%20SELECT%20username,password%20FROM%20users%20HTTP/1.1",
    445: "SMB Negotiation transaction, testing EternalBlue vulnerable MS17-010 packet structure.",
    3306: "MySQL root connection attempt, parsing database schemas and executing command lines.",
    6379: "config set dir /var/spool/cron/crontabs -> Redis unauth privilege escalation probe.",
    3389: "RDP Cookie: mstshash=administrator Windows Terminal Services credential guess."
  };
  const attackerIPs = [
    "45.143.203.14", "103.87.210.15", "185.220.101.5", "198.51.100.42", "82.102.23.45",
    "190.23.45.12", "41.73.12.89", "203.0.113.64", "62.4.120.33", "110.45.19.122"
  ];
  
  const generateSimulatedAttack = async () => {
    // Only simulate if at least one device is online and honeypots are enabled
    const onlineSensors = Array.from(devices.values()).filter(d => d.status === "Online" && d.honeypotEnabled);
    if (onlineSensors.length === 0) return;

    const sensor = onlineSensors[Math.floor(Math.random() * onlineSensors.length)];
    const port = targetPorts[Math.floor(Math.random() * targetPorts.length)];
    const sourceIP = attackerIPs[Math.floor(Math.random() * attackerIPs.length)];
    const proto = protos[port as keyof typeof protos] || "TCP";
    const payload = payloads[port as keyof typeof payloads] || "Raw TCP packet sequence probe";

    // Randomize fluctuate cpu/ram on the sensor representing loading spikes
    sensor.cpuUsage = Math.floor(Math.random() * 25) + 15;
    sensor.ramUsage = Math.floor(Math.random() * 5) + 40;
    devices.set(sensor.chipId, sensor);
    broadcastToWS("device", { type: "DEVICE_HEARTBEAT", device: sensor });

    // Build the request and run the pipeline
    const countryPool = [
      { name: "Russia", code: "RU" },
      { name: "China", code: "CN" },
      { name: "Germany", code: "DE" },
      { name: "Netherlands", code: "NL" },
      { name: "United States", code: "US" },
      { name: "Ukraine", code: "UA" },
      { name: "Brazil", code: "BR" },
      { name: "South Korea", code: "KR" },
      { name: "Iran", code: "IR" },
      { name: "North Korea", code: "KP" }
    ];
    const lastOctet = parseInt(sourceIP.split('.').pop() || "0", 10);
    const countryObj = countryPool[lastOctet % countryPool.length];

    if (blockedIPs.has(sourceIP)) {
      logEvent('SECURITY', 'FIREWALL', `Blocked incoming honeypot traffic on port ${port} from blocked IP: ${sourceIP}`);
      return;
    }

    logEvent('WARNING', 'HONEYPOT', `Intrusion alert from device [${sensor.deviceName}]: ${sourceIP} -> port ${port} (${proto})`);

    const analysis = generateRuleBasedAnalysis(port, sourceIP, payload);

    const newAttack: AttackEvent = {
      id: `ATK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      chipId: sensor.chipId,
      deviceName: sensor.deviceName,
      sourceIP,
      country: countryObj.name,
      countryCode: countryObj.code,
      destPort: port,
      protocol: proto,
      payload,
      connectionCount: Math.floor(Math.random() * 4) + 1,
      timestamp: new Date().toISOString(),
      aiAnalyzed: true,
      analysis
    };

    attacks.unshift(newAttack);
    if (attacks.length > 1000) attacks.pop();

    broadcastToWS("attacks", newAttack);
    broadcastToWS("alerts", {
      type: "NEW_ATTACK",
      message: `CRITICAL ALERT: [${analysis.attackType}] detected on port ${port} from ${sourceIP} (${countryObj.name}). AI Threat Score: ${analysis.threatScore}`,
      attack: newAttack
    });
  };

  // Run automatically every 18 seconds to keep the dashboard beautifully active
  setInterval(generateSimulatedAttack, 18000);

  // Expose a route for clients to manually trigger an attack instantly
  app.post("/api/device/simulate-manual", async (req, res) => {
    const onlineSensors = Array.from(devices.values()).filter(d => d.status === "Online");
    if (onlineSensors.length === 0) {
      return res.status(400).json({ error: "No active sensors online to trigger simulation." });
    }
    const sensor = onlineSensors[0];
    const { port, sourceIP, payload } = req.body;
    
    const targetPort = port ? parseInt(port, 10) : 22;
    const targetIP = sourceIP || "82.102.23.45";
    const proto = protos[targetPort as keyof typeof protos] || "TCP";
    const targetPayload = payload || payloads[targetPort as keyof typeof payloads] || "Manual packet attack trigger payload";

    const countryPool = [
      { name: "Russia", code: "RU" },
      { name: "China", code: "CN" },
      { name: "Germany", code: "DE" },
      { name: "Netherlands", code: "NL" },
      { name: "United States", code: "US" },
      { name: "Ukraine", code: "UA" },
      { name: "Brazil", code: "BR" },
      { name: "South Korea", code: "KR" },
      { name: "Iran", code: "IR" },
      { name: "North Korea", code: "KP" }
    ];
    const lastOctet = parseInt(targetIP.split('.').pop() || "0", 10);
    const countryObj = countryPool[lastOctet % countryPool.length];

    if (blockedIPs.has(targetIP)) {
      logEvent('SECURITY', 'FIREWALL', `Blocked incoming honeypot traffic on port ${targetPort} from blocked IP: ${targetIP}`);
      return res.status(403).json({ success: false, reason: "IP is blocked in perimeter lists" });
    }

    logEvent('WARNING', 'HONEYPOT', `MANUAL INTRUSION TRIGGER [${sensor.deviceName}]: ${targetIP} -> port ${targetPort} (${proto})`);
    
    const analysis = await analyzeAttackAI(targetPort, targetIP, proto, targetPayload);

    const newAttack: AttackEvent = {
      id: `ATK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      chipId: sensor.chipId,
      deviceName: sensor.deviceName,
      sourceIP: targetIP,
      country: countryObj.name,
      countryCode: countryObj.code,
      destPort: targetPort,
      protocol: proto,
      payload: targetPayload,
      connectionCount: 1,
      timestamp: new Date().toISOString(),
      aiAnalyzed: true,
      analysis
    };

    attacks.unshift(newAttack);
    broadcastToWS("attacks", newAttack);
    broadcastToWS("alerts", {
      type: "NEW_ATTACK",
      message: `CRITICAL ALERT: [${analysis.attackType}] detected on port ${targetPort} from ${targetIP} (${countryObj.name}). AI Threat Score: ${analysis.threatScore}`,
      attack: newAttack
    });

    res.json({ success: true, attack: newAttack });
  });
};

runSimulationEngine();

// --- START FULL-STACK VITE WRAPPER ---
async function startServer() {
  const httpServer = http.createServer(app);

  // Setup WebSocket Server bound to same port
  const wss = new WebSocketServer({ noServer: true });
  
  wss.on("connection", (ws, request) => {
    wsClients.add(ws);
    logEvent('INFO', 'SYSTEM', `Client SOC Dashboard connected to live WS channel: ${request.url}`);

    // Send initial seeded datasets upon connection to speed up client load
    ws.send(JSON.stringify({ channel: "stats", data: { total: attacks.length, blocked: blockedIPs.size, online: Array.from(devices.values()).filter(d=>d.status==="Online").length } }));

    ws.on("close", () => {
      wsClients.delete(ws);
      logEvent('INFO', 'SYSTEM', 'Client SOC Dashboard disconnected from WS channel.');
    });
  });

  // Upgrade handling for unified Websocket endpoint on port 3000
  httpServer.on("upgrade", (request, socket, head) => {
    const pathname = request.url ? new URL(request.url, `http://${request.headers.host}`).pathname : '';
    if (pathname.startsWith("/ws")) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`[CYBER-EYE SOC] running at http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
