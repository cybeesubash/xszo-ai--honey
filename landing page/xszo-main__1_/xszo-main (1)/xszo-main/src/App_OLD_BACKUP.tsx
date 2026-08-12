import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { gsap } from 'gsap';
import { 
  Shield, Cpu, Activity, Server, Zap, Compass, Terminal, 
  ArrowRight, CheckCircle, Globe, Network, LogOut, Radio, 
  User, RefreshCw, AlertTriangle, Play, Flame, Search, Filter, 
  Download, FileSpreadsheet, Settings, Trash2, X, PlusCircle, Check, Sparkles, Bookmark,
  Users
} from 'lucide-react';
import LandingPage, { FalconShieldLogo } from './components/LandingPage.jsx';
import LoginForm from './components/LoginForm.jsx';
import CyberMap from './components/CyberMap.jsx';
import AnalyticsCharts from './components/AnalyticsCharts.jsx';
import ReportPanel from './components/ReportPanel.jsx';
import TemporalHeatmap from './components/TemporalHeatmap';
import AIAnalyzer from './components/AIAnalyzer';
import TeamSection from './components/TeamSection';
import AboutPage from './components/AboutPage';
import IntelligencePage from './components/IntelligencePage';
import { AttackEvent, DeviceStatus, SOCStats, AuditLog, SeverityLevel } from './types.js';
import { jsPDF } from 'jspdf';

type TabType = 'overview' | 'live-feed' | 'map' | 'devices' | 'logs' | 'analytics' | 'reports' | 'settings' | 'ai-analyzer' | 'team';

export default function App() {
  // Navigation states - only landing and login
  const [screen, setScreen] = useState<'landing' | 'login' | 'about'>('landing');

  // Core Data sets
  const [stats, setStats] = useState<SOCStats>({
    totalAttacks: 0,
    liveConnections: 3,
    averageThreatScore: 0,
    blockedIPsCount: 0,
    onlineDevicesCount: 0
  });

  const [attacks, setAttacks] = useState<AttackEvent[]>([]);
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<string[]>([]);

  // Persistent Flagged Incidents (Bookmarks) State
  const [bookmarkedAttacks, setBookmarkedAttacks] = useState<AttackEvent[]>(() => {
    try {
      const saved = localStorage.getItem('cyber_eye_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [liveFeedSubTab, setLiveFeedSubTab] = useState<'live' | 'flagged'>('live');

  // Sync bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem('cyber_eye_bookmarks', JSON.stringify(bookmarkedAttacks));
  }, [bookmarkedAttacks]);

  // Selected Items for deep diagnostic drills
  const [selectedAttack, setSelectedAttack] = useState<AttackEvent | null>(null);

  // UI state managers
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'online' | 'fallback'>('connecting');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [protocolFilter, setProtocolFilter] = useState<string>('All');

  // Log level filtering
  const [logLevelFilter, setLogLevelFilter] = useState<string>('All');
  const [logSearchQuery, setLogSearchQuery] = useState('');

  // Simulation controls state
  const [simPort, setSimPort] = useState<number>(22);
  const [simIP, setSimIP] = useState<string>('45.143.203.14');
  const [simPayload, setSimPayload] = useState<string>('');
  const [simIsLoading, setSimIsLoading] = useState(false);
  const [simSuccessMsg, setSimSuccessMsg] = useState<string | null>(null);

  // New Blocked IP state
  const [newBlockIP, setNewBlockIP] = useState('');

  // Growl Toast alerts
  const [growls, setGrowls] = useState<Array<{ id: string; message: string; severity: SeverityLevel; timestamp: string }>>([]);

  // WebSocket Ref
  const wsRef = useRef<WebSocket | null>(null);

  // GSAP Animation Refs & Handlers
  const logoRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  const handleLogoMouseEnter = () => {
    if (logoRef.current) {
      gsap.to(logoRef.current, {
        scale: 1.02,
        y: -1,
        duration: 0.25,
        ease: "power2.out"
      });
      const shield = logoRef.current.querySelector('.logo-shield');
      if (shield) {
        gsap.to(shield, {
          rotate: 15,
          scale: 1.15,
          color: "#06b6d4",
          duration: 0.25,
          ease: "back.out(1.5)"
        });
      }
      const shimmer = logoRef.current.querySelector('.logo-shimmer');
      if (shimmer) {
        gsap.fromTo(shimmer, 
          { xPercent: -100 }, 
          { xPercent: 200, duration: 0.65, ease: "power2.out" }
        );
      }
    }
  };

  const handleLogoMouseLeave = () => {
    if (logoRef.current) {
      gsap.to(logoRef.current, {
        scale: 1,
        y: 0,
        duration: 0.25,
        ease: "power2.out"
      });
      const shield = logoRef.current.querySelector('.logo-shield');
      if (shield) {
        gsap.to(shield, {
          rotate: 0,
          scale: 1,
          color: "#60a5fa",
          duration: 0.25,
          ease: "power2.out"
        });
      }
    }
  };

  const handleBadgeMouseEnter = () => {
    if (badgeRef.current) {
      const isDecoyActive = devices.some(d => d.status === 'Online' && d.honeypotEnabled);
      let glowColor = "rgba(59, 130, 246, 0.5)"; // Default Blue
      let borderColor = "rgba(59, 130, 246, 0.8)";
      if (wsStatus === 'online') {
        if (isDecoyActive) {
          glowColor = "rgba(6, 182, 212, 0.6)"; // Active Cyan Radar
          borderColor = "rgba(6, 182, 212, 0.8)";
        } else {
          glowColor = "rgba(16, 185, 129, 0.6)"; // Active Emerald Green
          borderColor = "rgba(16, 185, 129, 0.8)";
        }
      } else if (wsStatus === 'connecting') {
        glowColor = "rgba(249, 115, 22, 0.6)"; // Syncing Orange
        borderColor = "rgba(249, 115, 22, 0.8)";
      }

      gsap.to(badgeRef.current, {
        y: -3,
        scale: 1.06,
        borderColor: borderColor,
        boxShadow: `0 0 15px ${glowColor}, 0 0 4px ${glowColor}`,
        duration: 0.25,
        ease: "power2.out"
      });
      const radio = badgeRef.current.querySelector('.badge-radio');
      if (radio) {
        gsap.to(radio, {
          scale: 1.3,
          duration: 0.25,
          ease: "back.out(2)"
        });
      }
    }
  };

  const handleBadgeMouseLeave = () => {
    if (badgeRef.current) {
      const isDecoyActive = devices.some(d => d.status === 'Online' && d.honeypotEnabled);
      const defaultBorderColor = isDecoyActive && wsStatus === 'online' 
        ? "rgba(6, 182, 212, 0.5)" 
        : "rgba(30, 58, 138, 0.4)";

      gsap.to(badgeRef.current, {
        y: 0,
        scale: 1,
        borderColor: defaultBorderColor,
        boxShadow: "0 0 0px rgba(0, 0, 0, 0)",
        duration: 0.25,
        ease: "power2.out"
      });
      const radio = badgeRef.current.querySelector('.badge-radio');
      if (radio) {
        gsap.to(radio, {
          scale: 1,
          duration: 0.25,
          ease: "power2.out"
        });
      }
    }
  };

  // Handle Growl message queuing
  const pushGrowl = (message: string, severity: SeverityLevel) => {
    const id = Math.random().toString(36).substring(2, 9);
    setGrowls(prev => [{ id, message, severity, timestamp: new Date().toLocaleTimeString() }, ...prev].slice(0, 5));
    // Auto erase after 5.5 seconds
    setTimeout(() => {
      setGrowls(prev => prev.filter(g => g.id !== id));
    }, 5500);
  };

  // Toggle Bookmark state for incidents
  const toggleBookmark = (attack: AttackEvent) => {
    setBookmarkedAttacks(prev => {
      const isBookmarked = prev.some(item => item.id === attack.id);
      if (isBookmarked) {
        pushGrowl(`Incident ${attack.id.substring(0, 8)} removed from Flagged Incidents`, 'Low');
        return prev.filter(item => item.id !== attack.id);
      } else {
        pushGrowl(`Incident ${attack.id.substring(0, 8)} flagged & saved persistently`, 'Low');
        return [...prev, attack];
      }
    });
  };

  // Initial Rest Data Synchronizer
  const fetchAllData = async () => {
    setIsRefreshing(true);
    try {
      // 1. Stats
      const statsRes = await fetch('/api/dashboard');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 2. Attacks
      const attacksRes = await fetch('/api/attacks');
      if (attacksRes.ok) {
        const attacksData = await attacksRes.json();
        setAttacks(attacksData);
        if (attacksData.length > 0 && !selectedAttack) {
          setSelectedAttack(attacksData[0]);
        }
      }

      // 3. Devices
      const devicesRes = await fetch('/api/device/status');
      if (devicesRes.ok) {
        const devicesData = await devicesRes.json();
        setDevices(devicesData);
      }

      // 4. Logs
      const logsRes = await fetch('/api/logs');
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setAuditLogs(logsData);
      }

      // 5. Blocked IPs
      const blockedRes = await fetch('/api/attacks/blocked-ips');
      if (blockedRes.ok) {
        const blockedData = await blockedRes.json();
        setBlockedIPs(blockedData);
      }
    } catch (err) {
      console.error("Failed to sync initial SOC datasets", err);
      pushGrowl("Backend API synchronization timed out. Retrying link...", "Critical");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle user authentication login success
  const handleLoginSuccess = (userToken: string, userData: { username: string; role: string }) => {
    setToken(userToken);
    setUser(userData);
    setScreen('dashboard');
    pushGrowl(`SOC Session opened. Welcome Commander ${userData.username}!`, 'Low');
  };

  // Handle log out
  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (e) {}
    setToken(null);
    setUser(null);
    setScreen('landing');
    pushGrowl('SOC Administrative session closed.', 'Medium');
  };

  // WebSocket establishing logic
  useEffect(() => {
    if (screen !== 'dashboard') return;

    const connectWS = () => {
      setWsStatus('connecting');
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/ws`;
      
      console.log("Dialing WS pipeline:", wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket pipeline open.");
        setWsStatus('online');
        pushGrowl("Uplink Live: High-frequency socket streaming connected.", "Low");
      };

      ws.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          const { channel, data } = packet;

          if (channel === 'attacks') {
            const newAtk = data as AttackEvent;
            setAttacks(prev => {
              const updated = [newAtk, ...prev];
              return updated.slice(0, 300); // cap size in memory
            });
            // Auto re-calc local aggregates immediately
            setStats(prev => ({
              ...prev,
              totalAttacks: prev.totalAttacks + 1,
              averageThreatScore: Math.round(((prev.averageThreatScore * prev.totalAttacks) + (newAtk.analysis?.threatScore || 50)) / (prev.totalAttacks + 1))
            }));
          } else if (channel === 'alerts') {
            if (data.type === 'NEW_ATTACK') {
              pushGrowl(data.message, data.attack?.analysis?.severity || 'Medium');
            } else if (data.type === 'IP_BLOCKED') {
              pushGrowl(`IP Firewall block activated: ${data.ip}`, 'High');
              setBlockedIPs(prev => [...new Set([...prev, data.ip])]);
              setStats(prev => ({ ...prev, blockedIPsCount: prev.blockedIPsCount + 1 }));
            } else if (data.type === 'IP_UNBLOCKED') {
              pushGrowl(`IP whitelist rule updated. Unblocked: ${data.ip}`, 'Low');
              setBlockedIPs(prev => prev.filter(ip => ip !== data.ip));
              setStats(prev => ({ ...prev, blockedIPsCount: Math.max(0, prev.blockedIPsCount - 1) }));
            }
          } else if (channel === 'logs') {
            const newLog = data as AuditLog;
            setAuditLogs(prev => [newLog, ...prev].slice(0, 500));
          } else if (channel === 'device') {
            const { type, device } = data;
            setDevices(prev => {
              const idx = prev.findIndex(d => d.chipId === device.chipId);
              if (idx !== -1) {
                const updated = [...prev];
                updated[idx] = device;
                return updated;
              } else {
                return [...prev, device];
              }
            });
            setStats(prev => ({
              ...prev,
              onlineDevicesCount: devices.filter(d => d.status === 'Online').length
            }));
          }
        } catch (err) {
          console.error("Invalid WebSocket Frame", err);
        }
      };

      ws.onerror = (err) => {
        console.error("WS transport link lost", err);
        setWsStatus('fallback');
      };

      ws.onclose = () => {
        console.log("WebSocket transport closed.");
        setWsStatus('fallback');
        // Retry connection in 6 seconds
        setTimeout(() => {
          if (screen === 'dashboard') connectWS();
        }, 6000);
      };
    };

    connectWS();
    fetchAllData();

    // Secondary HTTP fallback polling loop if WS goes down
    const backupPoll = setInterval(() => {
      if (wsRef.current?.readyState !== WebSocket.OPEN) {
        console.log("WS offline. Fetching fallback REST data batch...");
        fetchAllData();
      }
    }, 5000);

    return () => {
      clearInterval(backupPoll);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [screen]);

  // Handle active attack detail selection
  const selectAttackRow = (atk: AttackEvent) => {
    setSelectedAttack(atk);
  };

  // Device interactions
  const triggerDeviceRestart = async (chipId: string) => {
    pushGrowl(`Transmitting restart payload to node ${chipId}...`, 'Medium');
    try {
      const res = await fetch('/api/device/restart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chipId })
      });
      if (res.ok) {
        pushGrowl(`Node ${chipId} is rebooting...`, 'Low');
        fetchAllData();
      }
    } catch (err) {
      pushGrowl('Failed to contact device gateway controller.', 'Critical');
    }
  };

  const toggleDecoyService = async (chipId: string, enabled: boolean) => {
    pushGrowl(`Toggling Honey-decoy pipeline to ${enabled ? 'ACTIVE' : 'INACTIVE'} on ${chipId}`, 'Medium');
    try {
      const res = await fetch('/api/device/toggle-honeypot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chipId, enabled })
      });
      if (res.ok) {
        pushGrowl(`Decoy status updated on chip ${chipId}`, 'Low');
        fetchAllData();
      }
    } catch (err) {
      pushGrowl('Command delivery failed.', 'Critical');
    }
  };

  // Firewall management
  const toggleIPBlock = async (ip: string, block: boolean) => {
    try {
      const res = await fetch('/api/attacks/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, block })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      pushGrowl('Firewall transaction failed.', 'Critical');
    }
  };

  const handleManualAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockIP) return;
    toggleIPBlock(newBlockIP, true);
    setNewBlockIP('');
  };

  // Run a manual honeypot simulation attack instantly
  const runManualSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimIsLoading(true);
    setSimSuccessMsg(null);
    try {
      const res = await fetch('/api/device/simulate-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          port: simPort,
          sourceIP: simIP,
          payload: simPayload
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSimSuccessMsg(`Attack processed! Incident ID: ${data.attack.id}. Threat score mapped: ${data.attack.analysis?.threatScore}`);
        pushGrowl(`Incident Simulated: ${data.attack.analysis?.attackType} on Port ${simPort}`, 'High');
        fetchAllData();
      } else {
        pushGrowl(`Simulation failed: ${data.reason || 'No active sensors online.'}`, 'Critical');
      }
    } catch (err) {
      pushGrowl('Simulation gateway timed out.', 'Critical');
    } finally {
      setSimIsLoading(false);
    }
  };

  // Export Audit logs
  const exportLogs = (format: 'json' | 'csv') => {
    let content = '';
    let filename = `CYBER_EYE_AUDIT_LOGS_${new Date().toISOString().split('T')[0]}`;
    let mimeType = 'text/plain';

    if (format === 'json') {
      content = JSON.stringify(auditLogs, null, 2);
      filename += '.json';
      mimeType = 'application/json';
    } else {
      const headers = 'ID,Timestamp,Level,Source,Message\n';
      const rows = auditLogs.map(l => `"${l.id}","${l.timestamp}","${l.level}","${l.source}","${l.message.replace(/"/g, '""')}"`).join('\n');
      content = headers + rows;
      filename += '.csv';
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtered attacks
  const filteredAttacks = attacks.filter(atk => {
    const matchesSearch = searchQuery === '' || 
      atk.sourceIP.includes(searchQuery) || 
      atk.country.toLowerCase().includes(searchQuery.toLowerCase()) || 
      atk.protocol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (atk.analysis?.attackType || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = severityFilter === 'All' || atk.analysis?.severity === severityFilter;
    const matchesProtocol = protocolFilter === 'All' || atk.protocol === protocolFilter;

    return matchesSearch && matchesSeverity && matchesProtocol;
  });

  // Filtered bookmarks
  const filteredBookmarks = bookmarkedAttacks.filter(atk => {
    const matchesSearch = searchQuery === '' || 
      atk.sourceIP.includes(searchQuery) || 
      atk.country.toLowerCase().includes(searchQuery.toLowerCase()) || 
      atk.protocol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (atk.analysis?.attackType || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = severityFilter === 'All' || atk.analysis?.severity === severityFilter;
    const matchesProtocol = protocolFilter === 'All' || atk.protocol === protocolFilter;

    return matchesSearch && matchesSeverity && matchesProtocol;
  });

  // Filtered logs
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = logSearchQuery === '' || 
      log.message.toLowerCase().includes(logSearchQuery.toLowerCase()) || 
      log.source.toLowerCase().includes(logSearchQuery.toLowerCase());
    const matchesLevel = logLevelFilter === 'All' || log.level === logLevelFilter;
    return matchesSearch && matchesLevel;
  });

  // Compile stats for charts
  const compileAnalytics = () => {
    const protocols: { [key: string]: number } = {};
    const severities = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    const ports: { [key: number]: number } = {};
    const timelineHours: { [hour: string]: number } = {};

    // Seed last 8 hours
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourKey = d.toLocaleTimeString([], { hour: '2-digit', hour12: false });
      timelineHours[hourKey] = 0;
    }

    attacks.forEach(a => {
      protocols[a.protocol] = (protocols[a.protocol] || 0) + 1;
      if (a.analysis) {
        severities[a.analysis.severity] += 1;
      }
      ports[a.destPort] = (ports[a.destPort] || 0) + 1;

      const aDate = new Date(a.timestamp);
      const aHour = aDate.toLocaleTimeString([], { hour: '2-digit', hour12: false });
      if (timelineHours[aHour] !== undefined) {
        timelineHours[aHour] += 1;
      }
    });

    return {
      protocols,
      severities,
      ports,
      timeline: Object.keys(timelineHours).map(hour => ({ hour, count: timelineHours[hour] }))
    };
  };

  // Dynamic quick-select preset for simulated triggers
  const applySimPreset = (port: number, ip: string, desc: string) => {
    setSimPort(port);
    setSimIP(ip);
    setSimPayload(desc);
  };

  // SOC Snapshots Export Engines
  const exportTextSnapshot = () => {
    const timestamp = new Date().toLocaleString();
    const activeDecoys = devices.filter(d => d.status === 'Online').length;
    
    let content = `================================================================================
                     CYBER EYE - SOC SECURITY INTELLIGENCE REPORT
================================================================================
Generated: ${timestamp}
Authorized Operator  : ${user?.username || 'admin'}
Uplink Connection Status: ${wsStatus === 'online' ? 'CONNECTED (STREAM ONLINE)' : 'FALLBACK HTTP'}
Uplink Signal Latency: ~45ms
--------------------------------------------------------------------------------

[1] CORE SECURITY OPERATIONS METRICS
--------------------------------------------------------------------------------
- Total Intrusion Attacks Captured: ${stats.totalAttacks} events
- Active IP Blocks (Gateway ACL): ${stats.blockedIPsCount} rules
- Online ESP32 Decoy Sensors     : ${activeDecoys} / ${devices.length} nodes
- Network-wide Avg Threat Index  : ${stats.averageThreatScore} / 100

[2] COMPROMISED FLEET STATUS & ACTIVE HONEYPOT DECOYS
--------------------------------------------------------------------------------
`;

    if (devices.length === 0) {
      content += "No registered decoy nodes in the active system.\n";
    } else {
      devices.forEach((dev, i) => {
        content += `${i + 1}. Node: ${dev.name} [Status: ${dev.status.toUpperCase()}]
   Hardware Type : ${dev.hardwareType}
   IP Address    : ${dev.ipAddress}
   MAC Signature : ${dev.mac}
   Honeypot Decoy: ${dev.honeypotEnabled ? 'ENABLED (RADAR ACTIVE)' : 'DISABLED'}
   Threat Index  : ${dev.threatIndex}/100
   Last Sync     : ${new Date(dev.lastHeartbeat).toLocaleString()}
\n`;
      });
    }

    content += `\n[3] ACTIVE GATEWAY FIREWALL BLOCKLIST (ACL RULES)
--------------------------------------------------------------------------------
`;

    if (blockedIPs.length === 0) {
      content += "No IP addresses are currently blocked on the gateway.\n";
    } else {
      blockedIPs.forEach((ip, i) => {
        content += `  - Ruleset #${i + 1}: ${ip} [ESTABLISHED DROP RULE]\n`;
      });
    }

    content += `\n[4] LATEST INTRUSION INCIDENTS (LAST 10 EVENTS IN RAM BUFFER)
--------------------------------------------------------------------------------
`;

    if (attacks.length === 0) {
      content += "No recorded intrusion attacks in the live RAM buffer.\n";
    } else {
      attacks.slice(0, 10).forEach((atk, i) => {
        content += `${i + 1}. Incident [ID: ${atk.id.substring(0, 10)}] | Severity: ${atk.analysis?.severity?.toUpperCase() || 'MEDIUM'}
   Timestamp     : ${new Date(atk.timestamp).toLocaleString()}
   Attack Type   : ${atk.analysis?.attackType || 'Scanning probe'}
   Source Vector : ${atk.sourceIP} (${atk.country})
   Target Sector : Port ${atk.destPort} / Protocol: ${atk.protocol.toUpperCase()}
   AI Assessment : ${atk.analysis?.summary || 'No detailed analysis provided.'}
\n`;
      });
    }

    content += `\n[5] FLAGGED & BOOKMARKED SECURITY INCIDENTS (${bookmarkedAttacks.length} TOTAL)
--------------------------------------------------------------------------------
`;

    if (bookmarkedAttacks.length === 0) {
      content += "No incidents currently flagged by administrative operators.\n";
    } else {
      bookmarkedAttacks.forEach((atk, i) => {
        content += `${i + 1}. Flagged Event [ID: ${atk.id.substring(0, 10)}]
   Timestamp     : ${new Date(atk.timestamp).toLocaleString()}
   Attack Type   : ${atk.analysis?.attackType || 'Scanning probe'}
   Source Vector : ${atk.sourceIP} (${atk.country})
   Target Sector : Port ${atk.destPort} / Protocol: ${atk.protocol.toUpperCase()}
\n`;
      });
    }

    content += `\n================================================================================
                      END OF SECURITY OPERATIONS CENTRE REPORT
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CyberEye_SOC_Snapshot_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPDFSnapshot = () => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();
    const activeDecoys = devices.filter(d => d.status === 'Online').length;
    let yPos = 52;

    const checkPageOverflow = (neededHeight: number) => {
      if (yPos + neededHeight > 270) {
        doc.addPage();
        yPos = 20;
        // Draw running header on subsequent pages
        doc.setFont('courier', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text('CYBER-EYE SECURITY OPERATIONS CENTER - SNAPSHOT REPORT', 14, 12);
        doc.setDrawColor(30, 41, 59); // slate-800
        doc.setLineWidth(0.2);
        doc.line(14, 14, 196, 14);
        yPos = 22;
      }
    };
    
    // 1. Setup Document Header Banner
    doc.setFont('courier', 'bold');
    doc.setFillColor(5, 6, 17); // #050611 - Very dark blue
    doc.rect(0, 0, 210, 40, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('CYBER-EYE COMMAND CENTER', 14, 18);
    
    doc.setFont('courier', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(96, 165, 250); // text-blue-400
    doc.text('SECURITY OPERATIONS CENTER - SNAPSHOT REPORT', 14, 25);
    
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175); // gray-400
    doc.text(`Generated: ${timestamp} | Operator: ${user?.username || 'admin'}`, 14, 32);
    
    // Decorative cyan accent border line
    doc.setDrawColor(6, 182, 212); // cyan-500
    doc.setLineWidth(1);
    doc.line(14, 36, 196, 36);
    
    // Section I: Core Security Metrics
    checkPageOverflow(50);
    doc.setFont('courier', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42); // Dark slate
    doc.text('I. CORE SECURITY METRICS', 14, yPos);
    
    doc.setDrawColor(203, 213, 225); // slate-200
    doc.setLineWidth(0.3);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    doc.setFont('courier', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85); // slate-700
    
    doc.text(`- Total Intrusion Attacks Captured : ${stats.totalAttacks} events`, 18, yPos);
    doc.text(`- Active Gateway Firewall IP Blocks : ${stats.blockedIPsCount} rules`, 18, yPos + 6);
    doc.text(`- Online ESP32 Hardware/Decoys      : ${activeDecoys} of ${devices.length} nodes`, 18, yPos + 12);
    doc.text(`- Average Network Threat Index     : ${stats.averageThreatScore} / 100`, 18, yPos + 18);
    doc.text(`- Stream Uplink Connection Status : ${wsStatus === 'online' ? 'ACTIVE STREAM' : 'FALLBACK HTTP'}`, 18, yPos + 24);
    
    yPos += 34;
    
    // Section II: Device Fleet Deployment
    checkPageOverflow(60);
    doc.setFont('courier', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('II. DECOY FLEET DEPLOYMENT STATUS', 14, yPos);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    
    if (devices.length === 0) {
      doc.text('No decoy devices registered in the network.', 18, yPos);
      yPos += 10;
    } else {
      doc.setFont('courier', 'bold');
      doc.text('NODE NAME', 18, yPos);
      doc.text('IP ADDRESS', 65, yPos);
      doc.text('HARDWARE', 110, yPos);
      doc.text('STATUS', 155, yPos);
      doc.text('THREAT', 180, yPos);
      
      doc.line(18, yPos + 2, 196, yPos + 2);
      yPos += 7;
      doc.setFont('courier', 'normal');
      
      devices.forEach((dev) => {
        checkPageOverflow(8);
        doc.text(dev.name, 18, yPos);
        doc.text(dev.ipAddress, 65, yPos);
        doc.text(dev.hardwareType, 110, yPos);
        doc.text(dev.status, 155, yPos);
        doc.text(`${dev.threatIndex}/100`, 180, yPos);
        yPos += 6;
      });
    }
    
    yPos += 8;
    
    // Section III: Active Firewall Blocks
    checkPageOverflow(30);
    doc.setFont('courier', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('III. ACTIVE FIREWALL IP ACL BLOCKS', 14, yPos);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    doc.setFont('courier', 'normal');
    doc.setFontSize(8.5);
    
    if (blockedIPs.length === 0) {
      doc.text('No IP addresses are currently blocked on the firewall.', 18, yPos);
      yPos += 8;
    } else {
      const blockLines = [];
      const chunkSize = 4;
      for (let i = 0; i < blockedIPs.length; i += chunkSize) {
        blockLines.push(blockedIPs.slice(i, i + chunkSize).join('   |   '));
      }
      blockLines.forEach(lineStr => {
        checkPageOverflow(8);
        doc.text(lineStr, 18, yPos);
        yPos += 6;
      });
    }
    
    yPos += 8;
    
    // Section IV: Latest Intrusion Incidents
    checkPageOverflow(40);
    doc.setFont('courier', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('IV. LATEST INTRUSION INCIDENTS (RAM BUFFER)', 14, yPos);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    
    if (attacks.length === 0) {
      doc.text('Awaiting intrusion incident streams. No threat signatures detected.', 18, yPos);
      yPos += 10;
    } else {
      attacks.slice(0, 10).forEach((atk, i) => {
        checkPageOverflow(14);
        const type = atk.analysis?.attackType || 'Scanning probe';
        const severity = atk.analysis?.severity || 'Medium';
        doc.setFont('courier', 'bold');
        doc.text(`${i + 1}. [${severity.toUpperCase()}] ${type} - Source: ${atk.sourceIP} (${atk.country})`, 18, yPos);
        doc.setFont('courier', 'normal');
        doc.text(`Port: ${atk.destPort}/${atk.protocol} | Time: ${new Date(atk.timestamp).toLocaleTimeString()} | Assessment: ${atk.analysis?.summary || 'N/A'}`, 22, yPos + 4, { maxWidth: 170 });
        yPos += 11;
      });
    }

    yPos += 8;

    // Section V: Flagged Bookmarks
    checkPageOverflow(30);
    doc.setFont('courier', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('V. FLAGGED & BOOKMARKED SECURITY INCIDENTS', 14, yPos);
    doc.line(14, yPos + 2, 196, yPos + 2);
    
    yPos += 10;
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    
    if (bookmarkedAttacks.length === 0) {
      doc.text('No incidents currently flagged by administrative operators.', 18, yPos);
      yPos += 10;
    } else {
      bookmarkedAttacks.slice(0, 10).forEach((atk, i) => {
        checkPageOverflow(10);
        const type = atk.analysis?.attackType || 'Scanning probe';
        doc.setFont('courier', 'bold');
        doc.text(`${i + 1}. ${type} - Target Port: ${atk.destPort}/${atk.protocol}`, 18, yPos);
        doc.setFont('courier', 'normal');
        doc.text(`Source Vector: ${atk.sourceIP} (${atk.country}) | Time Flagged: ${new Date(atk.timestamp).toLocaleString()}`, 22, yPos + 4);
        yPos += 9;
      });
    }

    // Footers
    checkPageOverflow(15);
    doc.setFont('courier', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('CONFIDENTIAL - CYBER-EYE INTERNAL SECURITY DOCUMENT', 14, 285);
    doc.text('Page generated automatically via Cyber-Eye Snapshot tool', 115, 285);
    
    doc.save(`CyberEye_SOC_Report_${Date.now()}.pdf`);
  };

  const isDecoyActive = devices.some(d => d.status === 'Online' && d.honeypotEnabled);

  return (
    <div className="min-h-screen bg-[#050611] text-gray-100 font-sans selection:bg-blue-600/30">
      
      {/* 1. LANDING GATEWAY VIEW */}
      {screen === 'landing' && (
        <LandingPage 
          onEnterApp={() => setScreen('login')} 
          onNavigateAbout={() => setScreen('about')}
        />
      )}

      {/* 1.5 ABOUT & FOUNDING TEAM PAGE */}
      {screen === 'about' && (
        <AboutPage 
          onNavigateHome={() => setScreen('landing')}
          onNavigateLogin={() => setScreen('login')}
          onNavigateDemo={() => setScreen('login')}
        />
      )}

      {/* 2. LOGIN AUTH GATEWAY VIEW */}
      {screen === 'login' && (
        <LoginForm 
          onLoginSuccess={() => setScreen('landing')}
          onBack={() => setScreen('landing')} 
        />
      )}
              <div className="relative w-10 h-10 rounded-lg bg-cyan-950/40 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.25)] animate-pulse overflow-hidden">
                <FalconShieldLogo className="logo-shield w-8 h-8 text-cyan-400" />
                <div className="logo-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 pointer-events-none" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-md font-black tracking-wider text-white font-sans">XSZO AI <span className="text-cyan-400 font-mono">SECURITY</span></h1>
                  <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-800 text-[9px] text-cyan-400 rounded-full font-mono font-bold uppercase tracking-widest animate-pulse">
                    XSZO AI POWERED
                  </span>
                </div>
                <p className="text-[9px] text-cyan-400 font-mono tracking-wider uppercase">Secure LLM operations center</p>
              </div>
            </div>

            {/* Connection Linkages & Controls */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              {/* WS Link Status badge */}
              <div 
                ref={badgeRef}
                onMouseEnter={handleBadgeMouseEnter}
                onMouseLeave={handleBadgeMouseLeave}
                className={`flex items-center gap-2 px-3 py-1.5 bg-blue-950/40 border rounded-lg cursor-pointer origin-center transition-all duration-300 ${
                  isDecoyActive && wsStatus === 'online' 
                    ? 'border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.15)] bg-cyan-950/20' 
                    : 'border-blue-900/40'
                }`}
              >
                {/* Dynamic Icon with Scanning/Listening radar state */}
                <div className="relative flex items-center justify-center">
                  {isDecoyActive && wsStatus === 'online' && (
                    <>
                      {/* Sonar Radar Ring Waves */}
                      <span className="absolute inline-flex h-5 w-5 rounded-full bg-cyan-500/20 animate-ping" />
                      <span className="absolute inline-flex h-4 w-4 rounded-full bg-cyan-500/30 animate-pulse" />
                    </>
                  )}
                  <Radio className={`badge-radio relative z-10 w-4 h-4 transition-all duration-300 ${
                    wsStatus === 'online' 
                      ? isDecoyActive 
                        ? 'text-cyan-400 animate-spin [animation-duration:3s]' 
                        : 'text-emerald-400 animate-pulse'
                      : 'text-orange-400 animate-spin'
                  }`} />
                </div>

                <span className="text-[10px] text-gray-400 select-none">SOC UPLINK:</span>
                
                <div className="flex items-center gap-1.5 font-mono">
                  <span className={`font-bold transition-all duration-300 ${
                    wsStatus === 'online' 
                      ? isDecoyActive 
                        ? 'text-cyan-400' 
                        : 'text-emerald-400' 
                      : 'text-orange-400'
                  }`}>
                    {wsStatus === 'online' 
                      ? isDecoyActive 
                        ? 'ACTIVE & SCANNING' 
                        : 'STREAM ONLINE' 
                      : wsStatus === 'connecting' 
                        ? 'SYNCING...' 
                        : 'FALLBACK HTTP'
                    }
                  </span>
                  
                  {/* Scanning status signal dot / waveform / ticker */}
                  {isDecoyActive && wsStatus === 'online' && (
                    <span className="flex items-center gap-1 bg-cyan-950/60 border border-cyan-800/40 px-1.5 py-0.5 rounded text-[8px] text-cyan-300 font-extrabold animate-pulse uppercase tracking-widest">
                      <span className="w-1 h-1 rounded-full bg-cyan-400 animate-ping inline-block" />
                      RADAR ACTIVE
                    </span>
                  )}
                </div>
              </div>

              {/* Refresh Button */}
              <button 
                onClick={fetchAllData}
                disabled={isRefreshing}
                className="p-2 bg-blue-950/40 border border-blue-900/40 rounded-lg hover:border-blue-500 text-gray-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                title="Synchronize Database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
                <span className="hidden md:inline">SYNC</span>
              </button>

              {/* Operator session tag */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-blue-950/20 border border-blue-950 rounded-lg text-gray-400">
                <User className="w-4 h-4 text-blue-500" />
                <span>ROOT:</span>
                <span className="text-white font-bold">{user?.username || 'admin'}</span>
              </div>

              {/* Log Out */}
              <button 
                onClick={handleLogout}
                className="px-3.5 py-2 bg-red-950/40 hover:bg-red-900/40 border border-red-900/40 hover:border-red-500/50 text-red-400 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                id="btn-dashboard-logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">DISCONNECT</span>
              </button>
            </div>
          </header>

          {/* Primary View Grid Layout */}
          <div className="flex-1 flex flex-col lg:flex-row">
            
            {/* Left Drawer Navigation Tabs */}
            <aside className="w-full lg:w-64 bg-[#070918] border-b lg:border-b-0 lg:border-r border-blue-950/80 p-4 space-y-6" id="dashboard-sidebar">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 font-mono tracking-widest block pl-2 font-bold uppercase">Main Console</span>
                <nav className="space-y-1">
                  {[
                    { id: 'overview', label: 'Command Grid', icon: Compass },
                    { id: 'live-feed', label: 'Live Telemetry', icon: Activity, badge: attacks.length },
                    { id: 'map', label: 'Threat Vectors', icon: Globe },
                    { id: 'devices', label: 'ESP32 Nodes', icon: Server, badge: devices.length },
                    { id: 'team', label: 'Founding Team', icon: Users },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as TabType)}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-mono tracking-wide transition-all cursor-pointer ${isActive ? 'bg-blue-600 font-bold text-white shadow-lg shadow-blue-600/10' : 'text-gray-400 hover:text-white hover:bg-blue-950/30'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-500'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && (
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${isActive ? 'bg-white text-blue-600' : 'bg-blue-950 text-blue-400 border border-blue-900/30'}`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 font-mono tracking-widest block pl-2 font-bold uppercase">Analytics & Signatures</span>
                <nav className="space-y-1">
                  {[
                    { id: 'ai-analyzer', label: 'AI Cognitive Lab', icon: Sparkles },
                    { id: 'analytics', label: 'Statistical charts', icon: Network },
                    { id: 'reports', label: 'Incident compiling', icon: Terminal },
                    { id: 'logs', label: 'Server audit logs', icon: Cpu },
                    { id: 'settings', label: 'Firewall settings', icon: Settings }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as TabType)}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-mono tracking-wide transition-all cursor-pointer ${isActive ? 'bg-blue-600 font-bold text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-blue-950/30'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-500'}`} />
                          <span>{item.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Ingress IP Counter panel */}
              <div className="hidden lg:block border-t border-blue-950/50 pt-4 space-y-2">
                <div className="bg-[#050611] p-3 rounded-xl border border-blue-950">
                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 uppercase font-bold">
                    <span>IP Blocklist ACL</span>
                    <span className="text-red-400">{blockedIPs.length} Active</span>
                  </div>
                  <div className="mt-2 space-y-1 text-[10px] font-mono text-gray-300 max-h-[110px] overflow-y-auto">
                    {blockedIPs.length === 0 ? (
                      <span className="text-gray-600 block italic py-1">No IP addresses blocked</span>
                    ) : (
                      blockedIPs.map(ip => (
                        <div key={ip} className="flex justify-between items-center bg-[#090b20]/50 px-2 py-1 rounded">
                          <span className="truncate">{ip}</span>
                          <button 
                            onClick={() => toggleIPBlock(ip, false)}
                            className="text-gray-500 hover:text-red-400 text-[9px] cursor-pointer"
                          >
                            Release
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </aside>

            {/* Core Display canvas */}
            <main className="flex-1 bg-[#050611] p-6 overflow-y-auto relative" id="dashboard-main-view">
              
              {/* Growl Alerts display bar */}
              <div className="fixed bottom-6 right-6 z-50 space-y-2.5 max-w-sm pointer-events-auto" id="growl-alert-container">
                {growls.map((gr) => (
                  <div 
                    key={gr.id}
                    className={`p-4 rounded-xl border shadow-2xl flex gap-3 items-start animate-slideIn backdrop-blur-md ${
                      gr.severity === 'Critical' ? 'bg-red-950/90 border-red-500 text-red-200' :
                      gr.severity === 'High' ? 'bg-orange-950/90 border-orange-500 text-orange-200' :
                      'bg-blue-950/90 border-blue-500 text-blue-200'
                    }`}
                  >
                    <Flame className={`w-5 h-5 flex-shrink-0 mt-0.5 ${gr.severity === 'Critical' ? 'text-red-400 animate-bounce' : 'text-blue-400'}`} />
                    <div className="flex-1 text-xs font-mono">
                      <div className="flex justify-between items-center">
                        <span className="font-bold tracking-wider text-[10px] uppercase">
                          {gr.severity} THREAT RADAR
                        </span>
                        <span className="text-gray-400 text-[9px]">{gr.timestamp}</span>
                      </div>
                      <p className="mt-1 leading-relaxed text-gray-300">{gr.message}</p>
                    </div>
                    <button onClick={() => setGrowls(prev => prev.filter(g => g.id !== gr.id))} className="text-gray-400 hover:text-white cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* TAB 1: COMMAND GRID (BENTO OVERVIEW) */}
              {activeTab === 'overview' && (
                <div className="space-y-6" id="overview-tab-canvas">

                  {/* Overview Header Control Panel */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#090b20]/60 border border-blue-950 rounded-xl p-5 gap-4" id="overview-header-panel">
                    <div>
                      <h2 className="text-sm font-bold text-white tracking-wider font-mono flex items-center gap-2 uppercase">
                        <Terminal className="w-4.5 h-4.5 text-blue-400" />
                        Command Grid Overview
                      </h2>
                      <p className="text-xs text-gray-400 font-sans mt-1">Real-time gateway telemetry, active decoy fleet status, and firewall blocklist controls.</p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setShowExportModal(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-2 shadow-[0_0_12px_rgba(59,130,246,0.3)] hover:shadow-[0_0_16px_rgba(59,130,246,0.5)] cursor-pointer"
                      id="btn-export-snapshot"
                    >
                      <Download className="w-3.5 h-3.5" />
                      EXPORT SOC REPORT
                    </button>
                  </div>

                  {/* Export Report Dialog Modal */}
                  <AnimatePresence>
                    {showExportModal && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" id="export-modal-backdrop">
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: 15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 15 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="w-full max-w-lg bg-[#090b20] border border-blue-900 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4"
                          id="export-modal-panel"
                        >
                          {/* Design Header */}
                          <div className="flex items-center justify-between border-b border-blue-950 pb-3">
                            <div className="flex items-center gap-2">
                              <Download className="w-5 h-5 text-blue-400" />
                              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Export SOC Snapshot Report</h3>
                            </div>
                            <button 
                              onClick={() => setShowExportModal(false)}
                              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-blue-950/50 transition-colors cursor-pointer"
                              title="Close panel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <p className="text-xs text-gray-400 leading-relaxed">
                            Generate and download a comprehensive state summary of the Cyber-Eye Security Operations Center (SOC). Select a format below:
                          </p>

                          {/* Quick Stats Preview */}
                          <div className="bg-[#040612]/80 border border-blue-950/60 rounded-xl p-3 space-y-2.5 text-xs font-mono">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-bold">Snapshot Manifest Preview</span>
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div className="flex justify-between border-b border-blue-950/40 pb-1">
                                <span className="text-gray-500">attacks count</span>
                                <span className="text-white font-bold">{stats.totalAttacks}</span>
                              </div>
                              <div className="flex justify-between border-b border-blue-950/40 pb-1">
                                <span className="text-gray-500">active ip blocks</span>
                                <span className="text-white font-bold">{stats.blockedIPsCount}</span>
                              </div>
                              <div className="flex justify-between border-b border-blue-950/40 pb-1">
                                <span className="text-gray-500">registered nodes</span>
                                <span className="text-white font-bold">{devices.length}</span>
                              </div>
                              <div className="flex justify-between border-b border-blue-950/40 pb-1">
                                <span className="text-gray-500">bookmarked logs</span>
                                <span className="text-white font-bold">{bookmarkedAttacks.length}</span>
                              </div>
                            </div>
                          </div>

                          {/* Export Options Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
                            {/* Option 1: PDF */}
                            <button
                              type="button"
                              onClick={() => {
                                exportPDFSnapshot();
                                setShowExportModal(false);
                              }}
                              className="p-4 bg-[#050611] border border-blue-950/80 hover:border-blue-500 rounded-xl text-left cursor-pointer transition-all hover:bg-blue-950/20 group space-y-2 flex flex-col justify-between"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-blue-400 group-hover:text-blue-300 font-mono font-bold text-xs">
                                  <FileSpreadsheet className="w-4 h-4" />
                                  <span>FORMATTED PDF</span>
                                </div>
                                <p className="text-[11px] text-gray-400 leading-normal">
                                  Official high-contrast report with structured tables, metadata fields, and audit log summaries.
                                </p>
                              </div>
                              <span className="text-[10px] font-mono text-blue-500 group-hover:text-blue-400 font-bold mt-2 inline-block">Download PDF &rarr;</span>
                            </button>

                            {/* Option 2: Plain Text */}
                            <button
                              type="button"
                              onClick={() => {
                                exportTextSnapshot();
                                setShowExportModal(false);
                              }}
                              className="p-4 bg-[#050611] border border-blue-950/80 hover:border-blue-500 rounded-xl text-left cursor-pointer transition-all hover:bg-blue-950/20 group space-y-2 flex flex-col justify-between"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-emerald-400 group-hover:text-emerald-300 font-mono font-bold text-xs">
                                  <Terminal className="w-4 h-4" />
                                  <span>TERMINAL TEXT</span>
                                </div>
                                <p className="text-[11px] text-gray-400 leading-normal">
                                  Cyberpunk-style ASCII formatted plaintext summary optimized for terminal logs and CLI readers.
                                </p>
                              </div>
                              <span className="text-[10px] font-mono text-emerald-500 group-hover:text-emerald-400 font-bold mt-2 inline-block">Download Text &rarr;</span>
                            </button>
                          </div>

                          <div className="text-[10px] text-center text-gray-500 font-mono mt-2 border-t border-blue-950 pt-3">
                            security operator token: {token ? token.substring(0, 15) + '...' : 'local-auth-bypass'}
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                  
                  {/* Bento top: Main stats header strip */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4" id="overview-stats-grid">
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.02, ease: "easeOut" }}
                      className="p-4 bg-[#090b20]/60 border border-blue-950 rounded-xl space-y-1 shadow-md"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 uppercase tracking-wider font-bold">
                        <span>Total Intrusion Attacks</span>
                        <Flame className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="h-9 relative overflow-hidden flex items-center">
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span 
                            key={stats.totalAttacks}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                            className="text-3xl font-black text-white font-mono block"
                          >
                            {stats.totalAttacks}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                      <p className="text-[9px] text-gray-500 font-mono">Captured packets in RAM</p>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
                      className="p-4 bg-[#090b20]/60 border border-blue-950 rounded-xl space-y-1 shadow-md"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 uppercase tracking-wider font-bold">
                        <span>IP Blocks (ACL)</span>
                        <Shield className="w-4 h-4 text-orange-500" />
                      </div>
                      <div className="h-9 relative overflow-hidden flex items-center">
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span 
                            key={stats.blockedIPsCount}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                            className="text-3xl font-black text-white font-mono block"
                          >
                            {stats.blockedIPsCount}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                      <p className="text-[9px] text-gray-500 font-mono">Active firewall rules</p>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.14, ease: "easeOut" }}
                      className="p-4 bg-[#090b20]/60 border border-blue-950 rounded-xl space-y-1 shadow-md"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 uppercase tracking-wider font-bold">
                        <span>ESP32 Decoys Online</span>
                        <Server className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="h-9 relative overflow-hidden flex items-center">
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span 
                            key={devices.filter(d=>d.status==='Online').length}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                            className="text-3xl font-black text-white font-mono block"
                          >
                            {devices.filter(d=>d.status==='Online').length} <span className="text-xs text-gray-400">/ {devices.length}</span>
                          </motion.span>
                        </AnimatePresence>
                      </div>
                      <p className="text-[9px] text-gray-500 font-mono">Simulated & Hardwares</p>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.20, ease: "easeOut" }}
                      className="p-4 bg-[#090b20]/60 border border-blue-950 rounded-xl space-y-1 shadow-md"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 uppercase tracking-wider font-bold">
                        <span>Avg Threat Index</span>
                        <Activity className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="h-9 relative overflow-hidden flex items-center">
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span 
                            key={stats.averageThreatScore}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                            className="text-3xl font-black text-blue-400 font-mono block"
                          >
                            {stats.averageThreatScore}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                      <p className="text-[9px] text-gray-500 font-mono">Gemini AI rating (0-100)</p>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.26, ease: "easeOut" }}
                      className="p-4 bg-[#090b20]/60 border border-blue-950 rounded-xl col-span-2 md:col-span-1 space-y-1 shadow-md flex flex-col justify-center"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 uppercase tracking-wider font-bold">
                        <span>Telemetry Links</span>
                        <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                      </div>
                      <div className="h-9 relative overflow-hidden flex items-center">
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span 
                            key={wsStatus}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                            className="text-2xl font-black text-emerald-400 font-mono block"
                          >
                            CONNECTED
                          </motion.span>
                        </AnimatePresence>
                      </div>
                      <p className="text-[9px] text-gray-500 font-mono">Uplink latency: ~45ms</p>
                    </motion.div>

                  </div>

                  {/* Bento Middle: Curving Live Vector Map + Core Analytics mini */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="overview-middle-grid">
                    <div className="lg:col-span-8">
                      {/* Embedded Live Map */}
                      <CyberMap recentAttacks={attacks} activeAttack={selectedAttack} />
                    </div>

                    <div className="lg:col-span-4">
                      {/* Embedded Analytics Charts */}
                      <AnalyticsCharts analyticsData={compileAnalytics()} />
                    </div>
                  </div>

                  {/* Bento Bottom: Interactive Manual Simulator Controls + Latest Critical List */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="overview-bottom-grid">
                    
                    {/* Manual Incident Injector */}
                    <div className="lg:col-span-5 bg-[#090b20]/60 border border-blue-950 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-blue-950/80 pb-3">
                        <div className="flex items-center gap-2">
                          <PlusCircle className="w-5 h-5 text-blue-500" />
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Intrusion Incident Simulator</h3>
                        </div>
                        <span className="px-2 py-0.5 bg-blue-950 text-[10px] font-mono text-blue-400 rounded">DECOY TESTING</span>
                      </div>

                      <p className="text-xs text-gray-400 leading-relaxed font-sans">
                        Don't have a physical ESP32 connected right now? No problem. Use this local simulator to inject raw packets instantly and watch the AI process telemetry signatures.
                      </p>

                      {/* Presets buttons */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-500 font-mono font-bold uppercase block">Attack Presets:</span>
                        <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                          <button 
                            type="button" 
                            onClick={() => applySimPreset(22, '45.143.203.14', 'SSH brute force: testing root logins with standard list')}
                            className="px-2 py-1 bg-[#040612] border border-blue-950 hover:border-blue-500 text-blue-400 rounded transition-all cursor-pointer"
                          >
                            SSH Bruteforce
                          </button>
                          <button 
                            type="button" 
                            onClick={() => applySimPreset(3306, '103.87.210.15', 'SQL injection: UNION SELECT password from system')}
                            className="px-2 py-1 bg-[#040612] border border-blue-950 hover:border-blue-500 text-blue-400 rounded transition-all cursor-pointer"
                          >
                            MySQL Bypass
                          </button>
                          <button 
                            type="button" 
                            onClick={() => applySimPreset(23, '185.220.101.5', 'Mirai malware scan attempting default busybox telnet ports')}
                            className="px-2 py-1 bg-[#040612] border border-blue-950 hover:border-blue-500 text-blue-400 rounded transition-all cursor-pointer"
                          >
                            Mirai Botnet
                          </button>
                          <button 
                            type="button" 
                            onClick={() => applySimPreset(445, '198.51.100.42', 'MS17-010 EternalBlue payload probe target windows SMB shares')}
                            className="px-2 py-1 bg-[#040612] border border-blue-950 hover:border-blue-500 text-blue-400 rounded transition-all cursor-pointer"
                          >
                            EternalBlue SMB
                          </button>
                        </div>
                      </div>

                      <form onSubmit={runManualSimulation} className="space-y-3.5 text-xs font-mono" id="form-simulation">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase">Target Port</label>
                            <select 
                              value={simPort} 
                              onChange={e => setSimPort(parseInt(e.target.value, 10))}
                              className="w-full bg-[#040612] border border-blue-950 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                            >
                              <option value="22">Port 22 (SSH)</option>
                              <option value="23">Port 23 (Telnet)</option>
                              <option value="80">Port 80 (HTTP)</option>
                              <option value="445">Port 445 (SMB)</option>
                              <option value="3306">Port 3306 (MySQL)</option>
                              <option value="3389">Port 3389 (RDP)</option>
                              <option value="6379">Port 6379 (Redis)</option>
                            </select>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase">Attacking IP</label>
                            <input 
                              type="text" 
                              value={simIP}
                              onChange={e => setSimIP(e.target.value)}
                              placeholder="e.g. 45.143.203.14"
                              className="w-full bg-[#040612] border border-blue-950 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 uppercase">Raw Payload Buffer (Optional)</label>
                          <textarea 
                            value={simPayload}
                            onChange={e => setSimPayload(e.target.value)}
                            placeholder="Enter test buffer signatures here..."
                            rows={2}
                            className="w-full bg-[#040612] border border-blue-950 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                          />
                        </div>

                        {simSuccessMsg && (
                          <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 rounded-lg text-[11px]" id="sim-success-alert">
                            {simSuccessMsg}
                          </div>
                        )}

                        <button 
                          type="submit"
                          disabled={simIsLoading}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 group"
                        >
                          {simIsLoading ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          ) : (
                            <>
                              <Play className="w-4 h-4 fill-white" />
                              Inject Telemetry Intrusion
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Quick list of latest attacks */}
                    <div className="lg:col-span-7 bg-[#090b20]/60 border border-blue-950 rounded-xl p-5 flex flex-col">
                      <div className="flex items-center justify-between border-b border-blue-950/80 pb-3 mb-4">
                        <div className="flex items-center gap-2">
                          <Flame className="w-5 h-5 text-red-500" />
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Live Incident Streams</h3>
                        </div>
                        <button 
                          onClick={() => setActiveTab('live-feed')}
                          className="text-xs text-blue-500 hover:underline font-mono"
                        >
                          Show Full Queue &rarr;
                        </button>
                      </div>

                      <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[290px] pr-1">
                        {attacks.length === 0 ? (
                          <div className="text-center py-16 font-mono text-xs text-gray-500">
                            Awaiting threat vector events. Launch simulated intrusions.
                          </div>
                        ) : (
                          <AnimatePresence initial={false}>
                            {attacks.slice(0, 5).map((atk) => {
                              const isSelected = selectedAttack?.id === atk.id;
                              let badgeCol = "bg-blue-950 text-blue-400 border-blue-900";
                              if (atk.analysis?.severity === 'High') badgeCol = "bg-orange-950 text-orange-400 border-orange-900";
                              if (atk.analysis?.severity === 'Critical') badgeCol = "bg-red-950 text-red-400 border-red-900";

                              return (
                                <motion.div 
                                  key={atk.id}
                                  layout="position"
                                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, x: -15, scale: 0.98 }}
                                  transition={{ duration: 0.25, ease: "easeOut" }}
                                  onClick={() => selectAttackRow(atk)}
                                  className={`p-3 bg-[#040612]/80 hover:bg-[#070918]/90 border rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-colors ${isSelected ? 'border-blue-500 shadow-md shadow-blue-500/5 bg-[#07091c]' : 'border-blue-950/60'}`}
                                >
                                  <div className="flex items-center gap-3.5 min-w-0">
                                    {/* Severity block indicator */}
                                    <span className={`w-2.5 h-10 rounded-full flex-shrink-0 ${atk.analysis?.severity === 'Critical' ? 'bg-red-500' : atk.analysis?.severity === 'High' ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
                                    
                                    <div className="font-mono text-xs truncate">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-white">{atk.analysis?.attackType || 'Scanning probe'}</span>
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] border font-bold ${badgeCol}`}>
                                          {atk.analysis?.severity || 'Medium'}
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-gray-500 mt-1 flex flex-wrap gap-x-2">
                                        <span>Source: <strong className="text-gray-300">{atk.sourceIP}</strong> ({atk.country})</span>
                                        <span className="text-blue-900">|</span>
                                        <span>Port: <strong className="text-blue-400">{atk.destPort}/{atk.protocol}</strong></span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-right font-mono text-[10px] text-gray-500 hidden sm:flex flex-col items-end gap-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <span>{new Date(atk.timestamp).toLocaleTimeString()}</span>
                                      <button
                                        type="button"
                                        title={bookmarkedAttacks.some(item => item.id === atk.id) ? "Remove bookmark" : "Bookmark incident"}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleBookmark(atk);
                                        }}
                                        className={`p-1 rounded hover:bg-blue-950/80 transition-all ${
                                          bookmarkedAttacks.some(item => item.id === atk.id)
                                            ? 'text-yellow-400'
                                            : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                      >
                                        <Bookmark className={`w-3 h-3 ${bookmarkedAttacks.some(item => item.id === atk.id) ? 'fill-yellow-400' : ''}`} />
                                      </button>
                                    </div>
                                    <span className="block text-[9px] text-gray-600">ID: {atk.id.substring(0, 10)}</span>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </AnimatePresence>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Temporal D3 Heatmap Component */}
                  <div className="bg-[#090b20]/60 border border-blue-950 rounded-xl p-5" id="overview-heatmap-wrapper">
                    <TemporalHeatmap attacks={attacks} />
                  </div>

                </div>
              )}

              {/* TAB 2: LIVE TELEMETRY LOGS (GRANULAR ALERTS) */}
              {activeTab === 'live-feed' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="live-feed-canvas">
                  
                  {/* Left Column: Filterable List cards */}
                  <div className="lg:col-span-6 space-y-4">
                    
                    {/* Sub-Tabs Selector */}
                    <div className="flex bg-[#040612]/60 p-1 border border-blue-950 rounded-xl">
                      <button
                        onClick={() => setLiveFeedSubTab('live')}
                        className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          liveFeedSubTab === 'live'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Radio className={`w-3.5 h-3.5 ${liveFeedSubTab === 'live' && wsStatus === 'online' ? 'animate-pulse' : ''}`} />
                        Active Stream ({attacks.length})
                      </button>
                      <button
                        onClick={() => setLiveFeedSubTab('flagged')}
                        className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          liveFeedSubTab === 'flagged'
                            ? 'bg-yellow-600 text-white shadow-md'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${liveFeedSubTab === 'flagged' ? 'fill-white' : ''}`} />
                        Flagged Incidents ({bookmarkedAttacks.length})
                      </button>
                    </div>

                    {/* Filter Panel */}
                    <div className="bg-[#090b20]/60 border border-blue-950 rounded-xl p-4 space-y-3">
                      <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 relative font-mono text-xs">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input 
                            type="text" 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search IP, country, protocol, signature..."
                            className="w-full bg-[#040612] border border-blue-950 py-2.5 pl-10 pr-4 rounded-lg text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="flex gap-2">
                          <select 
                            value={severityFilter}
                            onChange={e => setSeverityFilter(e.target.value)}
                            className="bg-[#040612] border border-blue-950 rounded-lg p-2.5 text-xs font-mono text-gray-300 focus:outline-none focus:border-blue-500"
                          >
                            <option value="All">All Severities</option>
                            <option value="Critical">Critical</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>

                          <select 
                            value={protocolFilter}
                            onChange={e => setProtocolFilter(e.target.value)}
                            className="bg-[#040612] border border-blue-950 rounded-lg p-2.5 text-xs font-mono text-gray-300 focus:outline-none focus:border-blue-500"
                          >
                            <option value="All">All Protocols</option>
                            <option value="SSH">SSH</option>
                            <option value="Telnet">Telnet</option>
                            <option value="MySQL">MySQL</option>
                            <option value="HTTP">HTTP</option>
                            <option value="SMB">SMB</option>
                            <option value="RDP">RDP</option>
                            <option value="Redis">Redis</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
                        {liveFeedSubTab === 'live' ? (
                          <span>FILTERED RESULT: {filteredAttacks.length} OF {attacks.length} ALERTS</span>
                        ) : (
                          <span>FILTERED RESULT: {filteredBookmarks.length} OF {bookmarkedAttacks.length} FLAGGED</span>
                        )}
                        {(searchQuery || severityFilter !== 'All' || protocolFilter !== 'All') && (
                          <button 
                            onClick={() => { setSearchQuery(''); setSeverityFilter('All'); setProtocolFilter('All'); }}
                            className="text-blue-500 hover:underline cursor-pointer"
                          >
                            Reset filters
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Cards Loop */}
                    <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                      {(liveFeedSubTab === 'live' ? filteredAttacks : filteredBookmarks).length === 0 ? (
                        <div className="bg-[#090b20]/20 border border-blue-950 rounded-xl p-16 text-center font-mono text-xs text-gray-500">
                          {liveFeedSubTab === 'live' 
                            ? 'No live stream alerts correspond with your filtering queries.'
                            : 'No flagged incidents found inside this selection.'}
                        </div>
                      ) : (
                        <AnimatePresence initial={false}>
                          {(liveFeedSubTab === 'live' ? filteredAttacks : filteredBookmarks).map((atk) => {
                            const isSelected = selectedAttack?.id === atk.id;
                            let badgeCol = "bg-blue-950 text-blue-400 border-blue-900/40";
                            if (atk.analysis?.severity === 'High') badgeCol = "bg-orange-950 text-orange-400 border-orange-900/40";
                            if (atk.analysis?.severity === 'Critical') badgeCol = "bg-red-950 text-red-400 border-red-900/40";

                            return (
                              <motion.div 
                                key={atk.id}
                                layout="position"
                                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -15, scale: 0.98 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                onClick={() => selectAttackRow(atk)}
                                className={`p-4 bg-[#090b20]/40 border rounded-xl flex justify-between gap-4 cursor-pointer transition-colors ${isSelected ? 'border-blue-500 bg-[#090b24] shadow-md shadow-blue-500/5' : 'border-blue-950 hover:bg-[#090b20]/60'}`}
                              >
                                <div className="space-y-2 font-mono text-xs min-w-0 flex-1">
                                  <div className="flex items-center gap-2.5">
                                    <span className={`w-2 h-2 rounded-full ${atk.analysis?.severity === 'Critical' ? 'bg-red-500 animate-ping' : atk.analysis?.severity === 'High' ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
                                    <span className="font-black text-white truncate text-sm">{atk.analysis?.attackType || 'Scanning intrusion'}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${badgeCol}`}>
                                      {atk.analysis?.severity || 'Medium'}
                                    </span>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-3 text-[11px] text-gray-400 pt-1">
                                    <div>
                                      <span className="text-[10px] text-gray-600 block uppercase font-bold">SOURCE ADDRESS</span>
                                      <span className="text-white font-bold">{atk.sourceIP}</span> ({atk.country})
                                    </div>
                                    <div>
                                      <span className="text-[10px] text-gray-600 block uppercase font-bold">TARGET EXPOSURE</span>
                                      <span className="text-blue-400 font-bold">{atk.destPort} / {atk.protocol}</span> on node {atk.deviceName}
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right font-mono text-[10px] text-gray-500 flex flex-col justify-between items-end">
                                  <div className="flex items-center gap-2">
                                    <span>{new Date(atk.timestamp).toLocaleTimeString()}</span>
                                    <button
                                      type="button"
                                      title={bookmarkedAttacks.some(item => item.id === atk.id) ? "Remove bookmark" : "Bookmark incident"}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleBookmark(atk);
                                      }}
                                      className={`p-1 rounded hover:bg-blue-950/80 transition-all ${
                                        bookmarkedAttacks.some(item => item.id === atk.id)
                                          ? 'text-yellow-400'
                                          : 'text-gray-500 hover:text-gray-300'
                                      }`}
                                    >
                                      <Bookmark className={`w-3.5 h-3.5 ${bookmarkedAttacks.some(item => item.id === atk.id) ? 'fill-yellow-400' : ''}`} />
                                    </button>
                                  </div>
                                  <span className="text-[9px] text-gray-600">ID: {atk.id.substring(0, 10)}</span>
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      )}
                    </div>

                  </div>

                  {/* Right Column: Deep Incident Diagnostic & AI assessments */}
                  <div className="lg:col-span-6 bg-[#090b20]/60 border border-blue-950 rounded-xl p-6 space-y-6 sticky top-24" id="alert-detailed-diagnostics">
                    
                    {!selectedAttack ? (
                      <div className="text-center py-24 font-mono text-xs text-gray-500">
                        Please select an intrusion alert card on the left to initialize diagnostic analysis.
                      </div>
                    ) : (
                      <div className="space-y-6" id="diagnostic-drill">
                        
                        {/* Title Bar & Threat scale badge */}
                        <div className="flex justify-between items-start border-b border-blue-950/80 pb-4">
                          <div className="space-y-1">
                            <span className="text-[9px] text-gray-500 font-mono tracking-widest uppercase font-bold">Active Diagnostic Assessment</span>
                            <h2 className="text-lg font-black text-white font-mono">{selectedAttack.analysis?.attackType || 'Scanning Intrusion'}</h2>
                            <p className="text-xs font-mono text-blue-400">Captured at {new Date(selectedAttack.timestamp).toLocaleString()}</p>
                          </div>

                          <div className="text-center">
                            <span className="text-[9px] text-gray-500 font-mono tracking-widest block uppercase mb-1">AI Threat index</span>
                            <div className="w-14 h-14 rounded-full border-2 border-red-500/40 flex items-center justify-center bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                              <span className="text-lg font-black font-mono text-red-500">{selectedAttack.analysis?.threatScore || 50}</span>
                            </div>
                          </div>
                        </div>

                        {/* Bento Details */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-mono text-xs">
                          <div className="p-3 bg-[#040612] border border-blue-950 rounded-lg">
                            <span className="text-[10px] text-gray-500 block uppercase">ORIGIN GEOGRAPHY</span>
                            <span className="text-white font-bold">{selectedAttack.country} ({selectedAttack.countryCode})</span>
                          </div>
                          <div className="p-3 bg-[#040612] border border-blue-950 rounded-lg">
                            <span className="text-[10px] text-gray-500 block uppercase">EXPOSED PORT/PROTO</span>
                            <span className="text-blue-400 font-bold">Port {selectedAttack.destPort} ({selectedAttack.protocol})</span>
                          </div>
                          <div className="p-3 bg-[#040612] border border-blue-950 rounded-lg col-span-2 md:col-span-1">
                            <span className="text-[10px] text-gray-500 block uppercase">INGRESS SENSOR</span>
                            <span className="text-white truncate block">{selectedAttack.deviceName}</span>
                          </div>
                        </div>

                        {/* AI Summary Text block */}
                        <div className="space-y-2">
                          <span className="text-[10px] text-gray-500 font-mono block uppercase font-bold">AI EXECUTIVE SUMMARY</span>
                          <p className="bg-[#040612] p-4 border border-blue-950/80 rounded-xl text-xs font-sans text-gray-300 leading-relaxed shadow-inner">
                            {selectedAttack.analysis?.summary || 'Heuristic rules are evaluating this alert...'}
                          </p>
                        </div>

                        {/* Raw Payload Buffer captures */}
                        <div className="space-y-2">
                          <span className="text-[10px] text-gray-500 font-mono block uppercase font-bold">RAW CAPTURED BUFFER PAYLOAD</span>
                          <div className="bg-[#03040b] p-3.5 border border-blue-950 rounded-xl max-h-[140px] overflow-y-auto shadow-inner relative group">
                            <pre className="text-[11px] font-mono text-cyan-400 leading-relaxed break-all select-all">
                              {selectedAttack.payload}
                            </pre>
                          </div>
                        </div>

                        {/* Dynamic actions block */}
                        <div className="border-t border-blue-950/80 pt-4 flex flex-col md:flex-row justify-between items-center gap-3">
                          <div className="text-xs font-mono text-gray-500">
                            <span>FIREWALL ACTION STATUS: </span>
                            <span className={`font-bold ${blockedIPs.includes(selectedAttack.sourceIP) ? 'text-red-400' : 'text-gray-400'}`}>
                              {blockedIPs.includes(selectedAttack.sourceIP) ? 'BLOCKED' : 'ACTIVE EXPOSURE'}
                            </span>
                          </div>

                           <div className="flex flex-wrap gap-2 justify-end">
                            <button 
                              type="button"
                              onClick={() => toggleBookmark(selectedAttack)}
                              className={`px-4 py-2 border rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                bookmarkedAttacks.some(item => item.id === selectedAttack.id)
                                  ? 'bg-yellow-950/40 border-yellow-800 text-yellow-400 hover:bg-yellow-900/50'
                                  : 'bg-[#040612] border-blue-950 text-gray-400 hover:text-white hover:border-blue-500'
                              }`}
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${bookmarkedAttacks.some(item => item.id === selectedAttack.id) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                              {bookmarkedAttacks.some(item => item.id === selectedAttack.id) ? 'Flagged' : 'Flag Log'}
                            </button>

                            {blockedIPs.includes(selectedAttack.sourceIP) ? (
                              <button 
                                onClick={() => toggleIPBlock(selectedAttack.sourceIP, false)}
                                className="px-4 py-2 bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-800 text-emerald-400 text-xs font-bold rounded-lg transition-all cursor-pointer"
                              >
                                Whitelist IP
                              </button>
                            ) : (
                              <button 
                                onClick={() => toggleIPBlock(selectedAttack.sourceIP, true)}
                                className="px-4 py-2 bg-red-950/50 hover:bg-red-900/50 border border-red-800 text-red-400 text-xs font-bold rounded-lg transition-all cursor-pointer"
                              >
                                Block Attacker IP
                              </button>
                            )}

                            <button 
                              onClick={() => setActiveTab('reports')}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                            >
                              Compile Signatures
                            </button>
                          </div>
                        </div>

                      </div>
                    )}

                  </div>

                </div>
              )}

              {/* TAB 3: THREAT VECTORS MAP (FULL-WIDTH MAP PANEL) */}
              {activeTab === 'map' && (
                <div className="space-y-6" id="vector-map-canvas">
                  <div className="bg-[#090b20]/40 border border-blue-950 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="space-y-1">
                      <h2 className="text-lg font-bold text-white font-mono uppercase">Interactive Threat Mapping Arena</h2>
                      <p className="text-xs text-gray-400">Plotting raw incoming honeypot events to geographical location coordinates in real-time.</p>
                    </div>

                    {/* Simulation Launch buttons strip */}
                    <div className="flex gap-2">
                      <button 
                        onClick={async () => {
                          setSimIsLoading(true);
                          try {
                            await fetch('/api/device/simulate-manual', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ port: 22, sourceIP: '45.143.203.14' })
                            });
                            fetchAllData();
                          } catch (e) {} finally { setSimIsLoading(false); }
                        }}
                        className="px-3.5 py-2 bg-[#040612] border border-blue-950 hover:border-red-500 hover:bg-red-950/10 text-red-400 text-xs font-mono rounded-lg transition-all cursor-pointer"
                      >
                        Trigger SSH Attack (RU)
                      </button>
                      
                      <button 
                        onClick={async () => {
                          setSimIsLoading(true);
                          try {
                            await fetch('/api/device/simulate-manual', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ port: 3306, sourceIP: '103.87.210.15' })
                            });
                            fetchAllData();
                          } catch (e) {} finally { setSimIsLoading(false); }
                        }}
                        className="px-3.5 py-2 bg-[#040612] border border-blue-950 hover:border-red-500 hover:bg-red-950/10 text-red-400 text-xs font-mono rounded-lg transition-all cursor-pointer"
                      >
                        Trigger MySQL Attack (CN)
                      </button>
                    </div>
                  </div>

                  <CyberMap recentAttacks={attacks} activeAttack={selectedAttack} />

                  {/* World Geo Metrics List bento block */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs" id="geo-distribution-blocks">
                    <div className="bg-[#090b20]/40 border border-blue-950 rounded-xl p-5 space-y-3">
                      <span className="text-gray-500 text-[10px] block font-bold uppercase">PRIMARY INCURSION ORIGINS</span>
                      <div className="space-y-2">
                        {[
                          { nation: "Russia", hits: attacks.filter(a=>a.countryCode==='RU').length, percent: 35 },
                          { nation: "China", hits: attacks.filter(a=>a.countryCode==='CN').length, percent: 28 },
                          { nation: "Germany", hits: attacks.filter(a=>a.countryCode==='DE').length, percent: 18 }
                        ].map((n, index) => (
                          <div key={n.nation} className="space-y-1">
                            <div className="flex justify-between">
                              <span>{index + 1}. {n.nation}</span>
                              <span className="text-white font-bold">{n.hits} hits</span>
                            </div>
                            <div className="w-full bg-[#040612] h-1.5 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full" style={{ width: `${n.hits * 10}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#090b20]/40 border border-blue-950 rounded-xl p-5 space-y-3">
                      <span className="text-gray-500 text-[10px] block font-bold uppercase">INGRESS SENSORS INVENTORIES</span>
                      <div className="space-y-2">
                        {devices.map(dev => {
                          const devAttacks = attacks.filter(a => a.chipId === dev.chipId).length;
                          return (
                            <div key={dev.chipId} className="flex justify-between items-center bg-[#040612] p-2.5 rounded-lg border border-blue-950/40">
                              <div>
                                <span className="font-bold text-gray-200 block">{dev.deviceName}</span>
                                <span className="text-[10px] text-gray-500 font-mono">ID: {dev.chipId}</span>
                              </div>
                              <span className="px-2 py-1 bg-blue-950 text-blue-400 font-bold rounded text-[10px] border border-blue-900/30">
                                {devAttacks} hits
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-[#090b20]/40 border border-blue-950 rounded-xl p-5 space-y-3">
                      <span className="text-gray-500 text-[10px] block font-bold uppercase">SYSTEM CONSOLE INGRESS</span>
                      <p className="text-gray-400 font-sans text-xs leading-relaxed">
                        Each simulated or physical ESP32 registers instantly via unified register webhooks. Our relative streaming vectors plot geographic targets under 100ms.
                      </p>
                      <button 
                        onClick={() => setActiveTab('devices')}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-all cursor-pointer"
                      >
                        Inspect Device Controllers
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: DEVICE MANAGEMENT (HARDWARE & SIMULATED) */}
              {activeTab === 'devices' && (
                <div className="space-y-6" id="device-management-canvas">
                  
                  {/* Title Bar info */}
                  <div className="bg-[#090b20]/40 border border-blue-950 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="space-y-1">
                      <h2 className="text-lg font-bold text-white font-mono uppercase">HoneyBot Endpoint Controllers</h2>
                      <p className="text-xs text-gray-400">List of operational edge honeypots processing protocol sockets and piping payload telemetry packages.</p>
                    </div>

                    <span className="px-3 py-1.5 bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-mono rounded-lg animate-pulse font-bold">
                      ACTIVE DECOY POOL: {devices.filter(d=>d.status==='Online').length} ONLINE
                    </span>
                  </div>

                  {/* Device Grid list */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="endpoint-devices-grid">
                    {devices.map((dev) => {
                      const rssiQuality = dev.wifiRssi > -60 ? 'Excellent' : dev.wifiRssi > -75 ? 'Good' : 'Weak';
                      const rssiColor = dev.wifiRssi > -60 ? 'text-emerald-400' : dev.wifiRssi > -75 ? 'text-yellow-400' : 'text-red-400';

                      return (
                        <div 
                          key={dev.chipId}
                          className="bg-[#090b20]/60 border border-blue-950 rounded-2xl p-6 space-y-5 shadow-xl hover:border-blue-800/40 transition-colors"
                        >
                          {/* Header header info */}
                          <div className="flex justify-between items-start border-b border-blue-950/80 pb-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-md font-bold text-white font-mono">{dev.deviceName}</h3>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${dev.status === 'Online' ? 'bg-emerald-950 border border-emerald-800 text-emerald-400' : 'bg-gray-950 border border-gray-800 text-gray-500'}`}>
                                  {dev.status}
                                </span>
                              </div>
                              <p className="text-[10px] font-mono text-gray-500">CHIP ID: {dev.chipId} | MAC: {dev.macAddress}</p>
                            </div>

                            <div className="text-right font-mono text-[10px] text-gray-500">
                              <span className="block text-gray-400 font-bold">{dev.ipAddress}</span>
                              <span>{dev.firmwareVersion}</span>
                            </div>
                          </div>

                          {/* Real-time Health Status Indicator & Heartbeat Pulse */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#040612]/80 border border-blue-950/60 px-4 py-2.5 rounded-xl gap-2 text-xs font-mono">
                            <div className="flex items-center gap-2">
                              <div className="relative flex items-center justify-center w-3 h-3">
                                {dev.status === 'Online' ? (
                                  <>
                                    <span className="absolute inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500/40 animate-ping" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 animate-pulse" />
                                  </>
                                ) : (
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                                )}
                              </div>
                              <span className="text-gray-500 font-bold text-[9px] tracking-wider uppercase">Health Monitor:</span>
                              <span className={`text-[10px] font-extrabold tracking-wider ${dev.status === 'Online' ? 'text-emerald-400' : 'text-red-400'}`}>
                                {dev.status === 'Online' ? 'HEALTHY / ONLINE' : 'DISCONNECTED'}
                              </span>
                            </div>

                            <div className="text-[10px] text-gray-500 flex items-center gap-2">
                              <span className="uppercase font-bold text-gray-600 text-[9px] tracking-wider">Last Seen:</span>
                              <span className="text-gray-300 font-bold bg-[#090b24] px-2 py-0.5 border border-blue-950 rounded font-mono">
                                {dev.lastSeen ? new Date(dev.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'NEVER'}
                              </span>
                            </div>
                          </div>

                          {/* Dials / stats meters */}
                          <div className="grid grid-cols-3 gap-4 font-mono text-xs" id={`dev-stats-${dev.chipId}`}>
                            
                            <div className="p-3 bg-[#040612] border border-blue-950 rounded-xl space-y-1">
                              <span className="text-[9px] text-gray-500 block uppercase font-bold">CPU Usage</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">{dev.cpuUsage}%</span>
                                <div className="flex-1 bg-gray-950 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-cyan-500 h-full" style={{ width: `${dev.cpuUsage}%` }}></div>
                                </div>
                              </div>
                            </div>

                            <div className="p-3 bg-[#040612] border border-blue-950 rounded-xl space-y-1">
                              <span className="text-[9px] text-gray-500 block uppercase font-bold">RAM Stack</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">{dev.ramUsage}%</span>
                                <div className="flex-1 bg-gray-950 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-indigo-500 h-full" style={{ width: `${dev.ramUsage}%` }}></div>
                                </div>
                              </div>
                            </div>

                            <div className="p-3 bg-[#040612] border border-blue-950 rounded-xl space-y-1">
                              <span className="text-[9px] text-gray-500 block uppercase font-bold">WiFi Uplink</span>
                              <div className="flex items-center gap-1">
                                <span className={`text-sm font-bold ${rssiColor}`}>{dev.wifiRssi} dBm</span>
                                <span className="text-[9px] text-gray-600 block uppercase">({rssiQuality})</span>
                              </div>
                            </div>

                          </div>

                          {/* Decoy services toggler */}
                          <div className="flex justify-between items-center bg-[#040612] p-3 border border-blue-950 rounded-xl text-xs font-mono">
                            <div>
                              <span className="text-white font-bold block">HONEYPOT DECOY SERVICES</span>
                              <span className="text-[10px] text-gray-500">Decoy ports SSH, DB, HTTP, SMB enabled</span>
                            </div>
                            
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={dev.honeypotEnabled}
                                onChange={e => toggleDecoyService(dev.chipId, e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>

                          {/* Control buttons */}
                          <div className="flex justify-end gap-2.5 border-t border-blue-950/80 pt-4">
                            <button 
                              onClick={() => triggerDeviceRestart(dev.chipId)}
                              className="px-4 py-2 bg-blue-950/80 hover:bg-blue-900/80 border border-blue-800/40 hover:border-blue-500 text-blue-400 hover:text-white text-xs font-bold font-mono rounded-lg transition-colors cursor-pointer"
                            >
                              Restart CPU
                            </button>
                            
                            <button 
                              onClick={() => pushGrowl(`OTA update scan initiated on node ${dev.deviceName}. Currently at latest version ${dev.firmwareVersion}`, 'Low')}
                              className="px-4 py-2 bg-blue-950/80 hover:bg-blue-900/80 border border-blue-800/40 text-gray-400 text-xs font-bold font-mono rounded-lg transition-colors cursor-pointer"
                            >
                              OTA Update Check
                            </button>
                          </div>

                        </div>
                      );
                    })}
                  </div>


                </div>
              )}

              {/* TAB 5: AUDIT LOGS (SPREADSHEET FILTER) */}
              {activeTab === 'logs' && (
                <div className="space-y-6" id="audit-logs-canvas">
                  
                  {/* Filter strip header */}
                  <div className="bg-[#090b20]/60 border border-blue-950 rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-blue-950/80 pb-3">
                      <div className="space-y-1">
                        <h2 className="text-md font-bold text-white font-mono uppercase">Administrative System Logs</h2>
                        <p className="text-xs text-gray-400 font-sans">Full record trace of SOC network status exchanges, firewall events, and API handshakes.</p>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => exportLogs('json')}
                          className="px-3.5 py-2 bg-blue-950/80 hover:bg-blue-900/80 border border-blue-800/40 text-blue-400 text-xs font-mono font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>JSON</span>
                        </button>
                        
                        <button 
                          onClick={() => exportLogs('csv')}
                          className="px-3.5 py-2 bg-blue-950/80 hover:bg-blue-900/80 border border-blue-800/40 text-blue-400 text-xs font-mono font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>CSV EXPORT</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="flex-1 relative font-mono text-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                          type="text" 
                          value={logSearchQuery}
                          onChange={e => setLogSearchQuery(e.target.value)}
                          placeholder="Search messages, modules, devices..."
                          className="w-full bg-[#040612] border border-blue-950 py-2.5 pl-10 pr-4 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <select 
                        value={logLevelFilter}
                        onChange={e => setLogLevelFilter(e.target.value)}
                        className="bg-[#040612] border border-blue-950 rounded-lg p-2.5 text-xs font-mono text-gray-300 focus:outline-none focus:border-blue-500"
                      >
                        <option value="All">All Log Levels</option>
                        <option value="INFO">INFO</option>
                        <option value="WARNING">WARNING</option>
                        <option value="SECURITY">SECURITY</option>
                        <option value="ERROR">ERROR</option>
                      </select>
                    </div>

                    <div className="text-[10px] font-mono text-gray-500">
                      <span>DISPLAYING {filteredLogs.length} OF {auditLogs.length} AUDIT LINES</span>
                    </div>
                  </div>

                  {/* Logs spreadsheet render */}
                  <div className="bg-[#090b20]/40 border border-blue-950 rounded-xl overflow-hidden shadow-xl" id="logs-table-container">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-mono text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#070918] text-gray-400 uppercase tracking-wider border-b border-blue-950 text-[10px]">
                            <th className="p-4">Timestamp</th>
                            <th className="p-4">Level</th>
                            <th className="p-4">Source Module</th>
                            <th className="p-4">Log Message Trace</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-950/50">
                          {filteredLogs.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-gray-500 italic">
                                No system log traces found matching this selection.
                              </td>
                            </tr>
                          ) : (
                            filteredLogs.map((log) => {
                              let badgeCol = "bg-blue-950 text-blue-400 border-blue-900";
                              if (log.level === 'WARNING') badgeCol = "bg-orange-950 text-orange-400 border-orange-900";
                              if (log.level === 'SECURITY') badgeCol = "bg-purple-950 text-purple-400 border-purple-900";
                              if (log.level === 'ERROR') badgeCol = "bg-red-950 text-red-400 border-red-900";

                              return (
                                <tr key={log.id} className="hover:bg-blue-950/20 transition-colors">
                                  <td className="p-4 text-gray-400 select-all whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                  <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${badgeCol}`}>
                                      {log.level}
                                    </span>
                                  </td>
                                  <td className="p-4 text-cyan-400 font-bold">{log.source}</td>
                                  <td className="p-4 text-gray-200 select-all font-sans text-xs leading-relaxed">{log.message}</td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 6: ANALYTICAL ENGINE */}
              {activeTab === 'analytics' && (
                <div className="space-y-6" id="analytics-engine-canvas">
                  <div className="bg-[#090b20]/40 border border-blue-950 rounded-xl p-4 flex justify-between items-center">
                    <div className="space-y-1">
                      <h2 className="text-lg font-bold text-white font-mono uppercase">Statistical Metrics Center</h2>
                      <p className="text-xs text-gray-400">Live breakdowns of captured packets, protocol allocations, and timeline intensity curves.</p>
                    </div>

                    <button 
                      onClick={() => pushGrowl('Generating fresh analytical compilation...', 'Low')}
                      className="px-3 py-1.5 bg-[#040612] border border-blue-950 rounded-lg hover:border-blue-500 text-blue-400 font-bold font-mono text-xs cursor-pointer"
                    >
                      Recalculate
                    </button>
                  </div>

                  {/* Render Chart panels */}
                  <AnalyticsCharts analyticsData={compileAnalytics()} />

                  {/* Real-time D3 temporal heatmap */}
                  <div className="bg-[#090b20]/40 border border-blue-950 rounded-xl p-5" id="temporal-heatmap-wrapper">
                    <TemporalHeatmap attacks={attacks} />
                  </div>

                  {/* Bento helper stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="bento-analytics-helpers">
                    
                    <div className="bg-[#090b20]/40 border border-blue-950 rounded-xl p-5 space-y-4">
                      <div className="border-b border-blue-950/80 pb-3">
                        <h3 className="text-sm font-bold text-white font-mono uppercase">TARGET PORT VELOCITY</h3>
                      </div>
                      <div className="space-y-3 font-mono text-xs">
                        {[
                          { port: 22, proto: 'SSH', count: attacks.filter(a=>a.destPort===22).length, color: 'bg-blue-500' },
                          { port: 3306, proto: 'MySQL', count: attacks.filter(a=>a.destPort===3306).length, color: 'bg-cyan-500' },
                          { port: 23, proto: 'Telnet', count: attacks.filter(a=>a.destPort===23).length, color: 'bg-indigo-500' },
                          { port: 445, proto: 'SMB', count: attacks.filter(a=>a.destPort===445).length, color: 'bg-red-500' }
                        ].map(p => {
                          const total = attacks.length || 1;
                          const perc = Math.round((p.count / total) * 100);
                          return (
                            <div key={p.port} className="space-y-1.5">
                              <div className="flex justify-between">
                                <span>PORT {p.port} ({p.proto})</span>
                                <span className="text-white font-bold">{p.count} hits ({perc}%)</span>
                              </div>
                              <div className="w-full bg-[#040612] h-2 rounded-full overflow-hidden border border-blue-950/30">
                                <div className={`h-full ${p.color}`} style={{ width: `${perc}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-[#090b20]/40 border border-blue-950 rounded-xl p-5 space-y-4">
                      <div className="border-b border-blue-950/80 pb-3">
                        <h3 className="text-sm font-bold text-white font-mono uppercase">AI MODEL HEALTH DIAGNOSTICS</h3>
                      </div>
                      <div className="space-y-3.5 font-sans text-xs text-gray-400">
                        <div className="flex justify-between border-b border-blue-950/40 pb-2">
                          <span className="font-mono text-white font-bold">Threat Engine:</span>
                          <span className="font-mono text-cyan-400">Google Gemini AI Engine</span>
                        </div>
                        <div className="flex justify-between border-b border-blue-950/40 pb-2">
                          <span className="font-mono text-white font-bold">Inference Model:</span>
                          <span className="font-mono text-white">gemini-3.6-flash (System-default)</span>
                        </div>
                        <div className="flex justify-between border-b border-blue-950/40 pb-2">
                          <span className="font-mono text-white font-bold">Inference Speed:</span>
                          <span className="font-mono text-emerald-400">~1.2 seconds latency</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-mono text-white font-bold">Rule Fallback redundancy:</span>
                          <span className="font-mono text-emerald-400">Fully Automated & Active</span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 7: SIGNATURES & REPORTS */}
              {activeTab === 'reports' && (
                <div className="space-y-6" id="reports-signatures-canvas">
                  <ReportPanel recentAttacks={attacks} activeAttack={selectedAttack} />
                </div>
              )}

              {/* TAB 8: SYSTEM SETTINGS (FIREWALL MANAGEMENT) */}
              {activeTab === 'settings' && (
                <div className="space-y-6 font-mono text-xs" id="settings-canvas">
                  
                  {/* Title strip */}
                  <div className="bg-[#090b20]/40 border border-blue-950 rounded-xl p-4">
                    <h2 className="text-lg font-bold text-white uppercase font-mono">SOC Defensive Settings</h2>
                    <p className="text-xs text-gray-400">Configure core simulation speeds, whitelist/blacklist firewall rules, and wipe active databases.</p>
                  </div>

                  {/* blacklists bento blocks */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="settings-blocks-grid">
                    
                    {/* Blocklist form */}
                    <div className="lg:col-span-7 bg-[#090b20]/60 border border-blue-950 rounded-xl p-5 space-y-4">
                      <div className="border-b border-blue-950 pb-3 mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Firewall Blacks list (ACLs)</h3>
                        <span className="px-2 py-0.5 bg-red-950 border border-red-800 text-red-400 rounded font-bold">{blockedIPs.length} BLOCKED</span>
                      </div>

                      <p className="text-xs text-gray-400 font-sans leading-relaxed">
                        Add raw IP addresses below to activate local perimeter firewall blocks. Dropped packets do not reach the active honeypot nodes and are immediately blocked.
                      </p>

                      <form onSubmit={handleManualAddBlock} className="flex gap-2">
                        <input 
                          type="text" 
                          value={newBlockIP}
                          onChange={e => setNewBlockIP(e.target.value)}
                          placeholder="Enter malicious IP (e.g. 198.51.100.99)"
                          className="flex-1 bg-[#040612] border border-blue-950 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                        />
                        <button 
                          type="submit"
                          className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Add Block IP
                        </button>
                      </form>

                      <div className="space-y-2 mt-4 max-h-[220px] overflow-y-auto">
                        {blockedIPs.length === 0 ? (
                          <div className="text-center py-6 text-gray-500 italic font-sans">
                            No IP addresses inside firewall restriction pools.
                          </div>
                        ) : (
                          blockedIPs.map(ip => (
                            <div key={ip} className="flex items-center justify-between bg-[#040612]/80 p-3 border border-blue-950/60 rounded-xl">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                                <span className="font-bold text-white">{ip}</span>
                              </div>
                              
                              <button 
                                onClick={() => toggleIPBlock(ip, false)}
                                className="px-3 py-1.5 bg-blue-950 hover:bg-blue-900 text-blue-400 rounded-lg border border-blue-900/30 transition-colors cursor-pointer text-[10px]"
                              >
                                Whitelist (Release)
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Operational controls */}
                    <div className="lg:col-span-5 bg-[#090b20]/60 border border-blue-950 rounded-xl p-5 space-y-4">
                      <div className="border-b border-blue-950 pb-3 mb-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Operational Console Limits</h3>
                      </div>

                      <div className="space-y-4">
                        {/* Simulation trigger config info */}
                        <div className="space-y-1 bg-[#040612] p-3 border border-blue-950 rounded-xl">
                          <span className="text-[10px] text-gray-500 font-bold block uppercase">Simulator Loop Frequency</span>
                          <span className="text-white block font-bold mt-0.5">Every 18 Seconds</span>
                          <p className="text-[10px] text-gray-500 font-sans mt-1 leading-relaxed">Continuous simulated attack probes run in the background server-side to keep dashboards perfectly alive.</p>
                        </div>

                        {/* Database clear button */}
                        <div className="space-y-2 bg-[#040612] p-3 border border-blue-950 rounded-xl">
                          <span className="text-[10px] text-gray-500 font-bold block uppercase">In-Memory Database wipe</span>
                          <p className="text-[10px] text-gray-500 font-sans leading-relaxed">
                            Since all databases are saved in safe ephemeral RAM space, clearing variables simply resets the runtime logs and restores initial seed states.
                          </p>

                          <button 
                            onClick={() => {
                              setAttacks([]);
                              setAuditLogs(prev => [
                                {
                                  id: Math.random().toString(),
                                  timestamp: new Date().toISOString(),
                                  level: 'SECURITY',
                                  source: 'DATABASE',
                                  message: 'In-memory telemetry logs cleared manually by user instruction.'
                                },
                                ...prev
                              ]);
                              pushGrowl('Attacks database wiped.', 'Medium');
                            }}
                            className="px-3.5 py-2 bg-red-950/60 hover:bg-red-900/60 border border-red-800 text-red-400 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Reset Attack Logs
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 9: AI COGNITIVE THREAT LABORATORY */}
              {activeTab === 'ai-analyzer' && (
                <AIAnalyzer 
                  recentAttacks={attacks} 
                  pushGrowl={pushGrowl} 
                />
              )}

              {/* TAB 10: FOUNDING TEAM */}
              {activeTab === 'team' && (
                <TeamSection />
              )}

            </main>
          </div>

          {/* Console bottom footer strip */}
          <footer className="bg-[#070918] border-t border-blue-950/60 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500" id="soc-bottom-footer">
            <div className="flex items-center gap-2">
              <FalconShieldLogo className="w-5 h-5 text-cyan-400" />
              <span className="font-mono text-gray-400 font-bold uppercase tracking-wider">XSZO AI Security Operations Platform</span>
            </div>
            
            <div className="flex items-center gap-4 font-mono text-[11px]">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Express Server Link Active</span>
              </div>
              <span className="text-gray-700">|</span>
              <span>Memory buffer persistence only (RAM)</span>
            </div>
          </footer>

        </div>
      )}

    </div>
  );
}
