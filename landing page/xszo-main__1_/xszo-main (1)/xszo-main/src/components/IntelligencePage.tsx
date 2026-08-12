import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, Cpu, Activity, Server, Zap, Compass, Terminal, ArrowRight,
  CheckCircle, Globe, Network, Radio, Sparkles, AlertTriangle, Play,
  MapPin, ShieldAlert, Key, Map, Database, LineChart, MessageSquare,
  ChevronRight, RefreshCw, Layers, Send, Search,
  Settings, Fingerprint, Clock, FileText, Eye,
  BookOpen, Code, Github, Linkedin, Youtube, Instagram,
  Target, Brain, Crosshair, Filter, BarChart2, TrendingUp,
  Lock, Wifi, HardDrive, Cloud, Smartphone, Box,
  AlertCircle, ChevronDown, X, Plus, Minus, ZoomIn, RotateCcw,
  Download, ExternalLink, Bell, Star, Users, User, Hash,
  Link, Anchor, Radar, ScanLine, Layers2, Maximize2, Info,
  CircleDot, Hexagon, Triangle, Square
} from 'lucide-react';
import { FalconShieldLogo } from './LandingPage.jsx';

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface IntelligencePageProps {
  onNavigateHome?: () => void;
  onNavigateLogin?: () => void;
  onNavigateDemo?: () => void;
  onNavigateAbout?: () => void;
}

/* ─────────────────────────────────────────────
   DEMO DATA (clearly labelled as demo)
───────────────────────────────────────────── */
const DEMO_THREAT_EVENTS = [
  { id: 'E001', time: '14:42:11', severity: 'CRITICAL', type: 'Brute Force Detected', ip: '198.51.100.23', region: 'Eastern Europe', risk: 95 },
  { id: 'E002', time: '14:42:18', severity: 'HIGH',     type: 'Suspicious Login Attempt', ip: '203.0.113.45', region: 'Asia Pacific', risk: 78 },
  { id: 'E003', time: '14:42:35', severity: 'HIGH',     type: 'Port Scan Activity', ip: '172.16.45.89', region: 'Middle East', risk: 72 },
  { id: 'E004', time: '14:42:07', severity: 'HIGH',     type: 'Malicious HTTP Request', ip: '45.77.13.16', region: 'South America', risk: 69 },
  { id: 'E005', time: '14:41:55', severity: 'LOW',      type: 'Anomalous Behaviour', ip: '198.51.217', region: 'North Africa', risk: 34 },
  { id: 'E006', time: '14:41:40', severity: 'MEDIUM',   type: 'Credential Attack', ip: '104.21.89.31', region: 'Southeast Asia', risk: 55 },
];

const DEMO_THREAT_ACTORS = [
  {
    id: 'TA001', name: 'APT-X31', risk: 'HIGH RISK', firstSeen: '2023-01-18', lastSeen: '2024-05-21',
    sectors: ['Government', 'Finance', 'IT'], techniques: ['T1059', 'T1078', 'T1105'],
    ips: 127, domains: 23, campaigns: 7, status: 'UNCOVERED THREAT ACTOR'
  },
  {
    id: 'TA002', name: 'SHADOW-NULL', risk: 'CRITICAL', firstSeen: '2022-08-04', lastSeen: '2024-05-19',
    sectors: ['Defence', 'Aerospace', 'Energy'], techniques: ['T1190', 'T1566', 'T1027'],
    ips: 89, domains: 41, campaigns: 12, status: 'ACTIVE CAMPAIGN'
  },
  {
    id: 'TA003', name: 'PHANTOM-9', risk: 'MEDIUM', firstSeen: '2023-11-02', lastSeen: '2024-04-15',
    sectors: ['Healthcare', 'Education'], techniques: ['T1486', 'T1071'],
    ips: 34, domains: 9, campaigns: 3, status: 'MONITORING'
  },
];

const IOC_SAMPLES = [
  { indicator: '198.51.100.23', type: 'IP', risk: 95, firstSeen: '2024-05-20', lastSeen: '2024-05-21' },
  { indicator: '203.0.113.45',  type: 'IP', risk: 78, firstSeen: '2024-05-21', lastSeen: '2024-05-21' },
  { indicator: 'malicious-domain.com', type: 'Domain', risk: 83, firstSeen: '2024-04-12', lastSeen: '2024-05-21' },
  { indicator: 'hxxp://bad-site[.]com', type: 'URL', risk: 91, firstSeen: '2024-05-18', lastSeen: '2024-05-21' },
];

const INTEL_CAPABILITIES = [
  { icon: Globe, label: 'IP INTELLIGENCE', desc: 'Investigate suspicious IP addresses, reputation, activity and behaviour.', color: 'cyan' },
  { icon: Network, label: 'DOMAIN INTELLIGENCE', desc: 'Analyze suspicious domains and infrastructure relationships.', color: 'blue' },
  { icon: Link, label: 'URL INTELLIGENCE', desc: 'Identify malicious and suspicious URLs in real-time.', color: 'violet' },
  { icon: Target, label: 'THREAT ACTORS', desc: 'Understand attacker identities, behaviours and campaigns.', color: 'red' },
  { icon: Fingerprint, label: 'IOC INTELLIGENCE', desc: 'Correlate indicators of compromise across security events.', color: 'orange' },
  { icon: Layers, label: 'CAMPAIGN INTELLIGENCE', desc: 'Connect related attacks and infrastructure into broader campaigns.', color: 'emerald' },
];

const ATTACK_PATTERNS = [
  { stage: '01', label: 'Reconnaissance', icon: ScanLine, desc: 'Passive information gathering, open-source intelligence collection, network scanning.' },
  { stage: '02', label: 'Initial Access', icon: Key, desc: 'Phishing, exploit public-facing application, supply chain compromise.' },
  { stage: '03', label: 'Credential Access', icon: Fingerprint, desc: 'Brute force, credential dumping, password spraying.' },
  { stage: '04', label: 'Execution', icon: Terminal, desc: 'Command-line interface, scripting, scheduled tasks.' },
  { stage: '05', label: 'Discovery', icon: Search, desc: 'Network service discovery, account discovery, file enumeration.' },
  { stage: '06', label: 'Persistence', icon: Anchor, desc: 'Registry modification, startup item, web shell.' },
  { stage: '07', label: 'Command & Control', icon: Radio, desc: 'Encrypted channel, protocol tunnelling, domain generation.' },
  { stage: '08', label: 'Exfiltration', icon: Download, desc: 'Automated exfiltration, data transfer size limits, encrypted channels.' },
];

const INTEL_WORKFLOW = [
  { step: '01', label: 'COLLECT', desc: 'Gather signals from multiple security sources', icon: Database },
  { step: '02', label: 'ENRICH', desc: 'Add context and metadata to raw signals', icon: Layers2 },
  { step: '03', label: 'CORRELATE', desc: 'Connect related events and indicators', icon: Network },
  { step: '04', label: 'ANALYZE', desc: 'AI-driven pattern detection and behaviour analysis', icon: Brain },
  { step: '05', label: 'SCORE', desc: 'Calculate threat risk and confidence levels', icon: BarChart2 },
  { step: '06', label: 'ACT', desc: 'Deliver actionable intelligence for defence decisions', icon: Zap },
];

const INTEL_FEEDS = [
  { name: 'Internal Security Events', status: 'ACTIVE', signals: '12.8M+', reliability: 98, color: 'emerald' },
  { name: 'HoneyBot Telemetry', status: 'ACTIVE', signals: '3.2M+', reliability: 95, color: 'cyan' },
  { name: 'Threat Intelligence APIs', status: 'CONFIGURABLE', signals: '–', reliability: 0, color: 'orange' },
  { name: 'Security Research', status: 'ACTIVE', signals: '890K+', reliability: 90, color: 'blue' },
  { name: 'Open Intelligence Sources', status: 'ACTIVE', signals: '5.4M+', reliability: 82, color: 'violet' },
];

const DARK_WEB_CATEGORIES = [
  { label: 'Credential Exposure', icon: Key, count: '–', note: 'Demo only' },
  { label: 'Data Leak Signals', icon: Database, count: '–', note: 'Demo only' },
  { label: 'Threat Discussions', icon: MessageSquare, count: '–', note: 'Demo only' },
  { label: 'Compromised Infrastructure', icon: Server, count: '–', note: 'Demo only' },
  { label: 'Brand Abuse Signals', icon: AlertTriangle, count: '–', note: 'Demo only' },
];

/* ─────────────────────────────────────────────
   MINI GLOBE SVG  (CSS animated)
───────────────────────────────────────────── */
const IntelGlobe = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    {/* Outer glow rings */}
    <div className="absolute w-[420px] h-[420px] rounded-full border border-cyan-500/10 animate-[spin_40s_linear_infinite]" />
    <div className="absolute w-[360px] h-[360px] rounded-full border border-dashed border-blue-500/15 animate-[spin_30s_linear_infinite_reverse]" />
    <div className="absolute w-[300px] h-[300px] rounded-full border border-violet-500/10 animate-[spin_50s_linear_infinite]" />

    {/* Glow aura */}
    <div className="absolute w-72 h-72 rounded-full bg-blue-600/10 blur-3xl" />
    <div className="absolute w-48 h-48 rounded-full bg-cyan-500/15 blur-2xl animate-pulse" />

    {/* Globe SVG */}
    <svg viewBox="0 0 400 400" className="w-80 h-80 relative z-10 drop-shadow-[0_0_40px_rgba(6,182,212,0.4)]">
      <defs>
        <radialGradient id="globeGrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#1e40af" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#0c1a4b" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#020817" stopOpacity="1" />
        </radialGradient>
        <radialGradient id="globeShine" cx="30%" cy="25%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <filter id="nodeGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Globe body */}
      <circle cx="200" cy="200" r="180" fill="url(#globeGrad)" stroke="#1e3a5f" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="180" fill="url(#globeShine)" />

      {/* Latitude lines */}
      {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((y, i) => (
        <ellipse key={i} cx="200" cy={y} rx={Math.sqrt(Math.max(0, 180*180 - (y-200)*(y-200)))} ry="8"
          fill="none" stroke="#1e3a8a" strokeWidth="0.5" strokeOpacity="0.6" />
      ))}

      {/* Longitude lines */}
      {[0, 30, 60, 90, 120, 150].map((angle, i) => (
        <ellipse key={i} cx="200" cy="200" rx={Math.cos(angle * Math.PI / 180) * 180} ry="180"
          fill="none" stroke="#1e3a8a" strokeWidth="0.5" strokeOpacity="0.5" />
      ))}

      {/* Continents - simplified shapes */}
      <g fill="#1e40af" fillOpacity="0.6" stroke="#38bdf8" strokeWidth="0.5" strokeOpacity="0.4">
        {/* North America */}
        <path d="M80 130 L110 120 L140 125 L150 145 L145 170 L130 190 L110 200 L90 190 L75 165 Z" />
        {/* South America */}
        <path d="M115 220 L140 215 L150 235 L148 265 L135 285 L120 280 L108 260 L105 235 Z" />
        {/* Europe */}
        <path d="M190 120 L220 115 L235 125 L230 140 L215 148 L195 145 L185 132 Z" />
        {/* Africa */}
        <path d="M195 155 L225 150 L238 168 L240 200 L235 230 L220 245 L205 242 L192 225 L188 195 L188 168 Z" />
        {/* Asia */}
        <path d="M240 110 L310 105 L340 120 L345 145 L330 165 L300 175 L270 180 L248 170 L235 150 L238 128 Z" />
        {/* Australia */}
        <path d="M295 230 L325 225 L338 238 L335 258 L318 268 L298 262 L287 248 Z" />
      </g>

      {/* Attack/threat nodes */}
      {[
        { cx: 100, cy: 155, color: '#ef4444', size: 5, pulse: true },
        { cx: 315, cy: 135, color: '#f97316', size: 4, pulse: true },
        { cx: 210, cy: 170, color: '#ef4444', size: 3, pulse: false },
        { cx: 135, cy: 248, color: '#eab308', size: 3, pulse: true },
        { cx: 310, cy: 245, color: '#f97316', size: 3, pulse: false },
        { cx: 260, cy: 130, color: '#06b6d4', size: 4, pulse: true },
        { cx: 180, cy: 200, color: '#8b5cf6', size: 3, pulse: false },
      ].map((node, i) => (
        <g key={i} filter="url(#nodeGlow)">
          {node.pulse && (
            <circle cx={node.cx} cy={node.cy} r={node.size * 2.5} fill={node.color} fillOpacity="0.15">
              <animate attributeName="r" values={`${node.size * 1.5};${node.size * 3};${node.size * 1.5}`} dur="2s" repeatCount="indefinite" />
              <animate attributeName="fill-opacity" values="0.15;0.05;0.15" dur="2s" repeatCount="indefinite" />
            </circle>
          )}
          <circle cx={node.cx} cy={node.cy} r={node.size} fill={node.color} fillOpacity="0.9" />
        </g>
      ))}

      {/* Attack route lines */}
      <g stroke="#ef4444" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4 3" fill="none">
        <path d="M100 155 Q 180 120 260 130">
          <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M315 135 Q 270 160 210 170">
          <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1.5s" repeatCount="indefinite" />
        </path>
        <path d="M135 248 Q 165 220 180 200">
          <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="2.5s" repeatCount="indefinite" />
        </path>
      </g>

      {/* Intelligence signal rings */}
      <g stroke="#06b6d4" strokeWidth="1" fill="none" strokeOpacity="0.5">
        <circle cx="260" cy="130" r="12" strokeDasharray="3 2">
          <animate attributeName="r" values="8;18;8" dur="3s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Globe edge glow */}
      <circle cx="200" cy="200" r="180" fill="none" stroke="#06b6d4" strokeWidth="2" strokeOpacity="0.3" />
      <circle cx="200" cy="200" r="178" fill="none" stroke="#38bdf8" strokeWidth="0.5" strokeOpacity="0.5" />
    </svg>

    {/* Floating data labels */}
    {[
      { label: 'CRITICAL', val: '24', color: 'text-red-400', pos: 'top-6 right-8' },
      { label: 'HIGH', val: '78', color: 'text-orange-400', pos: 'top-16 right-8' },
      { label: 'MEDIUM', val: '142', color: 'text-yellow-400', pos: 'top-24 right-8' },
      { label: 'LOW', val: '256', color: 'text-green-400', pos: 'top-32 right-8' },
    ].map((item, i) => (
      <div key={i} className={`absolute ${item.pos} bg-[#06101F]/90 border border-blue-900/60 rounded-lg px-3 py-1.5 flex items-center gap-3 backdrop-blur-sm`}>
        <div className={`w-1.5 h-1.5 rounded-full ${item.color.replace('text-', 'bg-')} animate-pulse`} />
        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">{item.label}</span>
        <span className={`text-sm font-bold font-mono ${item.color}`}>{item.val}</span>
      </div>
    ))}

    {/* Bottom stats bar */}
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
      {[
        { label: 'THREAT SIGNALS', val: '12.8M+' },
        { label: 'COUNTRIES', val: '180+' },
        { label: 'IOC DATABASE', val: '6.2M+' },
        { label: 'AI CORRELATION', val: '98.7%' },
      ].map((s, i) => (
        <div key={i} className="text-center bg-[#060f23]/80 border border-blue-900/40 rounded-xl px-4 py-2 backdrop-blur-sm">
          <div className="text-cyan-400 font-bold text-sm font-mono">{s.val}</div>
          <div className="text-[9px] text-gray-500 font-mono uppercase tracking-widest">{s.label}</div>
        </div>
      ))}
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   AI BRAIN SVG
───────────────────────────────────────────── */
const AIBrain = () => (
  <div className="relative w-48 h-48 flex items-center justify-center">
    <div className="absolute w-48 h-48 rounded-full bg-cyan-500/10 blur-2xl animate-pulse" />
    <div className="absolute w-32 h-32 rounded-full border border-cyan-500/20 animate-[spin_20s_linear_infinite]" />
    <div className="absolute w-40 h-40 rounded-full border border-dashed border-blue-500/15 animate-[spin_15s_linear_infinite_reverse]" />
    <svg viewBox="0 0 120 120" className="w-32 h-32 relative z-10 drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]">
      <defs>
        <radialGradient id="brainGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.3" />
        </radialGradient>
      </defs>
      {/* Brain shape */}
      <path d="M60 15 C35 12, 18 28, 18 45 C18 55, 23 62, 30 67 C25 72, 22 80, 25 88 C28 96, 38 102, 48 100 C52 108, 60 112, 60 112 C60 112, 68 108, 72 100 C82 102, 92 96, 95 88 C98 80, 95 72, 90 67 C97 62, 102 55, 102 45 C102 28, 85 12, 60 15 Z"
        fill="url(#brainGrad)" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.6" />
      {/* Neural pathways */}
      <path d="M60 30 L60 90 M45 40 L75 40 M38 60 L82 60 M42 78 L78 78" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
      {/* Neural nodes */}
      {[[60,30],[60,60],[60,90],[45,40],[75,40],[38,60],[82,60],[42,78],[78,78]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="2" fill="#06b6d4" fillOpacity="0.9">
          <animate attributeName="fill-opacity" values="0.4;0.9;0.4" dur={`${1.5 + i*0.3}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {/* Center pulse */}
      <circle cx="60" cy="60" r="8" fill="#06b6d4" fillOpacity="0.2">
        <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="60" cy="60" r="4" fill="#38bdf8" fillOpacity="0.8" />
    </svg>
  </div>
);

/* ─────────────────────────────────────────────
   THREAT SCORE RING
───────────────────────────────────────────── */
const ThreatScoreRing = ({ score = 87 }: { score?: number }) => {
  const r = 70;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = score >= 80 ? '#ef4444' : score >= 60 ? '#f97316' : score >= 40 ? '#eab308' : '#22c55e';

  return (
    <div className="relative flex items-center justify-center w-52 h-52">
      <svg viewBox="0 0 180 180" className="w-52 h-52 -rotate-90">
        <circle cx="90" cy="90" r={r} fill="none" stroke="#1e293b" strokeWidth="14" />
        <circle cx="90" cy="90" r={r} fill="none" stroke={color} strokeWidth="14"
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${color})` }}>
          <animate attributeName="stroke-dashoffset" from={c} to={offset} dur="1.5s" fill="freeze" />
        </circle>
        {/* Inner rings */}
        <circle cx="90" cy="90" r="55" fill="none" stroke="#1e3a5f" strokeWidth="1" strokeDasharray="3 4" />
        <circle cx="90" cy="90" r="40" fill="none" stroke="#1e3a5f" strokeWidth="0.5" />
      </svg>
      <div className="absolute text-center rotate-0">
        <div className="text-5xl font-black text-white font-mono" style={{ color }}>{score}</div>
        <div className="text-xs text-gray-400 font-mono tracking-widest uppercase">/ 100</div>
        <div className="text-[10px] text-red-400 font-bold font-mono mt-0.5 uppercase">THREAT RISK</div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MINI WORLD MAP (SVG)
───────────────────────────────────────────── */
const WorldMapSVG = () => (
  <svg viewBox="0 0 800 400" className="w-full h-full opacity-60">
    <rect width="800" height="400" fill="#020817" />
    {/* Simplified continent shapes */}
    <g fill="#1e3a8a" stroke="#06b6d4" strokeWidth="0.5" strokeOpacity="0.4">
      {/* North America */}
      <path d="M80 60 L160 50 L200 70 L210 110 L200 150 L170 180 L140 200 L110 190 L85 160 L70 110 Z" />
      {/* South America */}
      <path d="M150 220 L200 210 L220 240 L218 290 L200 330 L175 335 L155 310 L145 270 Z" />
      {/* Europe */}
      <path d="M350 50 L430 45 L445 65 L440 90 L410 100 L370 95 L350 75 Z" />
      {/* Africa */}
      <path d="M360 110 L430 105 L450 135 L455 190 L445 250 L420 270 L395 268 L370 240 L358 195 L355 140 Z" />
      {/* Asia */}
      <path d="M450 40 L640 35 L680 60 L690 110 L660 140 L600 160 L540 165 L490 150 L460 120 L448 70 Z" />
      {/* Australia */}
      <path d="M585 245 L660 235 L680 260 L675 305 L648 320 L608 315 L585 290 Z" />
    </g>
    {/* Attack nodes */}
    {[
      {x:120,y:120,c:'#ef4444'},{x:620,y:80,c:'#f97316'},{x:390,y:140,c:'#ef4444'},
      {x:165,y:280,c:'#eab308'},{x:635,y:280,c:'#f97316'},{x:510,y:90,c:'#06b6d4'},
      {x:395,y:75,c:'#8b5cf6'},{x:470,y:130,c:'#ef4444'},
    ].map((n,i) => (
      <g key={i}>
        <circle cx={n.x} cy={n.y} r="8" fill={n.c} fillOpacity="0.1">
          <animate attributeName="r" values="6;14;6" dur={`${2+i*0.4}s`} repeatCount="indefinite"/>
        </circle>
        <circle cx={n.x} cy={n.y} r="3.5" fill={n.c} fillOpacity="0.9"/>
      </g>
    ))}
    {/* Attack lines */}
    <g stroke="#ef4444" strokeWidth="1" strokeOpacity="0.35" fill="none" strokeDasharray="5 4">
      <line x1="120" y1="120" x2="510" y2="90"><animate attributeName="stroke-dashoffset" from="0" to="-20" dur="2s" repeatCount="indefinite"/></line>
      <line x1="620" y1="80" x2="390" y2="140"><animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1.8s" repeatCount="indefinite"/></line>
      <line x1="165" y1="280" x2="395" y2="75"><animate attributeName="stroke-dashoffset" from="0" to="-20" dur="2.5s" repeatCount="indefinite"/></line>
    </g>
  </svg>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function IntelligencePage({
  onNavigateHome,
  onNavigateLogin,
  onNavigateDemo,
  onNavigateAbout,
}: IntelligencePageProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeCapability, setActiveCapability] = useState<number | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<number | null>(null);
  const [selectedActor, setSelectedActor] = useState<number>(0);
  const [iocQuery, setIocQuery] = useState('');
  const [iocType, setIocType] = useState<'IP' | 'Domain' | 'URL' | 'Hash'>('IP');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'XSZO Intelligence Analyst online. Enter an IP, domain, URL or question to begin your investigation.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [threatFilter, setThreatFilter] = useState<'All' | 'Critical' | 'High' | 'Medium' | 'Low'>('All');
  const [selectedRiskBreakdown, setSelectedRiskBreakdown] = useState(0);
  const [graphZoom, setGraphZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [activeTimeline, setActiveTimeline] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setTimeout(() => {
      const responses: Record<string, string> = {
        default: `Analyzing: "${userMsg}"\n\n⚠ DEMO MODE ACTIVE — No live backend connected.\n\nIn a live environment, XSZO Intelligence would correlate this indicator against 12.8M+ threat signals, cross-reference our IOC database, and return: risk score, related campaigns, infrastructure links, and recommended defensive actions.\n\nConnect a live data source to enable real-time analysis.`,
        ip: `IP INTELLIGENCE REPORT [DEMO]\n\nIndicator: ${userMsg}\nType: IPv4 Address\nRisk Score: DEMO DATA\nGeolocation: Approximate only — IP geolocation is not exact.\nASN: Demo only\n\n⚠ This is demonstration output. Real data requires live backend telemetry.`,
        domain: `DOMAIN INTELLIGENCE REPORT [DEMO]\n\nIndicator: ${userMsg}\nType: Domain\nRegistrar: Demo data\nDNS History: Demo only\nSubdomains Observed: Demo only\n\n⚠ Real intelligence requires live data connection.`,
      };
      const lwr = userMsg.toLowerCase();
      let reply = responses.default;
      if (/^\d+\.\d+\.\d+\.\d+/.test(lwr)) reply = responses.ip;
      else if (/\.[a-z]{2,}$/.test(lwr)) reply = responses.domain;
      setChatMessages(prev => [...prev, { role: 'ai', text: reply }]);
    }, 900);
  };

  const filteredEvents = DEMO_THREAT_EVENTS.filter(e =>
    threatFilter === 'All' || e.severity === threatFilter.toUpperCase()
  );

  const riskBreakdown = [
    { label: 'Reputation', value: 91 },
    { label: 'Behaviour', value: 84 },
    { label: 'Frequency', value: 88 },
    { label: 'Infrastructure', value: 79 },
    { label: 'Attack History', value: 93 },
    { label: 'Correlation', value: 87 },
  ];

  const timelineStages = [
    { label: 'FIRST OBSERVED', date: '2024-03-12', desc: 'Initial signal detected via HoneyBot telemetry.' },
    { label: 'ACTIVITY DETECTED', date: '2024-03-18', desc: 'Repeated probe activity across multiple sensors.' },
    { label: 'INFRASTRUCTURE LINKED', date: '2024-04-02', desc: 'Domain and IP infrastructure correlated.' },
    { label: 'BEHAVIOUR CORRELATED', date: '2024-04-15', desc: 'Attack pattern matched known TTPs.' },
    { label: 'RISK ESCALATED', date: '2024-05-01', desc: 'Threat score elevated to HIGH by AI engine.' },
    { label: 'SECURITY RESPONSE', date: '2024-05-20', desc: 'Indicators pushed to firewall and SIEM.' },
  ];

  const graphNodes = [
    { id: 'actor', label: 'APT-X31', type: 'actor', x: 260, y: 160, color: '#ef4444' },
    { id: 'ip1', label: '198.51.100.23', type: 'ip', x: 100, y: 80, color: '#06b6d4' },
    { id: 'ip2', label: '203.0.113.45', type: 'ip', x: 420, y: 80, color: '#06b6d4' },
    { id: 'domain', label: 'malicious-domain.com', type: 'domain', x: 130, y: 250, color: '#8b5cf6' },
    { id: 'server', label: 'C2 Server', type: 'server', x: 400, y: 250, color: '#f97316' },
    { id: 'campaign', label: 'Campaign #7', type: 'campaign', x: 260, y: 310, color: '#eab308' },
    { id: 'target', label: 'Target Org', type: 'target', x: 260, y: 60, color: '#22c55e' },
  ];

  const graphEdges = [
    ['actor', 'ip1'], ['actor', 'ip2'], ['actor', 'campaign'],
    ['ip1', 'domain'], ['ip2', 'server'], ['domain', 'campaign'], ['server', 'campaign'],
    ['campaign', 'target'], ['actor', 'target']
  ];

  const sevColor = (s: string) => ({
    CRITICAL: 'text-red-400 bg-red-950/50 border-red-800/60',
    HIGH: 'text-orange-400 bg-orange-950/50 border-orange-800/60',
    MEDIUM: 'text-yellow-400 bg-yellow-950/50 border-yellow-800/60',
    LOW: 'text-green-400 bg-green-950/50 border-green-800/60',
  }[s] || 'text-gray-400 bg-gray-950/50 border-gray-800');

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden relative">

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#030712]/90 backdrop-blur-xl border-b border-blue-950/60 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
          : 'bg-transparent py-5 border-b border-white/5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div onClick={onNavigateHome} className="flex items-center gap-3 cursor-pointer group select-none">
            <div className="relative flex items-center justify-center">
              <FalconShieldLogo className="w-9 h-9 transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-cyan-500/20 blur-lg rounded-full group-hover:bg-cyan-400/40 transition-all" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-lg tracking-wider font-mono flex items-center gap-1.5 leading-none">
                XSZO <span className="text-cyan-400 font-light">AI</span>
              </span>
              <span className="text-[9px] tracking-[0.25em] text-blue-400/80 font-mono font-semibold uppercase leading-tight mt-0.5">DEFENCE</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-7 text-xs font-mono tracking-wider text-gray-300">
            {['HOME','PLATFORM','AI SECURITY'].map(n => (
              <button key={n} onClick={onNavigateHome} className="hover:text-cyan-400 transition-colors cursor-pointer">{n}</button>
            ))}
            <button className="text-cyan-400 font-bold border-b border-cyan-400 pb-0.5 cursor-default">INTELLIGENCE</button>
            {['DEFENCE','RESEARCH'].map(n => (
              <button key={n} onClick={onNavigateHome} className="hover:text-cyan-400 transition-colors cursor-pointer">{n}</button>
            ))}
            <button onClick={onNavigateAbout} className="hover:text-cyan-400 transition-colors cursor-pointer">ABOUT</button>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onNavigateLogin}
              className="px-4 py-2 text-xs font-mono text-cyan-300 hover:text-white bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/50 rounded-lg transition-all cursor-pointer">
              Login
            </button>
            <button onClick={onNavigateDemo || onNavigateLogin}
              className="px-4 py-2 text-xs font-mono font-bold text-black bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-300 hover:brightness-110 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer flex items-center gap-1.5">
              Book a Demo <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── BACKGROUND ── */}
      <div className="absolute top-0 left-0 right-0 h-screen pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[160px]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-violet-600/4 rounded-full blur-[200px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* ═══════════════════════════════════════
          1. HERO SECTION
      ═══════════════════════════════════════ */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: Text */}
            <div className="space-y-7">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>XSZO INTELLIGENCE</span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05] font-sans">
                SEE THE THREAT<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 drop-shadow-[0_0_30px_rgba(56,189,248,0.4)]">
                  BEFORE IT<br />SEES YOU.
                </span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
                className="text-cyan-300 font-semibold text-lg font-mono">
                AI-powered intelligence for the modern digital battlefield.
              </motion.p>

              <motion.p initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
                className="text-gray-400 text-base leading-relaxed max-w-xl">
                "XSZO Intelligence transforms global threat signals, attacker behaviour, security events and infrastructure data into actionable cyber intelligence."
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-wrap gap-4">
                <a href="#intelligence-overview"
                  className="px-7 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono text-sm font-bold rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2 cursor-pointer">
                  <span>Explore Intelligence</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <button onClick={onNavigateDemo || onNavigateLogin}
                  className="px-7 py-3.5 bg-blue-950/60 hover:bg-blue-900/80 border border-blue-700/50 hover:border-cyan-400/50 text-cyan-300 hover:text-white font-mono text-sm font-semibold rounded-xl backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer">
                  <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>Request a Demo</span>
                </button>
              </motion.div>

              {/* Stats row */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                {[
                  { label: 'Threat Signals', val: '12.8M+', sub: 'Daily' },
                  { label: 'Countries', val: '180+', sub: 'Monitored' },
                  { label: 'IOC Database', val: '6.2M+', sub: 'Indicators' },
                  { label: 'AI Correlation', val: '98.7%', sub: 'Accuracy' },
                ].map((s, i) => (
                  <div key={i} className="bg-[#060f23]/80 border border-blue-900/40 rounded-xl p-3 text-center backdrop-blur-sm">
                    <div className="text-cyan-400 font-bold text-lg font-mono">{s.val}</div>
                    <div className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">{s.label}</div>
                    <div className="text-[9px] text-gray-600 font-mono">{s.sub}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Globe */}
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }}
              className="relative h-[520px] flex items-center justify-center">
              <IntelGlobe />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          2. INTELLIGENCE CAPABILITIES
      ═══════════════════════════════════════ */}
      <section id="intelligence-overview" className="py-24 border-t border-blue-950/40 bg-[#040919]/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest px-3 py-1 bg-blue-950/60 border border-blue-800/40 rounded-full">
              INTELLIGENCE CAPABILITIES
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              ONE INTELLIGENCE LAYER.<br />
              <span className="text-cyan-400">MULTIPLE THREAT SIGNALS.</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Unified intelligence covering every dimension of the threat landscape.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INTEL_CAPABILITIES.map((cap, i) => {
              const Icon = cap.icon;
              const colorMap: Record<string, string> = {
                cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400 shadow-cyan-500/10',
                blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400 shadow-blue-500/10',
                violet: 'from-violet-500/20 to-violet-500/5 border-violet-500/30 text-violet-400 shadow-violet-500/10',
                red: 'from-red-500/20 to-red-500/5 border-red-500/30 text-red-400 shadow-red-500/10',
                orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/30 text-orange-400 shadow-orange-500/10',
                emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10',
              };
              const cls = colorMap[cap.color];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  onMouseEnter={() => setActiveCapability(i)}
                  onMouseLeave={() => setActiveCapability(null)}
                  className={`relative bg-gradient-to-br ${cls.split(' ').slice(0,2).join(' ')} border ${cls.split(' ')[2]} rounded-2xl p-6 cursor-pointer transition-all duration-300 group overflow-hidden shadow-[0_8px_30px] ${cls.split(' ').slice(4).join(' ')} hover:scale-[1.02] hover:shadow-[0_12px_40px]`}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/3 to-transparent" />
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cls.split(' ').slice(0,2).join(' ')} border ${cls.split(' ')[2]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${cls.split(' ')[3]}`} />
                  </div>
                  <h3 className={`font-bold text-sm font-mono tracking-wider mb-2 ${cls.split(' ')[3]}`}>{cap.label}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{cap.desc}</p>
                  <div className={`mt-4 flex items-center gap-1 text-xs font-mono ${cls.split(' ')[3]} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          3. AI INTELLIGENCE ENGINE
      ═══════════════════════════════════════ */}
      <section className="py-24 relative z-10 border-t border-blue-950/40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-transparent to-violet-950/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: Pipeline */}
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest px-3 py-1 bg-violet-950/60 border border-violet-800/40 rounded-full">
                  AI ENGINE
                </span>
                <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  INTELLIGENCE<br /><span className="text-violet-400">POWERED BY AI</span>
                </h2>
                <p className="text-gray-400 text-base leading-relaxed">
                  "AI continuously correlates security signals to identify patterns that may be difficult to detect through isolated events."
                </p>
              </div>

              {/* Pipeline Steps */}
              <div className="space-y-3">
                {[
                  { label: 'Threat Signals', desc: 'Collect from multiple sources', icon: Radio, color: 'cyan' },
                  { label: 'AI Correlation', desc: 'Correlate & enrich data using advanced AI', icon: Brain, color: 'blue' },
                  { label: 'Behaviour Analysis', desc: 'Detect patterns & attacker behaviour', icon: Activity, color: 'violet' },
                  { label: 'Risk Scoring', desc: 'Calculate threat risk & confidence', icon: BarChart2, color: 'orange' },
                  { label: 'Threat Intelligence', desc: 'Actionable intelligence for defence', icon: Shield, color: 'red' },
                ].map((step, i) => {
                  const StepIcon = step.icon;
                  const sColor: Record<string, string> = {
                    cyan: 'text-cyan-400 bg-cyan-950/50 border-cyan-800/40',
                    blue: 'text-blue-400 bg-blue-950/50 border-blue-800/40',
                    violet: 'text-violet-400 bg-violet-950/50 border-violet-800/40',
                    orange: 'text-orange-400 bg-orange-950/50 border-orange-800/40',
                    red: 'text-red-400 bg-red-950/50 border-red-800/40',
                  };
                  return (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4">
                      {i > 0 && (
                        <div className="absolute -mt-8 ml-5 w-px h-6 bg-gradient-to-b from-blue-800/60 to-transparent" />
                      )}
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${sColor[step.color]}`}>
                        <StepIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 bg-[#060f23]/60 border border-blue-900/30 rounded-xl px-4 py-3">
                        <div className={`text-xs font-bold font-mono uppercase tracking-wider ${sColor[step.color].split(' ')[0]}`}>{step.label}</div>
                        <div className="text-gray-400 text-xs mt-0.5">{step.desc}</div>
                      </div>
                      {i < 4 && (
                        <div className="w-px h-4 bg-blue-800/40 absolute ml-5 mt-12" />
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* AI Confidence Score */}
              <div className="bg-[#060f23]/80 border border-blue-900/40 rounded-2xl p-5 flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl font-black text-cyan-400 font-mono">98.7%</div>
                  <div className="text-[10px] text-gray-500 font-mono uppercase">AI CONFIDENCE SCORE</div>
                  <div className="text-[9px] text-gray-600 font-mono mt-0.5">DEMO DATA</div>
                </div>
                <div className="flex-1 space-y-2">
                  {['Signal Quality', 'Correlation Depth', 'Pattern Match', 'Context Score'].map((m, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 font-mono w-28">{m}</span>
                      <div className="flex-1 h-1.5 bg-blue-950 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                          style={{ width: `${[98, 96, 99, 97][i]}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Brain Visual */}
            <div className="flex flex-col items-center gap-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative">
                <AIBrain />
                {/* Orbiting labels */}
                {[
                  { label: 'IP INTEL', angle: 0, r: 130 },
                  { label: 'DOMAIN', angle: 60, r: 130 },
                  { label: 'BEHAVIOUR', angle: 120, r: 130 },
                  { label: 'IOC', angle: 180, r: 130 },
                  { label: 'CAMPAIGN', angle: 240, r: 130 },
                  { label: 'ACTOR', angle: 300, r: 130 },
                ].map((item, i) => {
                  const rad = (item.angle * Math.PI) / 180;
                  const x = Math.cos(rad) * item.r;
                  const y = Math.sin(rad) * item.r;
                  return (
                    <div key={i} className="absolute text-[9px] font-mono font-bold text-cyan-400/70 bg-cyan-950/40 border border-cyan-800/30 rounded-full px-2 py-0.5 whitespace-nowrap"
                      style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: 'translate(-50%,-50%)' }}>
                      {item.label}
                    </div>
                  );
                })}
              </motion.div>

              {/* Feature points */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                {['Neural Correlation', 'Behaviour Graphs', 'Real-time Scoring', 'Explainable AI'].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#060f23]/60 border border-blue-900/30 rounded-xl px-3 py-2">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span className="text-[11px] text-gray-300 font-mono">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          4. LIVE THREAT MAP
      ═══════════════════════════════════════ */}
      <section className="py-24 border-t border-blue-950/40 bg-[#040919]/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 space-y-3">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest px-3 py-1 bg-blue-950/60 border border-blue-800/40 rounded-full">
                GLOBAL INTELLIGENCE
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-yellow-400 bg-yellow-950/50 border border-yellow-800/40 rounded-full px-2 py-1">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                DEMO DATA
              </span>
            </div>
            <h2 className="text-4xl font-extrabold text-white">GLOBAL THREAT INTELLIGENCE</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2">
              <div className="bg-[#060f23]/80 border border-blue-900/40 rounded-2xl overflow-hidden">
                {/* Filter tabs */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-blue-900/40">
                  {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map(f => (
                    <button key={f} onClick={() => setThreatFilter(f)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${threatFilter === f
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        : 'text-gray-500 hover:text-gray-300'}`}>
                      {f}
                    </button>
                  ))}
                  <div className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    LIVE
                  </div>
                </div>
                {/* Map */}
                <div className="relative h-64">
                  <WorldMapSVG />
                  {/* Legend */}
                  <div className="absolute bottom-3 left-3 flex gap-3">
                    {[['Attack Origin','#ef4444'],['Targeted Region','#06b6d4'],['Data Flow','#8b5cf6'],['HoneyBot','#22c55e']].map(([l,c]) => (
                      <div key={l} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ background: c }} />
                        <span className="text-[9px] text-gray-400 font-mono">{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Live feed */}
                <div className="border-t border-blue-900/40 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">LIVE THREAT FEED</span>
                    <span className="text-[10px] text-yellow-400 font-mono bg-yellow-950/40 border border-yellow-800/40 rounded px-2 py-0.5">⚠ DEMO DATA</span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filteredEvents.map((ev, i) => (
                      <motion.div key={ev.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 py-2 border-b border-blue-900/20 last:border-0">
                        <span className="text-[10px] text-gray-500 font-mono w-16 flex-shrink-0">{ev.time}</span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${sevColor(ev.severity)}`}>{ev.severity}</span>
                        <span className="text-xs text-gray-300 flex-1">{ev.type}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{ev.ip}</span>
                      </motion.div>
                    ))}
                  </div>
                  <button className="mt-3 text-[10px] text-cyan-400 font-mono hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer">
                    View All Intelligence Events <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Side Panel */}
            <div className="space-y-4">
              {/* Threat Actor Profile Quick View */}
              <div className="bg-[#060f23]/80 border border-blue-900/40 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">THREAT ACTOR PROFILE</span>
                  <span className="text-[9px] text-yellow-400 font-mono border border-yellow-800/40 rounded px-1.5 py-0.5">DEMO</span>
                </div>
                {(() => {
                  const actor = DEMO_THREAT_ACTORS[0];
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/40 flex items-center justify-center">
                          <Target className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm font-mono">{actor.name}</div>
                          <div className="text-[9px] text-gray-500 font-mono uppercase">{actor.status}</div>
                        </div>
                        <span className="ml-auto text-[9px] font-mono font-bold text-red-400 bg-red-950/40 border border-red-800/40 rounded px-1.5 py-0.5">{actor.risk}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                        {[
                          ['First Seen', actor.firstSeen],
                          ['Last Seen', actor.lastSeen],
                          ['Targeted Sectors', actor.sectors.join(', ')],
                          ['Attack Techniques', actor.techniques.join(', ')],
                          ['Infrastructure', `${actor.ips} IPs, ${actor.domains} Domains`],
                          ['Campaigns', `${actor.campaigns} Active`],
                        ].map(([k, v]) => (
                          <div key={k}>
                            <div className="text-gray-500 uppercase text-[9px] tracking-wider">{k}</div>
                            <div className="text-gray-200 mt-0.5">{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Risk Score Ring mini */}
                <div className="mt-4 flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-[10px] text-gray-500 font-mono uppercase mb-1">RISK SCORE</div>
                    <div className="text-3xl font-black text-red-400 font-mono">87</div>
                    <div className="text-[9px] text-gray-600 font-mono">/100</div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {['History','Capability','Intent','Opportunity','Infrastructure'].map((r, i) => (
                      <div key={r} className="flex items-center gap-2">
                        <span className="text-[9px] text-gray-500 font-mono w-20">{r}</span>
                        <div className="flex-1 h-1 bg-blue-950 rounded-full">
                          <div className="h-full bg-red-500/60 rounded-full" style={{ width: `${[85,90,78,82,88][i]}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="mt-4 w-full py-2 text-[10px] font-mono font-bold text-cyan-400 border border-cyan-800/40 rounded-xl hover:bg-cyan-950/30 transition-all cursor-pointer flex items-center justify-center gap-2">
                  View Full Profile <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Intelligence Status */}
              <div className="bg-[#060f23]/80 border border-blue-900/40 rounded-2xl p-4">
                <div className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider mb-3">INTELLIGENCE STATUS</div>
                {[
                  { label: 'AI Engine', status: 'ONLINE', color: 'emerald' },
                  { label: 'Data Feeds', status: 'ACTIVE', color: 'cyan' },
                  { label: 'Correlation', status: 'REAL-TIME', color: 'violet' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-blue-900/20 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full bg-${s.color}-400 animate-pulse`} />
                      <span className="text-[11px] text-gray-300 font-mono">{s.label}</span>
                    </div>
                    <span className={`text-[9px] font-mono font-bold text-${s.color}-400`}>{s.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          5. THREAT ACTOR INTELLIGENCE
      ═══════════════════════════════════════ */}
      <section className="py-24 border-t border-blue-950/40 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest px-3 py-1 bg-red-950/60 border border-red-800/40 rounded-full">
              THREAT ACTORS
            </span>
            <h2 className="text-4xl font-extrabold text-white">KNOW THE <span className="text-red-400">ADVERSARY</span></h2>
            <p className="text-gray-400">All actor data shown is for demonstration purposes only. Attribution is never confirmed without evidence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEMO_THREAT_ACTORS.map((actor, i) => (
              <motion.div key={actor.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedActor(i)}
                className={`relative bg-[#060f23]/80 border rounded-2xl p-6 cursor-pointer transition-all duration-300 group hover:scale-[1.02] ${
                  selectedActor === i
                    ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)]'
                    : 'border-blue-900/40 hover:border-red-800/40'
                }`}>
                <div className="absolute top-3 right-3 text-[9px] font-mono text-yellow-400 border border-yellow-800/40 rounded px-1.5 py-0.5">DEMO</div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-950/80 to-red-900/40 border border-red-800/40 flex items-center justify-center flex-shrink-0">
                    <div className="relative">
                      <Target className="w-7 h-7 text-red-400" />
                      <div className="absolute -inset-2 bg-red-500/10 rounded-full animate-pulse" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white text-lg font-mono">{actor.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono uppercase">{actor.status}</div>
                    <span className={`inline-block text-[9px] font-mono font-bold mt-1 px-2 py-0.5 rounded border ${
                      actor.risk === 'CRITICAL' ? 'text-red-400 border-red-800/60 bg-red-950/40' :
                      actor.risk === 'HIGH RISK' ? 'text-orange-400 border-orange-800/60 bg-orange-950/40' :
                      'text-yellow-400 border-yellow-800/60 bg-yellow-950/40'
                    }`}>{actor.risk}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[10px] font-mono mb-4">
                  {[
                    ['Sectors', actor.sectors.slice(0,2).join(', ')],
                    ['Techniques', actor.techniques.slice(0,2).join(', ')],
                    ['Infrastructure', `${actor.ips} IPs`],
                    ['Campaigns', `${actor.campaigns} Active`],
                    ['First Seen', actor.firstSeen],
                    ['Last Seen', actor.lastSeen],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div className="text-gray-600 uppercase text-[9px] tracking-wider">{k}</div>
                      <div className="text-gray-300 mt-0.5 truncate">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-blue-900/30 flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-mono">Unknown attribution</span>
                  <span className="text-[9px] text-red-400 font-mono font-bold group-hover:text-red-300 flex items-center gap-1">
                    Investigate <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          6. ATTACK INFRASTRUCTURE GRAPH
      ═══════════════════════════════════════ */}
      <section className="py-24 border-t border-blue-950/40 bg-[#040919]/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest px-3 py-1 bg-blue-950/60 border border-blue-800/40 rounded-full inline-block">
                ATTACK INFRASTRUCTURE
              </span>
              <h2 className="text-4xl font-extrabold text-white leading-tight">
                VISUALIZE THE<br /><span className="text-blue-400">ATTACK GRAPH</span>
              </h2>
              <p className="text-gray-400 text-base leading-relaxed">
                Connect threat actors to their infrastructure — IPs, domains, servers, campaigns and targets — through an interactive relationship graph.
              </p>
              {/* Node type legend */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { type: 'Threat Actor', color: '#ef4444', icon: Target },
                  { type: 'IP Address', color: '#06b6d4', icon: Server },
                  { type: 'Domain', color: '#8b5cf6', icon: Globe },
                  { type: 'C2 Server', color: '#f97316', icon: Radio },
                  { type: 'Campaign', color: '#eab308', icon: Layers },
                  { type: 'Target', color: '#22c55e', icon: Shield },
                ].map((n, i) => {
                  const NIcon = n.icon;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${n.color}20`, border: `1px solid ${n.color}40` }}>
                        <NIcon className="w-3 h-3" style={{ color: n.color }} />
                      </div>
                      <span className="text-[11px] text-gray-400 font-mono">{n.type}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setGraphZoom(z => Math.min(z + 0.2, 2))}
                  className="px-3 py-2 bg-blue-950/60 border border-blue-800/40 rounded-lg text-blue-400 text-xs font-mono cursor-pointer hover:bg-blue-900/60 flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Zoom In
                </button>
                <button onClick={() => setGraphZoom(z => Math.max(z - 0.2, 0.5))}
                  className="px-3 py-2 bg-blue-950/60 border border-blue-800/40 rounded-lg text-blue-400 text-xs font-mono cursor-pointer hover:bg-blue-900/60 flex items-center gap-1">
                  <Minus className="w-3 h-3" /> Zoom Out
                </button>
                <button onClick={() => { setGraphZoom(1); setSelectedNode(null); }}
                  className="px-3 py-2 bg-blue-950/60 border border-blue-800/40 rounded-lg text-blue-400 text-xs font-mono cursor-pointer hover:bg-blue-900/60 flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>
            </div>

            {/* Graph Canvas */}
            <div className="bg-[#060f23]/80 border border-blue-900/40 rounded-2xl overflow-hidden h-96 relative">
              <div className="absolute top-3 right-3 text-[9px] text-yellow-400 font-mono border border-yellow-800/40 rounded px-1.5 py-0.5 z-10">DEMO DATA</div>
              <svg viewBox="0 0 520 370" className="w-full h-full" style={{ transform: `scale(${graphZoom})`, transition: 'transform 0.3s' }}>
                {/* Edges */}
                {graphEdges.map(([from, to], i) => {
                  const a = graphNodes.find(n => n.id === from)!;
                  const b = graphNodes.find(n => n.id === to)!;
                  return (
                    <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                      stroke="#1e40af" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="4 3">
                      <animate attributeName="stroke-dashoffset" from="0" to="-14" dur={`${2+i*0.3}s`} repeatCount="indefinite" />
                    </line>
                  );
                })}
                {/* Nodes */}
                {graphNodes.map((node, i) => (
                  <g key={node.id} onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)} style={{ cursor: 'pointer' }}>
                    <circle cx={node.x} cy={node.y} r="22" fill={node.color} fillOpacity="0.12"
                      stroke={selectedNode === node.id ? node.color : '#1e3a8a'} strokeWidth={selectedNode === node.id ? 2 : 1}>
                      {selectedNode === node.id && (
                        <animate attributeName="r" values="20;26;20" dur="1.5s" repeatCount="indefinite" />
                      )}
                    </circle>
                    <circle cx={node.x} cy={node.y} r="10" fill={node.color} fillOpacity="0.8" />
                    <text x={node.x} y={node.y + 36} textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                      {node.label.length > 14 ? node.label.slice(0, 12) + '..' : node.label}
                    </text>
                  </g>
                ))}
              </svg>
              {selectedNode && (
                <div className="absolute bottom-3 left-3 right-3 bg-[#030712]/95 border border-blue-800/60 rounded-xl p-3 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-gray-500 font-mono uppercase">SELECTED NODE</div>
                      <div className="text-xs text-white font-mono font-bold">{graphNodes.find(n => n.id === selectedNode)?.label}</div>
                      <div className="text-[9px] text-cyan-400 font-mono capitalize">{graphNodes.find(n => n.id === selectedNode)?.type}</div>
                    </div>
                    <button onClick={() => setSelectedNode(null)} className="text-gray-500 hover:text-white cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          7. IOC INTELLIGENCE + THREAT SCORE
      ═══════════════════════════════════════ */}
      <section className="py-24 border-t border-blue-950/40 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* IOC Search (3 cols) */}
            <div className="lg:col-span-3 space-y-6">
              <div>
                <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-widest px-3 py-1 bg-orange-950/60 border border-orange-800/40 rounded-full inline-block mb-4">
                  IOC INTELLIGENCE
                </span>
                <h2 className="text-4xl font-extrabold text-white leading-tight">
                  INDICATORS OF<br /><span className="text-orange-400">COMPROMISE</span>
                </h2>
              </div>

              {/* Search bar */}
              <div className="bg-[#060f23]/80 border border-blue-900/40 rounded-2xl p-5 space-y-4">
                <div className="flex gap-2">
                  {(['IP', 'Domain', 'URL', 'Hash'] as const).map(t => (
                    <button key={t} onClick={() => setIocType(t)}
                      className={`px-3 py-1.5 text-[11px] font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                        iocType === t
                          ? 'bg-orange-950/60 text-orange-400 border-orange-800/50'
                          : 'bg-blue-950/30 text-gray-500 border-blue-900/30 hover:text-gray-300'
                      }`}>{t}</button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={iocQuery}
                      onChange={e => setIocQuery(e.target.value)}
                      placeholder={`Enter ${iocType} address...`}
                      className="w-full bg-[#030712] border border-blue-900/40 rounded-xl pl-10 pr-4 py-3 text-sm font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all"
                    />
                  </div>
                  <button className="px-5 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-mono font-bold rounded-xl hover:brightness-110 transition-all cursor-pointer">
                    Investigate
                  </button>
                </div>

                {/* Sample results */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">RECENT SEARCHES</span>
                    <span className="text-[9px] text-yellow-400 font-mono border border-yellow-800/40 rounded px-1.5 py-0.5">DEMO DATA</span>
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-6 text-[9px] text-gray-600 font-mono uppercase tracking-wider px-2 pb-1 border-b border-blue-900/20">
                      {['INDICATOR','TYPE','RISK','FIRST SEEN','LAST SEEN','ACTION'].map(h => (
                        <span key={h} className="truncate">{h}</span>
                      ))}
                    </div>
                    {IOC_SAMPLES.map((ioc, i) => (
                      <div key={i} className="grid grid-cols-6 items-center py-2 px-2 rounded-xl hover:bg-blue-950/20 transition-all cursor-pointer text-[10px] font-mono border-b border-blue-900/10 last:border-0">
                        <span className="text-gray-200 truncate col-span-1">{ioc.indicator.length > 16 ? ioc.indicator.slice(0,14)+'..' : ioc.indicator}</span>
                        <span className="text-blue-400">{ioc.type}</span>
                        <span className={ioc.risk >= 80 ? 'text-red-400 font-bold' : ioc.risk >= 60 ? 'text-orange-400 font-bold' : 'text-yellow-400 font-bold'}>{ioc.risk}</span>
                        <span className="text-gray-500">{ioc.firstSeen}</span>
                        <span className="text-gray-500">{ioc.lastSeen}</span>
                        <button className="text-cyan-400 hover:text-cyan-300 transition-colors text-left">Investigate →</button>
                      </div>
                    ))}
                  </div>
                  <button className="mt-3 text-[10px] text-cyan-400 font-mono hover:text-cyan-300 flex items-center gap-1 cursor-pointer">
                    View All Intelligence <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Threat Score (2 cols) */}
            <div className="lg:col-span-2 space-y-5">
              <div>
                <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest px-3 py-1 bg-red-950/60 border border-red-800/40 rounded-full inline-block mb-4">
                  RISK SCORE
                </span>
                <h2 className="text-3xl font-extrabold text-white leading-tight">THREAT<br />RISK SCORE</h2>
              </div>

              <div className="bg-[#060f23]/80 border border-blue-900/40 rounded-2xl p-6 flex flex-col items-center space-y-5">
                <div className="text-[9px] text-yellow-400 font-mono border border-yellow-800/40 rounded px-2 py-0.5 self-end">DEMO DATA — Not real-time</div>
                <ThreatScoreRing score={87} />

                <div className="w-full space-y-2.5">
                  {riskBreakdown.map((item, i) => (
                    <div key={i}
                      onClick={() => setSelectedRiskBreakdown(i)}
                      className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-all ${selectedRiskBreakdown === i ? 'bg-red-950/30' : 'hover:bg-blue-950/20'}`}>
                      <span className="text-[10px] text-gray-400 font-mono w-24">{item.label}</span>
                      <div className="flex-1 h-1.5 bg-blue-950 rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.value}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1, duration: 0.8 }} />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-red-400 w-6">{item.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-gray-600 font-mono text-center">
                  Scores use dynamic AI calculation in production. Demo values are illustrative only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          8. THREAT TIMELINE
      ═══════════════════════════════════════ */}
      <section className="py-24 border-t border-blue-950/40 bg-[#040919]/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest px-3 py-1 bg-blue-950/60 border border-blue-800/40 rounded-full">
              THREAT TIMELINE
            </span>
            <h2 className="text-4xl font-extrabold text-white">TRACE THE <span className="text-cyan-400">ATTACK PATH</span></h2>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Horizontal line */}
            <div className="absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-800/60 to-transparent" />

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {timelineStages.map((stage, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setActiveTimeline(i)}
                  className={`relative cursor-pointer group`}>
                  {/* Node */}
                  <div className={`w-16 h-16 mx-auto rounded-2xl border flex items-center justify-center mb-4 transition-all duration-300 ${
                    activeTimeline === i
                      ? 'bg-cyan-500/20 border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : 'bg-[#060f23]/80 border-blue-900/40 group-hover:border-blue-700/60'
                  }`}>
                    <span className={`text-lg font-black font-mono ${activeTimeline === i ? 'text-cyan-400' : 'text-gray-500'}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="text-center space-y-1">
                    <div className={`text-[10px] font-mono font-bold uppercase tracking-wider transition-colors ${activeTimeline === i ? 'text-cyan-400' : 'text-gray-400 group-hover:text-gray-300'}`}>
                      {stage.label}
                    </div>
                    <div className="text-[9px] text-gray-600 font-mono">{stage.date}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Detail panel */}
            <AnimatePresence mode="wait">
              <motion.div key={activeTimeline}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-8 bg-[#060f23]/80 border border-cyan-900/40 rounded-2xl p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-bold text-white font-mono">{timelineStages[activeTimeline].label}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{timelineStages[activeTimeline].date}</span>
                    <span className="text-[9px] text-yellow-400 font-mono border border-yellow-800/40 rounded px-1.5">DEMO</span>
                  </div>
                  <p className="text-gray-400 text-sm">{timelineStages[activeTimeline].desc}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          9. AI THREAT ANALYST
      ═══════════════════════════════════════ */}
      <section className="py-24 border-t border-blue-950/40 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest px-3 py-1 bg-violet-950/60 border border-violet-800/40 rounded-full inline-block">
                AI ANALYST
              </span>
              <h2 className="text-4xl font-extrabold text-white leading-tight">
                ASK YOUR<br /><span className="text-violet-400">INTELLIGENCE</span>
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Powered by explainable AI. The analyst never claims certainty without evidence and clearly indicates when data is limited or unverified.
              </p>
              <div className="space-y-3">
                <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">Example queries:</p>
                {[
                  '"Investigate this IP."',
                  '"Show related attacks."',
                  '"Why is this domain suspicious?"',
                  '"Find related indicators."',
                  '"Summarize this threat."',
                ].map((q, i) => (
                  <button key={i} onClick={() => setChatInput(q.replace(/"/g, ''))}
                    className="block w-full text-left px-4 py-2.5 bg-violet-950/30 border border-violet-800/30 rounded-xl text-sm text-violet-300 font-mono hover:bg-violet-950/50 hover:border-violet-700/50 transition-all cursor-pointer">
                    {q}
                  </button>
                ))}
              </div>
              <div className="bg-[#060f23]/80 border border-violet-900/40 rounded-2xl p-4">
                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-2">AI RESPONSE INCLUDES:</div>
                {['Summary', 'Evidence', 'Risk Assessment', 'Related Intelligence', 'Recommended Defensive Steps'].map((r, i) => (
                  <div key={i} className="flex items-center gap-2 py-1">
                    <CheckCircle className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                    <span className="text-xs text-gray-300 font-mono">{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Interface */}
            <div className="bg-[#060f23]/80 border border-violet-900/40 rounded-2xl overflow-hidden flex flex-col h-[500px]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-violet-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-violet-950/80 border border-violet-800/50 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white font-mono">XSZO Intelligence Analyst</div>
                    <div className="text-[9px] text-violet-400 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
                      AI Mode · Demo Only
                    </div>
                  </div>
                </div>
                <span className="text-[9px] text-yellow-400 font-mono border border-yellow-800/40 rounded px-2 py-0.5">NO LIVE DATA</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs font-mono whitespace-pre-wrap leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-violet-600/30 border border-violet-700/40 text-violet-100'
                        : 'bg-[#030712] border border-blue-900/40 text-gray-300'
                    }`}>
                      {msg.role === 'ai' && (
                        <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-blue-900/30">
                          <Brain className="w-3 h-3 text-violet-400" />
                          <span className="text-[9px] text-violet-400 font-bold uppercase">XSZO AI</span>
                        </div>
                      )}
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleChat} className="p-4 border-t border-violet-900/40 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask your intelligence analyst..."
                  className="flex-1 bg-[#030712] border border-blue-900/40 rounded-xl px-4 py-2.5 text-xs font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-all"
                />
                <button type="submit"
                  className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-600 rounded-xl flex items-center justify-center hover:brightness-110 transition-all cursor-pointer flex-shrink-0">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          10. ATTACK PATTERN ANALYSIS
      ═══════════════════════════════════════ */}
      <section className="py-24 border-t border-blue-950/40 bg-[#040919]/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest px-3 py-1 bg-blue-950/60 border border-blue-800/40 rounded-full">
              ATTACK PATTERNS
            </span>
            <h2 className="text-4xl font-extrabold text-white">UNDERSTAND THE <span className="text-cyan-400">ATTACK</span></h2>
            <p className="text-gray-400">Mapped to ATT&CK defensive concepts. Select a stage to explore observed behaviours.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {ATTACK_PATTERNS.map((p, i) => {
              const PIcon = p.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setSelectedPattern(selectedPattern === i ? null : i)}
                  className={`relative rounded-2xl p-4 cursor-pointer transition-all duration-300 border group ${
                    selectedPattern === i
                      ? 'bg-cyan-950/30 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                      : 'bg-[#060f23]/80 border-blue-900/40 hover:border-blue-700/60'
                  }`}>
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 transition-all ${
                    selectedPattern === i ? 'bg-cyan-950/60 border-cyan-800/50' : 'bg-blue-950/40 border-blue-900/30'
                  }`}>
                    <PIcon className={`w-4 h-4 ${selectedPattern === i ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-400'}`} />
                  </div>
                  <div className={`text-[9px] font-mono font-bold mb-1 ${selectedPattern === i ? 'text-cyan-400' : 'text-gray-600'}`}>{p.stage}</div>
                  <div className={`text-xs font-mono font-bold ${selectedPattern === i ? 'text-white' : 'text-gray-300'}`}>{p.label}</div>
                </motion.div>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {selectedPattern !== null && (
              <motion.div
                key={selectedPattern}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-[#060f23]/80 border border-cyan-900/40 rounded-2xl p-6 flex items-start gap-4">
                {(() => {
                  const p = ATTACK_PATTERNS[selectedPattern];
                  const PIcon = p.icon;
                  return (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center flex-shrink-0">
                        <PIcon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-bold text-white font-mono">{p.label}</span>
                          <span className="text-[10px] text-cyan-400 font-mono font-bold">STAGE {p.stage}</span>
                          <span className="text-[9px] text-yellow-400 font-mono border border-yellow-800/40 rounded px-1.5">DEMO ONLY</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{p.desc}</p>
                        <div className="flex gap-3">
                          <button className="px-3 py-1.5 bg-cyan-950/40 border border-cyan-800/40 rounded-lg text-[10px] font-mono text-cyan-400 cursor-pointer hover:bg-cyan-950/60 flex items-center gap-1">
                            <Eye className="w-3 h-3" /> View Evidence
                          </button>
                          <button className="px-3 py-1.5 bg-blue-950/40 border border-blue-800/40 rounded-lg text-[10px] font-mono text-blue-400 cursor-pointer hover:bg-blue-950/60 flex items-center gap-1">
                            <Network className="w-3 h-3" /> Related Events
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          11. INTELLIGENCE FEEDS
      ═══════════════════════════════════════ */}
      <section className="py-24 border-t border-blue-950/40 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest px-3 py-1 bg-emerald-950/60 border border-emerald-800/40 rounded-full">
              DATA SOURCES
            </span>
            <h2 className="text-4xl font-extrabold text-white">INTELLIGENCE <span className="text-emerald-400">SOURCES</span></h2>
            <p className="text-gray-400 max-w-xl mx-auto">External intelligence feeds require configuration. Only connected feeds are used. Feed status shown is for demonstration only.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {INTEL_FEEDS.map((feed, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-[#060f23]/80 border border-blue-900/40 rounded-2xl p-5 hover:border-emerald-900/50 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm font-bold text-white font-mono">{feed.name}</div>
                    <div className="text-[9px] text-yellow-400 font-mono mt-1">DEMO STATUS ONLY</div>
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                    feed.status === 'ACTIVE' ? `text-emerald-400 bg-emerald-950/40 border-emerald-800/40` :
                    'text-orange-400 bg-orange-950/40 border-orange-800/40'
                  }`}>{feed.status}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-black font-mono text-white">{feed.signals}</div>
                    <div className="text-[9px] text-gray-500 font-mono uppercase">Signals</div>
                  </div>
                  {feed.reliability > 0 && (
                    <div className="text-right">
                      <div className="text-lg font-black font-mono text-emerald-400">{feed.reliability}%</div>
                      <div className="text-[9px] text-gray-500 font-mono uppercase">Reliability</div>
                    </div>
                  )}
                </div>
                {feed.reliability > 0 && (
                  <div className="mt-3 h-1 bg-blue-950 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" style={{ width: `${feed.reliability}%` }} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          12. DARK WEB / EXTERNAL SIGNALS
      ═══════════════════════════════════════ */}
      <section className="py-24 border-t border-blue-950/40 bg-[#040919]/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest px-3 py-1 bg-gray-900/60 border border-gray-700/40 rounded-full inline-block">
                EXTERNAL SIGNALS
              </span>
              <h2 className="text-4xl font-extrabold text-white leading-tight">
                EXTERNAL THREAT<br /><span className="text-gray-300">SIGNALS</span>
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Monitor external threat signals including potential data exposure, credential mentions and brand abuse — without accessing illegal content.
              </p>
              <div className="bg-yellow-950/20 border border-yellow-800/30 rounded-xl p-4 text-xs text-yellow-300 font-mono">
                ⚠ Demo categories only. Real monitoring requires a configured external threat intelligence integration. XSZO does not access illegal marketplace content.
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {DARK_WEB_CATEGORIES.map((cat, i) => {
                const CIcon = cat.icon;
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-4 bg-[#060f23]/80 border border-gray-800/40 rounded-xl px-5 py-4 hover:border-gray-700/60 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-gray-900/60 border border-gray-700/40 flex items-center justify-center flex-shrink-0 group-hover:border-gray-600/60 transition-all">
                      <CIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-gray-200 font-mono">{cat.label}</div>
                      <div className="text-[9px] text-gray-600 font-mono">{cat.note}</div>
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-500">{cat.count}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          13. INTELLIGENCE REPORTS
      ═══════════════════════════════════════ */}
      <section className="py-24 border-t border-blue-950/40 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest px-3 py-1 bg-blue-950/60 border border-blue-800/40 rounded-full">
              INTELLIGENCE REPORTS
            </span>
            <h2 className="text-4xl font-extrabold text-white">FROM DATA TO <span className="text-blue-400">DECISION</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Threat Brief', icon: FileText, desc: 'Executive-level threat summary for a specific indicator or event.', color: 'cyan' },
              { title: 'IOC Report', icon: Fingerprint, desc: 'Full indicator report with evidence, related events and risk score.', color: 'orange' },
              { title: 'Threat Actor Report', icon: Target, desc: 'Comprehensive actor profile including TTPs and infrastructure.', color: 'red' },
              { title: 'Campaign Report', icon: Layers, desc: 'End-to-end analysis of a coordinated attack campaign.', color: 'violet' },
              { title: 'Executive Intelligence', icon: BarChart2, desc: 'Non-technical intelligence summary for leadership teams.', color: 'blue' },
              { title: 'IOC Export', icon: Download, desc: 'Export indicators in STIX, CSV or JSON for SIEM integration.', color: 'emerald' },
            ].map((rep, i) => {
              const RIcon = rep.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-[#060f23]/80 border border-blue-900/40 rounded-2xl p-6 hover:border-blue-700/60 transition-all group cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl bg-${rep.color}-950/40 border border-${rep.color}-800/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <RIcon className={`w-5 h-5 text-${rep.color}-400`} />
                  </div>
                  <h3 className="font-bold text-white font-mono mb-2">{rep.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{rep.desc}</p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-cyan-950/40 border border-cyan-800/30 rounded-lg text-[10px] font-mono text-cyan-400 cursor-pointer hover:bg-cyan-950/60 transition-all">
                      Generate
                    </button>
                    <button className="px-3 py-1.5 bg-blue-950/40 border border-blue-800/30 rounded-lg text-[10px] font-mono text-blue-400 cursor-pointer hover:bg-blue-950/60 transition-all">
                      Export
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          14. INTELLIGENCE WORKFLOW
      ═══════════════════════════════════════ */}
      <section className="py-24 border-t border-blue-950/40 bg-[#040919]/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-3">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest px-3 py-1 bg-blue-950/60 border border-blue-800/40 rounded-full">
              WORKFLOW
            </span>
            <h2 className="text-4xl font-extrabold text-white">FROM SIGNAL TO <span className="text-cyan-400">INTELLIGENCE</span></h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {INTEL_WORKFLOW.map((w, i) => {
              const WIcon = w.icon;
              return (
                <div key={i} className="relative flex flex-col items-center text-center group">
                  {i < INTEL_WORKFLOW.length - 1 && (
                    <div className="absolute top-8 left-1/2 w-full h-px bg-gradient-to-r from-cyan-800/40 to-blue-800/20 hidden lg:block" style={{ left: '50%' }} />
                  )}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-950/80 to-blue-950/60 border border-cyan-800/30 flex items-center justify-center mb-4 group-hover:border-cyan-600/50 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all relative z-10">
                    <WIcon className="w-6 h-6 text-cyan-400" />
                  </motion.div>
                  <div className="text-[10px] font-mono font-bold text-cyan-400 mb-1">{w.step}</div>
                  <div className="text-sm font-bold text-white font-mono mb-1">{w.label}</div>
                  <div className="text-[10px] text-gray-500 leading-relaxed">{w.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          15. WHY XSZO INTELLIGENCE
      ═══════════════════════════════════════ */}
      <section className="py-24 border-t border-blue-950/40 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-4xl font-extrabold text-white">WHY <span className="text-cyan-400">XSZO INTELLIGENCE</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'CONTEXT', icon: Layers, desc: 'Understand more than a single alert. Intelligence enriches every event with full situational context.', color: 'cyan' },
              { label: 'CORRELATION', icon: Network, desc: 'Connect related security signals across time, infrastructure and behaviour patterns.', color: 'blue' },
              { label: 'INTELLIGENCE', icon: Brain, desc: 'Turn raw telemetry into meaningful, actionable intelligence that security teams can use.', color: 'violet' },
              { label: 'DECISION', icon: Zap, desc: 'Help security teams prioritize what truly matters with scored, ranked intelligence outputs.', color: 'emerald' },
            ].map((item, i) => {
              const ItemIcon = item.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`bg-gradient-to-br from-${item.color}-950/30 to-${item.color}-950/10 border border-${item.color}-900/40 rounded-2xl p-6 hover:border-${item.color}-700/50 transition-all group`}>
                  <div className={`w-12 h-12 rounded-xl bg-${item.color}-950/60 border border-${item.color}-800/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <ItemIcon className={`w-5 h-5 text-${item.color}-400`} />
                  </div>
                  <h3 className={`font-black text-lg font-mono mb-2 text-${item.color}-400`}>{item.label}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          16. FINAL CTA
      ═══════════════════════════════════════ */}
      <section className="py-32 border-t border-blue-950/40 relative z-10 overflow-hidden bg-gradient-to-b from-[#030712] via-[#060f23]/60 to-[#030712] text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-[80px]" />
          {/* Rotating rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-cyan-500/5 animate-[spin_40s_linear_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-dashed border-blue-500/8 animate-[spin_30s_linear_infinite_reverse]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-8">
            {/* XSZO Shield */}
            <div className="flex justify-center">
              <div className="relative">
                <FalconShieldLogo className="w-24 h-24 drop-shadow-[0_0_40px_rgba(6,182,212,0.5)]" />
                <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full animate-pulse" />
              </div>
            </div>

            <h2 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
              TURN THREAT SIGNALS<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400">
                INTO INTELLIGENCE.
              </span>
            </h2>

            <p className="text-gray-300 text-lg max-w-2xl mx-auto font-light">
              "Discover the intelligence layer behind XSZO AI Defence."
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button onClick={onNavigateHome}
                className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black font-mono text-sm font-bold rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all cursor-pointer flex items-center gap-2">
                Explore XSZO <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={onNavigateDemo || onNavigateLogin}
                className="px-8 py-4 bg-blue-950/80 hover:bg-blue-900 border border-cyan-500/50 text-cyan-300 font-mono text-sm font-semibold rounded-xl backdrop-blur-md transition-all cursor-pointer">
                Book a Demo
              </button>
            </div>

            {/* Brand statement */}
            <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {['SEE MORE.', 'UNDERSTAND FASTER.', 'DEFEND SMARTER.'].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-lg font-black font-mono bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">{s}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════ */}
      <footer className="bg-[#02040b] border-t border-blue-950/80 py-16 text-gray-400 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <FalconShieldLogo className="w-7 h-7" />
              <span className="font-extrabold text-white text-base tracking-wider font-mono">XSZO AI DEFENCE</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed font-sans">
              "AI-powered cyber defence for a safer digital world."
            </p>
            <div className="flex gap-3">
              {[Github, Youtube, Linkedin, Instagram].map((SIcon, i) => (
                <button key={i} className="w-8 h-8 rounded-lg bg-gray-900/60 border border-gray-800/60 flex items-center justify-center hover:border-cyan-700/50 hover:text-cyan-400 transition-all cursor-pointer">
                  <SIcon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>

          {[
            { heading: 'PLATFORM', links: ['AI Security', 'Intelligence', 'Defence', 'Research'] },
            { heading: 'COMPANY', links: ['About XSZO', 'Team', 'Careers'] },
            { heading: 'RESOURCES', links: ['Documentation', 'Blog', 'Security', 'Support'] },
          ].map(col => (
            <div key={col.heading} className="space-y-3">
              <div className="text-white text-[10px] font-bold tracking-widest uppercase">{col.heading}</div>
              {col.links.map(l => (
                <button key={l} onClick={onNavigateHome}
                  className="block text-gray-400 hover:text-cyan-400 transition-colors cursor-pointer text-xs">{l}</button>
              ))}
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-blue-950/60 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-600">
          <span>© 2025 XSZO AI Defence. All rights reserved.</span>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Security'].map(l => (
              <button key={l} className="hover:text-gray-400 transition-colors cursor-pointer">{l}</button>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
