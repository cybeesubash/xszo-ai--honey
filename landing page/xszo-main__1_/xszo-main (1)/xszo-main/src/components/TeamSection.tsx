import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { gsap } from 'gsap';
import { 
  Shield, Cpu, Network, Github, Linkedin, Globe, 
  ExternalLink, Terminal, Sparkles, Youtube, Instagram,
  Zap, ArrowRight, Code, Key, Radio, Share2, Layers,
  Database, Server, Monitor, Activity, Compass, Info,
  ChevronRight, Calendar, BookOpen, AlertCircle, ArrowUpRight
} from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  subtitle: string;
  avatarIcon: React.ReactNode;
  profile: string;
  expertise: string[];
  links: {
    label: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

export default function TeamSection() {
  // Navigation & Interactive States
  const [activeTab, setActiveTab] = useState<'all' | 'god_of_cyber' | 'sathiyaseelan'>('all');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [activeConstellation, setActiveConstellation] = useState<string>('AI / ML');
  const [btsScene, setBtsScene] = useState<string>('workstation');
  const [matrixHover, setMatrixHover] = useState<{ member: string; category: string } | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  
  // Custom interactive mouse-tilt state for premium cards
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTiltCard, setActiveTiltCard] = useState<string | null>(null);

  // Refs for GSAP 3D Holographic Connection Lines and Shield Glow
  const leftLineRef = useRef<SVGPathElement>(null);
  const rightLineRef = useRef<SVGPathElement>(null);
  const leftPulseRef = useRef<SVGPathElement>(null);
  const rightPulseRef = useRef<SVGPathElement>(null);
  const shieldGlowRef = useRef<HTMLDivElement>(null);
  const ring1Ref = useRef<HTMLDivElement>(null);
  const ring2Ref = useRef<HTMLDivElement>(null);

  // GSAP animations for interactive network connections and breathing glow
  useEffect(() => {
    // 1. Dash offset flow along curves representing cyber link streams
    if (leftLineRef.current) {
      gsap.to(leftLineRef.current, {
        strokeDashoffset: -40,
        repeat: -1,
        ease: "none",
        duration: 2
      });
    }
    if (rightLineRef.current) {
      gsap.to(rightLineRef.current, {
        strokeDashoffset: 40,
        repeat: -1,
        ease: "none",
        duration: 2
      });
    }

    // 2. High-speed cyber data pulses traversing the link curves
    if (leftPulseRef.current) {
      gsap.fromTo(leftPulseRef.current,
        { strokeDashoffset: 165 },
        {
          strokeDashoffset: 0,
          repeat: -1,
          ease: "none",
          duration: 3
        }
      );
    }
    if (rightPulseRef.current) {
      gsap.fromTo(rightPulseRef.current,
        { strokeDashoffset: -165 },
        {
          strokeDashoffset: 0,
          repeat: -1,
          ease: "none",
          duration: 3
        }
      );
    }

    // 3. Subtle pulsing scale & blur aura on the central shield
    if (shieldGlowRef.current) {
      gsap.to(shieldGlowRef.current, {
        scale: 1.3,
        opacity: 0.85,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }

    // 4. GSAP rotation of background concentric cyber rings
    if (ring1Ref.current) {
      gsap.to(ring1Ref.current, {
        rotate: 360,
        duration: 30,
        repeat: -1,
        ease: "none"
      });
    }
    if (ring2Ref.current) {
      gsap.to(ring2Ref.current, {
        rotate: -360,
        duration: 20,
        repeat: -1,
        ease: "none"
      });
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
    setActiveTiltCard(cardId);
  };

  const handleMouseLeave = () => {
    setActiveTiltCard(null);
  };

  // Behind the scenes console streams
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  useEffect(() => {
    const logsMap: Record<string, string[]> = {
      workstation: [
        "[SYS] Local compile successful. Target: ESP32 Honeypot core.",
        "[INFO] Local webserver binding to interface 0.0.0.0:3000",
        "[OK] Hot module reload system listening...",
        "[COMPILER] Clean optimization. Bundle size: 142KB"
      ],
      soc: [
        "[ALERT] Detected incoming reconnaissance ping from 198.51.100.42",
        "[IDS] Correlating source IP threat vector with MITRE ATT&CK database.",
        "[SHIELD] Active telemetry redirection triggered successfully.",
        "[SOC] Honeypot node 'ESP32_DEV_01' reporting normal status."
      ],
      ai: [
        "[MODEL] Loading localized LLM fine-tune guardrail model.",
        "[GUARD] Vector embedding distance evaluated: 0.12 (Highly Secure)",
        "[AI] Threat categorization confidence: 99.4% [Exploit Attempt]",
        "[AGENT] Autonomous routing script initiated."
      ],
      threat: [
        "[GEO] Mapping threat coordinates: LAT 13.0827 / LON 80.2707",
        "[VECTOR] Redirection packet path visualizer initialized.",
        "[IDS] Active decoy tunnels online: 5.",
        "[SYSTEM] Live global matrix mapping synced."
      ]
    };

    setConsoleLogs(logsMap[btsScene] || []);
    const interval = setInterval(() => {
      setConsoleLogs(prev => {
        const base = logsMap[btsScene] || [];
        const randomItem = base[Math.floor(Math.random() * base.length)];
        return [...prev.slice(1), `[${new Date().toLocaleTimeString()}] ${randomItem.replace(/\[.*?\]\s*/, '')}`];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [btsScene]);

  // Matrix contribution config
  const matrixCategories = ['CYBER', 'AI', 'DEV', 'RESEARCH'];
  const matrixData = [
    {
      name: 'M.SUBASH KUMAR',
      data: {
        CYBER: { status: 'core', desc: 'Threat detection, LLM exploit defense, ESP32 secure firmware setup.' },
        AI: { status: 'core', desc: 'Machine Learning classifier training & system threat categorization models.' },
        DEV: { status: 'core', desc: 'Secure Python services, hardware communication APIs.' },
        RESEARCH: { status: 'core', desc: 'Active security research, zero-day threat emulation modeling.' }
      }
    },
    {
      name: 'SATHIYASEELAN.S',
      data: {
        CYBER: { status: 'support', desc: 'Integrating secure token transport and auth checks across layers.' },
        AI: { status: 'support', desc: 'Front-end AI response telemetry dashboards and interactive modules.' },
        DEV: { status: 'core', desc: 'Crafting premium React interfaces, high-fidelity widgets, full stack APIs.' },
        RESEARCH: { status: 'support', desc: 'Reviewing interface vulnerabilities and UI accessibility guidelines.' }
      }
    }
  ];

  return (
    <div className="bg-[#030712] text-white font-sans min-h-screen relative overflow-hidden selection:bg-cyan-500 selection:text-black pb-20" id="premium-team-page-root">
      
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.45)_50%),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:100%_4px,40px_40px] pointer-events-none -z-10 opacity-70"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1000px] pointer-events-none -z-10 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.08)_0%,transparent_60%)]"></div>

      {/* ==================================================
          1. HERO — THE XSZO TEAM
          ================================================== */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 px-4 sm:px-6 max-w-7xl mx-auto text-center" id="team-hero-view">
        
        {/* Cinematic Header */}
        <div className="space-y-4 max-w-3xl mx-auto z-10" id="hero-title-container">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-800/35 text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-black shadow-[0_0_15px_rgba(6,182,212,0.1)]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>XSZO AI DEFENCE CORE DIRECTIVE</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none uppercase"
          >
            THE PEOPLE BEHIND <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 drop-shadow-[0_0_20px_rgba(6,182,212,0.35)]">XSZO AI DEFENCE</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 font-medium tracking-wide max-w-2xl mx-auto leading-relaxed"
          >
            Building the future of cyber defence. Meet the builders, researchers and engineers turning security ideas into intelligent defence systems.
          </motion.p>
        </div>

        {/* 3D Core Hologram Map */}
        <div className="relative w-full max-w-5xl h-[450px] mt-12 flex items-center justify-center" id="cinematic-3d-pedestal">
          
          {/* Circular Cyber Rings Background */}
          <div ref={ring1Ref} className="absolute w-80 h-80 rounded-full border border-dashed border-cyan-500/15 pointer-events-none"></div>
          <div ref={ring2Ref} className="absolute w-96 h-96 rounded-full border border-cyan-500/10 pointer-events-none"></div>
          
          {/* Pulsing Backlight Glow */}
          <div ref={shieldGlowRef} className="absolute w-44 h-44 rounded-full bg-cyan-500/15 filter blur-2xl pointer-events-none opacity-80 z-0"></div>

          {/* Futuristic Animated Connection Lines Overlaid Across Core Map */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 hidden md:block overflow-visible" viewBox="0 0 1000 450">
            <defs>
              <linearGradient id="cyan-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="purple-gradient" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#c084fc" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            
            {/* Connection Line left: M.SUBASH KUMAR to Central Shield */}
            <path 
              ref={leftLineRef}
              d="M 220,160 C 320,160 360,225 440,225" 
              fill="none" 
              stroke="url(#cyan-gradient)" 
              strokeWidth="2" 
              strokeDasharray="6 6"
              className="opacity-70"
            />
            {/* Data Packet Pulse left */}
            <path 
              ref={leftPulseRef}
              d="M 220,160 C 320,160 360,225 440,225" 
              fill="none" 
              stroke="#22d3ee" 
              strokeWidth="3.5" 
              strokeDasharray="15 150"
              strokeLinecap="round"
            />

            {/* Connection Line right: SATHIYASEELAN.S to Central Shield */}
            <path 
              ref={rightLineRef}
              d="M 780,290 C 680,290 640,225 560,225" 
              fill="none" 
              stroke="url(#purple-gradient)" 
              strokeWidth="2" 
              strokeDasharray="6 6"
              className="opacity-70"
            />
            {/* Data Packet Pulse right */}
            <path 
              ref={rightPulseRef}
              d="M 780,290 C 680,290 640,225 560,225" 
              fill="none" 
              stroke="#c084fc" 
              strokeWidth="3.5" 
              strokeDasharray="15 150"
              strokeLinecap="round"
            />
          </svg>

          {/* Animated Central Core Shield */}
          <motion.div 
            animate={{ 
              y: [-12, 12, -12],
              rotateY: [0, 360]
            }}
            transition={{ 
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
              rotateY: { duration: 25, repeat: Infinity, ease: "linear" }
            }}
            className="relative z-20 w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-950/80 border-2 border-cyan-400/60 shadow-[0_0_60px_rgba(6,182,212,0.4)] flex items-center justify-center cursor-pointer group"
            style={{ perspective: 1000 }}
          >
            <div className="absolute inset-0.5 rounded-3xl bg-slate-950/90 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%),linear-gradient(90deg,rgba(6,182,212,0.06),rgba(0,0,0,0.1),rgba(168,85,247,0.06))] bg-[size:100%_4px,6px_100%]"></div>
              <Shield className="w-16 h-16 md:w-20 md:h-20 text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-pulse" />
            </div>
            
            {/* Absolute laser sweep inside shield */}
            <div className="absolute inset-0 w-full h-[2px] bg-cyan-400/50 shadow-[0_0_10px_#22d3ee] top-1/2 -translate-y-1/2 animate-[bounce_3s_infinite]"></div>
          </motion.div>

          {/* Connected Team Floating Cards */}
          {/* M.SUBASH KUMAR Floating Card Left */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-4 md:left-12 top-10 md:top-24 z-30 max-w-[200px] md:max-w-[240px] text-left"
          >
            <div className="p-4 rounded-2xl bg-black/85 border border-cyan-500/20 hover:border-cyan-400 transition-all shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-12 h-[1px] bg-gradient-to-r from-cyan-400 to-transparent"></div>
              <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-widest block">CORE FOUNDER</span>
              <h4 className="text-sm md:text-base font-black text-white uppercase tracking-tight mt-1">M.SUBASH KUMAR</h4>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">Cybersecurity & AI Security</p>
              
              <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-cyan-950/40">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></span>
                <span className="text-[9px] font-mono text-cyan-500">SEC-CORE NODE ACTIVE</span>
              </div>
            </div>
          </motion.div>

          {/* SATHIYASEELAN.S Floating Card Right */}
          <motion.div 
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute right-4 md:right-12 bottom-10 md:bottom-20 z-30 max-w-[200px] md:max-w-[240px] text-left"
          >
            <div className="p-4 rounded-2xl bg-black/85 border border-purple-500/20 hover:border-purple-400 transition-all shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-12 h-[1px] bg-gradient-to-l from-purple-400 to-transparent"></div>
              <span className="text-[9px] font-mono text-purple-400 font-bold uppercase tracking-widest block">LEAD DEV</span>
              <h4 className="text-sm md:text-base font-black text-white uppercase tracking-tight mt-1">SATHIYASEELAN.S</h4>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">Full Stack Developer</p>
              
              <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-purple-950/40">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping"></span>
                <span className="text-[9px] font-mono text-purple-500">DEV-NODE ACTIVE</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 z-10 -mt-6" id="hero-action-ctas">
          <a 
            href="#builders-section"
            className="px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-black text-xs tracking-widest uppercase transition-all duration-300 shadow-[0_0_25px_rgba(6,182,212,0.35)] flex items-center gap-2 cursor-pointer"
          >
            <span>Meet The Team</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <button 
            onClick={() => {
              const el = document.getElementById('role-map-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-4 rounded-xl bg-slate-950/90 hover:bg-cyan-950/20 border border-cyan-800/35 text-white font-mono font-black text-xs tracking-widest uppercase transition-all duration-300 hover:border-cyan-400 flex items-center gap-2 cursor-pointer"
          >
            <span>Explore XSZO</span>
            <Shield className="w-4 h-4 text-cyan-400" />
          </button>
        </div>

      </section>

      {/* ==================================================
          2. OUR MISSION
          ================================================== */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto" id="mission-section">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono font-black text-cyan-400 tracking-[0.25em] uppercase block">
            FOUNDATION
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
            ONE TEAM. ONE MISSION.
          </h2>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            XSZO AI Defence is built by people who believe cybersecurity must evolve with the threats it protects against. We combine cybersecurity, artificial intelligence, software engineering and security research to build intelligent defensive technologies.
          </p>
        </div>

        {/* Four Animated Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="mission-pillars-grid">
          {[
            { 
              title: "SECURE", 
              desc: "Building fortified architecture designed from the ground up to prevent lateral movement and credential extraction.",
              color: "text-cyan-400",
              border: "border-cyan-500/20 hover:border-cyan-400",
              icon: <Shield className="w-10 h-10 text-cyan-400" />
            },
            { 
              title: "BUILD", 
              desc: "Engineering high-performance client dashboards, localized server endpoints, and reliable ESP32 integrated nodes.",
              color: "text-purple-400",
              border: "border-purple-500/20 hover:border-purple-400",
              icon: <Code className="w-10 h-10 text-purple-400" />
            },
            { 
              title: "RESEARCH", 
              desc: "Investigating zero-day threat profiles, hardware injection protocols, and localized LLM prompt defense frameworks.",
              color: "text-cyan-400",
              border: "border-cyan-500/20 hover:border-cyan-400",
              icon: <Layers className="w-10 h-10 text-cyan-400" />
            },
            { 
              title: "DEFEND", 
              desc: "Deploying automated real-time intrusion blockers, honeypots, and self-contained security telemetry monitors.",
              color: "text-purple-400",
              border: "border-purple-500/20 hover:border-purple-400",
              icon: <Zap className="w-10 h-10 text-purple-400" />
            }
          ].map((pillar, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6 }}
              className={`p-6 rounded-2xl bg-slate-950/80 border ${pillar.border} backdrop-blur-md shadow-lg transition-all duration-300 relative group overflow-hidden`}
            >
              <div className="absolute top-0 left-0 w-1.5 h-1/2 bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="mb-4">{pillar.icon}</div>
              <h3 className="text-xl font-black text-white font-sans uppercase tracking-wide mb-2">{pillar.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">{pillar.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ==================================================
          3. CORE TEAM — MEET THE BUILDERS
          ================================================== */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-cyan-950/40" id="builders-section">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono font-black text-cyan-400 tracking-[0.25em] uppercase block">
            INDIVIDUAL DOSSIERS
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
            MEET THE BUILDERS
          </h2>
          <p className="text-gray-400 text-sm">
            Interactive credentials and verified professional portfolios of the developers powering XSZO AI DEFENCE.
          </p>
        </div>

        {/* Large Premium Profile Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12" id="builders-grid">
          
          {/* PROFILE 01: M.SUBASH KUMAR */}
          <div 
            className="relative" 
            id="dossier-god-of-cyber"
            onMouseMove={(e) => handleMouseMove(e, 'god')}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div 
              style={{
                transform: activeTiltCard === 'god' 
                  ? `perspective(1000px) rotateX(${mousePos.y * 10}deg) rotateY(${mousePos.x * -10}deg)` 
                  : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
                transition: activeTiltCard === 'god' ? 'none' : 'all 0.5s ease-out'
              }}
              className="p-8 rounded-3xl bg-gradient-to-b from-[#040816] to-[#01030a] border border-cyan-500/25 hover:border-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col justify-between min-h-[580px]"
            >
              {/* Scanline overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[size:100%_4px] rounded-3xl pointer-events-none"></div>

              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-800/40 text-[9px] font-mono text-cyan-400 tracking-wider uppercase font-bold">
                      FOUNDER & ARCHITECT
                    </span>
                    <h3 className="text-3xl font-black text-white tracking-tight font-sans uppercase mt-2">M.SUBASH KUMAR</h3>
                    <p className="text-xs font-mono text-cyan-400 font-semibold uppercase mt-1">Founder • Cybersecurity & AI Security</p>
                  </div>
                  {/* Holographic Avatar Circle */}
                  <div className="relative w-20 h-20 rounded-full border border-cyan-400/30 bg-cyan-950/20 p-1 flex items-center justify-center flex-shrink-0">
                    <svg className="w-14 h-14 text-cyan-400" viewBox="0 0 100 100" fill="none">
                      <circle cx="50" cy="40" r="15" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M50,22 L75,32 C75,55 64,72 50,80 C36,72 25,55 25,32 Z" stroke="currentColor" strokeWidth="2" />
                      <path d="M26,80 C32,62 40,55 50,55 C60,55 68,62 74,80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-cyan-400 animate-pulse"></div>
                  </div>
                </div>

                <p className="text-sm text-gray-300 leading-relaxed font-sans border-t border-cyan-950/80 pt-6">
                  “Focused on cybersecurity, artificial intelligence, LLM security, threat research and security engineering. Building practical security technologies and AI-driven defensive systems.”
                </p>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-gray-500 tracking-wider uppercase block">TECHNICAL EXPERTISE</span>
                  <div className="flex flex-wrap gap-2">
                    {["Cybersecurity", "AI Security", "LLM Security", "Threat Intelligence", "Security Research", "Security Automation", "Python", "FastAPI", "Security Engineering"].map((skill, idx) => (
                      <span 
                        key={idx} 
                        className="px-2.5 py-1 rounded bg-cyan-950/40 border border-cyan-900/40 text-xs font-mono text-cyan-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action and Social buttons */}
              <div className="mt-8 pt-6 border-t border-cyan-950/80 space-y-4">
                <div className="flex flex-wrap gap-2.5">
                  <a 
                    href="https://godofcybertech.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-black tracking-wider uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a 
                    href="https://github.com/masssubash240"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-cyan-800/35 hover:border-cyan-400 text-white text-xs font-mono font-black tracking-wider uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    <span>GitHub</span>
                  </a>
                  <a 
                    href="https://www.youtube.com/@god_of_cyber"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-cyan-800/35 hover:border-cyan-400 text-white text-xs font-mono font-black tracking-wider uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Youtube className="w-4 h-4 text-red-500" />
                    <span>YouTube</span>
                  </a>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
                  <span className="uppercase tracking-widest font-bold">NODE ID // GOD_CYBER_01</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* PROFILE 02: SATHIYASEELAN.S */}
          <div 
            className="relative" 
            id="dossier-sathiyaseelan"
            onMouseMove={(e) => handleMouseMove(e, 'seelan')}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div 
              style={{
                transform: activeTiltCard === 'seelan' 
                  ? `perspective(1000px) rotateX(${mousePos.y * 10}deg) rotateY(${mousePos.x * -10}deg)` 
                  : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
                transition: activeTiltCard === 'seelan' ? 'none' : 'all 0.5s ease-out'
              }}
              className="p-8 rounded-3xl bg-gradient-to-b from-[#090518] to-[#01010a] border border-purple-500/25 hover:border-purple-400 shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col justify-between min-h-[580px]"
            >
              {/* Scanline overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[size:100%_4px] rounded-3xl pointer-events-none"></div>

              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2.5 py-1 rounded bg-purple-950/60 border border-purple-800/40 text-[9px] font-mono text-purple-400 tracking-wider uppercase font-bold">
                      LEAD FULL STACK DEV
                    </span>
                    <h3 className="text-3xl font-black text-white tracking-tight font-sans uppercase mt-2">SATHIYASEELAN.S</h3>
                    <p className="text-xs font-mono text-purple-400 font-semibold uppercase mt-1">Full Stack Developer</p>
                  </div>
                  {/* Holographic Avatar Circle */}
                  <div className="relative w-20 h-20 rounded-full border border-purple-400/30 bg-purple-950/20 p-1 flex items-center justify-center flex-shrink-0">
                    <svg className="w-14 h-14 text-purple-400" viewBox="0 0 100 100" fill="none">
                      <rect x="35" y="25" width="30" height="30" rx="4" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M20,75 L30,65 L50,80 L70,65 L80,75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-purple-400 animate-pulse"></div>
                  </div>
                </div>

                <p className="text-sm text-gray-300 leading-relaxed font-sans border-t border-purple-950/80 pt-6">
                  “Focused on building modern web and mobile applications, frontend experiences, backend systems and practical software solutions.”
                </p>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-gray-500 tracking-wider uppercase block">TECHNICAL EXPERTISE</span>
                  <div className="flex flex-wrap gap-2">
                    {["React", "Node.js", "Python", "Flutter", "Firebase", "MySQL", "JavaScript", "Frontend Development", "Backend Development", "Mobile Development", "UI/UX"].map((skill, idx) => (
                      <span 
                        key={idx} 
                        className="px-2.5 py-1 rounded bg-purple-950/40 border border-purple-900/40 text-xs font-mono text-purple-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-gray-500 tracking-wider uppercase block">PROJECT EXPERIENCE</span>
                  <div className="flex flex-wrap gap-2">
                    {["Event Management System", "Student Attendance App", "Portfolio Website"].map((proj, idx) => (
                      <span key={idx} className="text-xs font-mono text-gray-400 flex items-center gap-1">
                        <ChevronRight className="w-3 h-3 text-purple-400" />
                        <span>{proj}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action and Social buttons */}
              <div className="mt-8 pt-6 border-t border-purple-950/80 space-y-4">
                <div className="flex flex-wrap gap-2.5">
                  <a 
                    href="https://sathiyaseelanportf.netlify.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-black text-xs font-mono font-black tracking-wider uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span>View Portfolio</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a 
                    href="https://github.com/sathiyaseelan18"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-purple-800/35 hover:border-purple-400 text-white text-xs font-mono font-black tracking-wider uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    <span>GitHub</span>
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/sathiya-seelan-ba1905408"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-purple-800/35 hover:border-purple-400 text-white text-xs font-mono font-black tracking-wider uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Linkedin className="w-4 h-4 text-blue-400" />
                    <span>LinkedIn</span>
                  </a>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
                  <span className="uppercase tracking-widest font-bold">NODE ID // SEELAN_DEV_02</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ==================================================
          4. TEAM ROLE MAP — HOW WE BUILD XSZO
          ================================================== */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-cyan-950/40" id="role-map-section">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono font-black text-cyan-400 tracking-[0.25em] uppercase block">
            ORGANIZATION & TOPOLOGY
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
            HOW WE BUILD XSZO
          </h2>
          <p className="text-gray-400 text-sm">
            Futuristic collaborative network showing structural domains connected to each builder.
          </p>
        </div>

        {/* Dynamic Topology Chart */}
        <div className="p-8 rounded-3xl bg-slate-950/70 border border-blue-950/60 backdrop-blur-md relative overflow-hidden" id="topology-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Node Map */}
            <div className="lg:col-span-8 space-y-4" id="role-nodes-col">
              <span className="text-[10px] font-mono text-cyan-400 block font-bold tracking-widest uppercase">INTERACTIVE NODE ROUTING //</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* M.SUBASH KUMAR Node Map */}
                <div 
                  onMouseEnter={() => setHoveredNode('god')}
                  onMouseLeave={() => setHoveredNode(null)}
                  className={`p-6 rounded-2xl border transition-all duration-300 ${
                    hoveredNode === 'god' ? 'bg-cyan-950/20 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]' : 'bg-[#040816]/50 border-cyan-950'
                  }`}
                >
                  <h4 className="text-lg font-mono font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    M.SUBASH KUMAR
                  </h4>
                  
                  <ul className="space-y-2.5 text-xs text-gray-400 font-mono">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-500" />
                      <span className="text-white">Cybersecurity</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-500" />
                      <span className="text-white">AI Security</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-500" />
                      <span className="text-white">Threat Research</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-500" />
                      <span className="text-white">XSZO Architecture</span>
                    </li>
                  </ul>
                </div>

                {/* SATHIYASEELAN.S Node Map */}
                <div 
                  onMouseEnter={() => setHoveredNode('seelan')}
                  onMouseLeave={() => setHoveredNode(null)}
                  className={`p-6 rounded-2xl border transition-all duration-300 ${
                    hoveredNode === 'seelan' ? 'bg-purple-950/20 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.15)]' : 'bg-[#090518]/30 border-purple-950'
                  }`}
                >
                  <h4 className="text-lg font-mono font-bold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    SATHIYASEELAN.S
                  </h4>
                  
                  <ul className="space-y-2.5 text-xs text-gray-400 font-mono">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-purple-500" />
                      <span className="text-white">Frontend Development</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-purple-500" />
                      <span className="text-white">Backend Systems</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-purple-500" />
                      <span className="text-white">Web Applications</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-purple-500" />
                      <span className="text-white">Product Engineering</span>
                    </li>
                  </ul>
                </div>

              </div>
            </div>

            {/* Right Diagnostic Console */}
            <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-950 border border-blue-950 flex flex-col justify-between h-64" id="diagnostic-console">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-black">SYS TOPOLOGY LOGS //</span>
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                </div>
                
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  The organizational matrix pairs cybersecurity research with modular full-stack product code. Hover a builder card on the left to highlight their telemetry connection vector.
                </p>
              </div>

              <div className="border-t border-blue-950/60 pt-4 space-y-1">
                <span className="text-[10px] font-mono text-cyan-400 font-bold block">CONNECTED SYSTEM ROOT:</span>
                <span className="text-[11px] font-mono text-gray-500 block">XSZO_AI_DEFENCE_MAIN // SECURE_TRUE</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================================================
          5. WHAT WE BUILD TOGETHER
          ================================================== */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-cyan-950/40" id="build-domains-section">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono font-black text-cyan-400 tracking-[0.25em] uppercase block">
            DELIVERABLES
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
            FROM CODE TO CYBER DEFENCE
          </h2>
          <p className="text-gray-400 text-sm">
            Six futuristic cybersecurity core components designed and built collaboratively by the team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="deliverables-grid">
          {[
            { title: "AI DEFENCE", subtitle: "Intelligent security systems.", icon: <Shield className="w-8 h-8 text-cyan-400" /> },
            { title: "THREAT INTELLIGENCE", subtitle: "Understand and correlate threats.", icon: <Radio className="w-8 h-8 text-purple-400" /> },
            { title: "LLM SECURITY", subtitle: "Protect AI applications and agents.", icon: <Key className="w-8 h-8 text-cyan-400" /> },
            { title: "SECURITY OPERATIONS", subtitle: "AI-assisted detection and investigation.", icon: <Monitor className="w-8 h-8 text-purple-400" /> },
            { title: "SECURITY AUTOMATION", subtitle: "Automate repetitive security workflows.", icon: <Cpu className="w-8 h-8 text-cyan-400" /> },
            { title: "PRODUCT ENGINEERING", subtitle: "Build scalable security products.", icon: <Code className="w-8 h-8 text-purple-400" /> }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl bg-slate-950/80 border border-blue-950 hover:border-cyan-500/30 transition-all shadow-md relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-cyan-500/5 to-transparent pointer-events-none"></div>
              <div className="mb-4">{item.icon}</div>
              <h4 className="text-lg font-black text-white uppercase tracking-wide mb-1.5">{item.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{item.subtitle}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ==================================================
          6. OUR TECHNOLOGY STACK
          ================================================== */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-cyan-950/40" id="tech-constellation-section">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono font-black text-cyan-400 tracking-[0.25em] uppercase block">
            STACK ARCHITECTURE
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
            THE TECHNOLOGY BEHIND THE TEAM
          </h2>
          <p className="text-gray-400 text-sm">
            Click on a directory module to inspect the verified stack technologies and dependencies.
          </p>
        </div>

        {/* Stack interactive constellation wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="constellation-interactive">
          
          {/* Tech category list */}
          <div className="lg:col-span-4 space-y-3">
            {[
              { id: 'AI / ML', icon: Cpu, items: ["Python", "LLMs", "AI Agents"] },
              { id: 'SECURITY', icon: Shield, items: ["Threat Intelligence", "SOC", "Security Automation", "LLM Security"] },
              { id: 'BACKEND', icon: Server, items: ["FastAPI", "Node.js", "APIs", "Databases"] },
              { id: 'FRONTEND', icon: Monitor, items: ["React", "TypeScript", "Tailwind CSS"] },
              { id: 'CLOUD', icon: Database, items: ["Docker", "Cloud Infrastructure", "APIs", "Deployment"] }
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeConstellation === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveConstellation(cat.id)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-cyan-950/30 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                      : 'bg-slate-950/60 border-blue-950 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm font-mono font-bold uppercase tracking-wider">{cat.id}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'rotate-90' : ''}`} />
                </button>
              );
            })}
          </div>

          {/* Tech category display window */}
          <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-950/80 border border-blue-950/70 shadow-xl min-h-[300px] flex flex-col justify-between" id="constellation-display-window">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-blue-950/50 pb-4">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-black">MODULE EXPLORER //</span>
                <span className="text-xs font-mono text-gray-500">ACTIVE: {activeConstellation}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    cat: 'AI / ML',
                    title: 'Cognitive Computing & Modeling',
                    desc: 'Utilizing modern Python frameworks and generative AI models to detect, classify, and neutralize prompt injections and software logic exploits.',
                    nodes: ["Python", "LLMs", "AI Agents", "Contextual Threat Models"]
                  },
                  {
                    cat: 'SECURITY',
                    title: 'Fortified Security Protocols',
                    desc: 'Deploying custom active honeypots, continuous system monitoring logic, MITRE ATT&CK integrations, and secure network gateways.',
                    nodes: ["Threat Intelligence", "SOC Telemetry", "Security Automation", "LLM Security"]
                  },
                  {
                    cat: 'BACKEND',
                    title: 'High-Performance API Architectures',
                    desc: 'Leveraging secure, scalable server frameworks to stream real-time events, execute commands, and persist telemetry logs cleanly.',
                    nodes: ["FastAPI", "Node.js", "Restful APIs", "Durable Databases"]
                  },
                  {
                    cat: 'FRONTEND',
                    title: 'Sophisticated Cyber Consoles',
                    desc: 'Crafting responsive client interfaces using React, TypeScript, and modern styling libraries to provide perfect diagnostic metrics and visualizers.',
                    nodes: ["React", "TypeScript", "Tailwind CSS", "Motion Animations"]
                  },
                  {
                    cat: 'CLOUD',
                    title: 'Autonomous System Deployment',
                    desc: 'Standardizing service architectures inside isolated containers, utilizing high-speed load balancers, and monitoring cloud network boundaries.',
                    nodes: ["Docker Containers", "Cloud Gateways", "Encrypted Protocols", "CI/CD Pipelines"]
                  }
                ].filter(item => item.cat === activeConstellation).map((item, idx) => (
                  <div key={idx} className="space-y-4 col-span-2 text-left">
                    <h3 className="text-xl font-bold text-white font-sans">{item.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                    
                    <div className="space-y-2 pt-2">
                      <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block">VERIFIED DEPENDENCY NODES</span>
                      <div className="flex flex-wrap gap-2">
                        {item.nodes.map((node, i) => (
                          <span key={i} className="px-2.5 py-1 rounded bg-[#040816] border border-cyan-950 text-xs font-mono text-cyan-400 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
                            <span>{node}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-blue-950/50 pt-4 mt-6 flex items-center justify-between text-[11px] font-mono text-gray-500">
              <span>SECURITY COMPLIANT // STACK VERIFIED</span>
              <span>100% SECURE SYSTEM INTEGRITY</span>
            </div>
          </div>

        </div>
      </section>

      {/* ==================================================
          7. TEAM TIMELINE — THE JOURNEY
          ================================================== */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-cyan-950/40" id="timeline-section">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono font-black text-cyan-400 tracking-[0.25em] uppercase block">
            MILESTONES
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
            THE JOURNEY
          </h2>
          <p className="text-gray-400 text-sm">
            Cinematic timeline illustrating the verified progress and core evolution of XSZO AI DEFENCE.
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 relative" id="timeline-stages-grid">
          
          {/* Timeline connecting bar (Desktop) */}
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-cyan-950/40 -translate-y-1/2 pointer-events-none hidden lg:block -z-10"></div>

          {[
            { stage: "STAGE 01", title: "IDEA", desc: "Formulated the foundational core concept for intelligent, autonomous cyber defense." },
            { stage: "STAGE 02", title: "EXPERIMENTATION", desc: "Constructed initial system sandboxes, mapping network payloads and endpoints." },
            { stage: "STAGE 03", title: "SECURITY RESEARCH", desc: "Researched automated mitigation strategies and machine learning prompt shields." },
            { stage: "STAGE 04", title: "PRODUCT DEVELOPMENT", desc: "Designed full stack interfaces, connecting secure backend databases and APIs." },
            { stage: "STAGE 05", title: "XSZO AI DEFENCE", desc: "Integrated honeypot telemetry, firmware nodes, and core defense modules." },
            { stage: "STAGE 06", title: "BUILDING THE FUTURE", desc: "Continuously optimizing detection latency and hardening AI vector models." }
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-950/80 border border-blue-950 relative overflow-hidden group hover:border-cyan-500/20 transition-all text-left">
              <span className="text-[9px] font-mono font-bold text-cyan-400 tracking-widest block mb-2">{item.stage}</span>
              <h4 className="text-base font-black text-white uppercase tracking-wide mb-1.5">{item.title}</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================
          8. TEAM PHILOSOPHY
          ================================================== */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-cyan-950/40" id="philosophy-section">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono font-black text-cyan-400 tracking-[0.25em] uppercase block">
            MINDSET
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
            HOW WE THINK
          </h2>
          <p className="text-gray-400 text-sm">
            Four guiding conceptual cornerstones that define our product architecture and engineering standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="philosophy-grid">
          {[
            { title: "RESEARCH FIRST", desc: "“We understand the problem before building the solution.”", sub: "Analyzing exploit mechanics, reading secure guidelines, and verifying vulnerability vectors prevents downstream design flaws." },
            { title: "BUILD PRACTICALLY", desc: "“We turn research into working technology.”", sub: "Theoretical security must manifest as modular code, functional APIs, and hardware-integrated nodes to protect real systems." },
            { title: "SECURITY BY DESIGN", desc: "“Security is part of the architecture, not an afterthought.”", sub: "Each parameter, session key, data persistent row, and telemetry transport stream is designed with cryptographic validation." },
            { title: "CONTINUOUSLY EVOLVE", desc: "“Threats evolve. Our defence must evolve faster.”", sub: "Static systems degrade. We optimize neural weights, scan for new vulnerabilities, and deploy responsive honeybots dynamically." }
          ].map((item, idx) => (
            <div key={idx} className="p-8 rounded-3xl bg-slate-950/60 border border-blue-950/80 text-left relative overflow-hidden group hover:border-cyan-500/20 transition-all">
              <span className="absolute top-4 right-4 text-3xl font-mono text-cyan-950 font-black tracking-tighter select-none">0{idx + 1}</span>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{item.title}</h3>
              <p className="text-sm font-mono text-cyan-400 font-bold mb-3">{item.desc}</p>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================
          9. BEHIND THE SCENES
          ================================================== */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-cyan-950/40" id="bts-section">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono font-black text-cyan-400 tracking-[0.25em] uppercase block">
            DIAGNOSTICS & TELEMETRY
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
            BEHIND THE SCENES
          </h2>
          <p className="text-gray-400 text-sm">
            Futuristic workspace monitors and terminal sandboxes streaming live code compile telemetry and diagnostic logs.
          </p>
        </div>

        {/* Sandbox Console Workspace */}
        <div className="p-8 rounded-3xl bg-slate-950/80 border border-blue-950/80 shadow-2xl relative" id="bts-workspace">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Monitor controls */}
            <div className="lg:col-span-4 space-y-3">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-black block">WORKSPACE SELECT //</span>
              
              {[
                { id: 'workstation', label: 'Developer Workstation', info: 'Compiling secure firmware routines.' },
                { id: 'soc', label: 'Security Monitor', info: 'IDS telemetry log correlation and honeypots.' },
                { id: 'ai', label: 'AI Guardrail System', info: 'Context analysis weights and token limits.' },
                { id: 'threat', label: 'Threat Visualization', info: 'Mapping packet paths and distraction nodes.' }
              ].map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => setBtsScene(scene.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    btsScene === scene.id 
                      ? 'bg-cyan-950/40 border-cyan-400 text-cyan-300' 
                      : 'bg-[#030612] border-blue-950 text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-mono font-black uppercase tracking-wider block">{scene.label}</span>
                  <span className="text-[10px] text-gray-500 font-sans block mt-1">{scene.info}</span>
                </button>
              ))}
            </div>

            {/* Diagnostic Monitor Terminal */}
            <div className="lg:col-span-8 p-6 rounded-2xl bg-black border border-blue-950/80 font-mono text-xs flex flex-col justify-between min-h-[320px]" id="bts-terminal">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-blue-950 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">CONSOLE STREAM // ACTIVE</span>
                </div>

                <div className="space-y-2 text-left">
                  {consoleLogs.map((log, index) => (
                    <div key={index} className="flex gap-2 text-gray-300">
                      <span className="text-cyan-500 select-none">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-blue-950 pt-4 mt-6 flex flex-wrap items-center justify-between text-[11px] text-gray-500">
                <span>COM PORT: /dev/ttyUSB0</span>
                <span>STATUS: STABLE_COMPILE</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================================================
          10. TEAM PROJECTS
          ================================================== */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-cyan-950/40" id="projects-section">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono font-black text-cyan-400 tracking-[0.25em] uppercase block">
            COMPLETED BUILDS
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
            BUILT BY THE TEAM
          </h2>
          <p className="text-gray-400 text-sm">
            Explore verified active cybersecurity software frameworks developed entirely from code to design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="projects-grid">
          {[
            { title: "XSZO AI DEFENCE", label: "Core Security Framework", desc: "An intelligent, self-healing cybersecurity defense matrix analyzing and neutralising prompt injection risks in real-time." },
            { title: "AI SECURITY SYSTEMS", label: "LLM Firewalls", desc: "Machine learning guardrails evaluating prompt vectors, context injection distances, and restricting malicious tokens." },
            { title: "SECURITY AUTOMATION", label: "Integrated Workflows", desc: "Decoy redirection protocols, honeypots, automated alert dispatch, and continuous client logging routines." },
            { title: "WEB / PRODUCT SYSTEMS", label: "Holographic Dashboards", desc: "High-performance full stack consoles built with React, TypeScript, and FastAPI, parsing live device telemetry feeds." }
          ].map((proj, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-slate-950/70 border border-blue-950 relative overflow-hidden group hover:border-cyan-500/20 transition-all text-left">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-black block mb-1">{proj.label}</span>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{proj.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">{proj.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================
          11. CONTRIBUTION MATRIX
          ================================================== */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-cyan-950/40" id="matrix-section">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono font-black text-cyan-400 tracking-[0.25em] uppercase block">
            VERIFIED ASSIGNMENT
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
            CONTRIBUTION MATRIX
          </h2>
          <p className="text-gray-400 text-sm">
            Futuristic interactive matrix displaying individual responsibilities across cyber, AI, dev, and research domains.
          </p>
        </div>

        {/* Matrix Grid Board */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/70 border border-blue-950/60 shadow-2xl overflow-x-auto" id="matrix-dashboard">
          <table className="w-full min-w-[600px] border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-blue-950">
                <th className="py-4 text-left text-gray-500 uppercase tracking-widest font-bold">MEMBER / CATEGORY</th>
                {matrixCategories.map(cat => (
                  <th key={cat} className="py-4 text-center text-gray-400 uppercase tracking-wider">{cat}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixData.map((row) => (
                <tr key={row.name} className="border-b border-blue-950/40 hover:bg-cyan-950/5 transition-all">
                  <td className="py-6 text-left font-black text-white uppercase text-sm tracking-wide">{row.name}</td>
                  
                  {matrixCategories.map((cat) => {
                    const item = row.data[cat as keyof typeof row.data];
                    const isCore = item.status === 'core';
                    return (
                      <td 
                        key={cat} 
                        className="py-6 text-center cursor-help relative"
                        onMouseEnter={() => setMatrixHover({ member: row.name, category: cat })}
                        onMouseLeave={() => setMatrixHover(null)}
                      >
                        <div className="inline-flex items-center justify-center">
                          {isCore ? (
                            <span className="w-4.5 h-4.5 rounded-full bg-cyan-400/20 border border-cyan-400 flex items-center justify-center shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                            </span>
                          ) : (
                            <span className="w-4.5 h-4.5 rounded-full border border-purple-500/30 flex items-center justify-center">
                              <span className="w-1.5 h-1.5 bg-purple-500/40 rounded-full"></span>
                            </span>
                          )}
                        </div>

                        {/* Interactive Tooltip Card */}
                        <AnimatePresence>
                          {matrixHover?.member === row.name && matrixHover?.category === cat && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 rounded-xl bg-slate-950 border border-cyan-500/40 shadow-2xl z-40 text-left pointer-events-none"
                            >
                              <div className="flex justify-between items-center border-b border-blue-950 pb-2 mb-2">
                                <span className="font-bold text-white uppercase tracking-wide text-[10px]">{cat} ROLE</span>
                                <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${isCore ? 'bg-cyan-950 text-cyan-400' : 'bg-purple-950 text-purple-400'}`}>
                                  {isCore ? 'CORE' : 'SUPPORT'}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-300 leading-relaxed font-sans">{item.desc}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-blue-950/40 text-[10px] font-mono text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400/20 border border-cyan-400"></span>
                <span>● Core Role</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-purple-500/30"></span>
                <span>○ Supporting Role</span>
              </span>
            </div>
            <span>MATRIX VERIFIED // INTRUSION PREVENTED TRUE</span>
          </div>
        </div>
      </section>

      {/* ==================================================
          12. JOIN THE TEAM
          ================================================== */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-cyan-950/40" id="join-section">
        <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-[#040816] to-[#01030a] border border-cyan-500/20 text-center relative overflow-hidden" id="join-callout">
          {/* Glowing particle effect behind CTA */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)] pointer-events-none"></div>

          <div className="space-y-6 max-w-2xl mx-auto z-10 relative">
            <span className="text-xs font-mono font-black text-cyan-400 tracking-[0.25em] uppercase block">
              TALENT INCUBATOR
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">
              BUILD WITH US
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              We're looking for curious builders, security researchers and engineers who want to work on the future of cyber defence.
            </p>

            <div className="space-y-2 pt-4">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">POTENTIAL STARTUP ROLES (FUTURE LISTINGS) //</span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  "Security Researcher", "AI Security Engineer", "Full Stack Engineer", 
                  "Backend Engineer", "Frontend Engineer", "Threat Intelligence Researcher", "AI/ML Engineer"
                ].map((role, idx) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1 rounded bg-[#040816]/60 border border-cyan-950/80 text-xs font-mono text-gray-400"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <button 
                onClick={() => {
                  setIsCopied(true);
                  navigator.clipboard.writeText('cybersubash230@gmail.com');
                  setTimeout(() => setIsCopied(false), 3000);
                }}
                className="px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-black text-xs tracking-widest uppercase transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer inline-flex items-center gap-2"
              >
                <Terminal className="w-4 h-4" />
                <span>{isCopied ? 'EMAIL COPIED!' : 'JOIN XSZO'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          13. TEAM SOCIAL HUB — FOLLOW THE BUILD
          ================================================== */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-cyan-950/40" id="social-hub-section">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono font-black text-cyan-400 tracking-[0.25em] uppercase block">
            SOCIAL MATRIX
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
            FOLLOW THE BUILD
          </h2>
          <p className="text-gray-400 text-sm">
            Connect directly with our builders on GitHub, Portfolio networks, and secure developer channels.
          </p>
        </div>

        {/* Two Columns of Social Handles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12" id="social-hub-grid">
          
          {/* M.SUBASH KUMAR SOCIAL */}
          <div className="p-6 rounded-3xl bg-slate-950/60 border border-cyan-950/80 text-left space-y-4 relative overflow-hidden group hover:border-cyan-500/20 transition-all">
            <h3 className="text-xl font-mono font-black text-cyan-400 uppercase tracking-wider border-b border-cyan-950 pb-3 flex items-center justify-between">
              <span>M.SUBASH KUMAR</span>
              <span className="text-[10px] font-mono text-gray-500">SEC-NODE //</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { name: 'Website', url: 'https://godofcybertech.vercel.app/', icon: Globe, user: 'Portfolio' },
                { name: 'GitHub', url: 'https://github.com/masssubash240', icon: Github, user: 'masssubash240' },
                { name: 'YouTube', url: 'https://www.youtube.com/@god_of_cyber', icon: Youtube, user: '@god_of_cyber' },
                { name: 'Instagram', url: 'https://www.instagram.com/god_of_cyber_/', icon: Instagram, user: '@god_of_cyber_' },
                { name: 'LinkedIn', url: 'https://www.linkedin.com/in/%20subash-kumar-8a07ab344', icon: Linkedin, user: 'subash-kumar' }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <a
                    key={idx}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-slate-950 border border-blue-950 hover:border-cyan-400 text-xs font-mono text-gray-400 hover:text-white flex items-center justify-between transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-cyan-400" />
                      <div>
                        <span className="text-[9px] text-gray-500 block">{item.name}</span>
                        <span className="text-white block font-semibold">{item.user}</span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-500" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* SATHIYASEELAN.S SOCIAL */}
          <div className="p-6 rounded-3xl bg-slate-950/60 border border-purple-950/80 text-left space-y-4 relative overflow-hidden group hover:border-purple-400 transition-all">
            <h3 className="text-xl font-mono font-black text-purple-400 uppercase tracking-wider border-b border-purple-950 pb-3 flex items-center justify-between">
              <span>SATHIYASEELAN.S</span>
              <span className="text-[10px] font-mono text-gray-500">DEV-NODE //</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { name: 'Portfolio', url: 'https://sathiyaseelanportf.netlify.app/', icon: Globe, user: 'sathiyaseelan' },
                { name: 'GitHub', url: 'https://github.com/sathiyaseelan18', icon: Github, user: 'sathiyaseelan18' },
                { name: 'LinkedIn', url: 'https://www.linkedin.com/in/sathiya-seelan-ba1905408', icon: Linkedin, user: 'sathiya-seelan' }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <a
                    key={idx}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-slate-950 border border-blue-950 hover:border-purple-400 text-xs font-mono text-gray-400 hover:text-white flex items-center justify-between transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-purple-400" />
                      <div>
                        <span className="text-[9px] text-gray-500 block">{item.name}</span>
                        <span className="text-white block font-semibold">{item.user}</span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-500" />
                  </a>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ==================================================
          14. FINAL CTA
          ================================================== */}
      <section className="py-24 px-4 sm:px-6 max-w-5xl mx-auto border-t border-cyan-950/40 text-center" id="final-cta-section">
        <div className="space-y-6 relative z-10">
          
          {/* Spinning concentric holographic shield */}
          <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
            <div className="absolute w-20 h-20 rounded-full border border-cyan-400/25 animate-[spin_10s_linear_infinite]"></div>
            <Shield className="w-12 h-12 text-cyan-400 drop-shadow-[0_0_15px_#22d3ee] animate-pulse" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight uppercase tracking-tight">
            THE NEXT GENERATION OF CYBER DEFENCE <br />
            STARTS WITH THE PEOPLE BUILDING IT.
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button 
              onClick={() => {
                const el = document.getElementById('builders-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-black text-xs tracking-widest uppercase transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer"
            >
              <span>Explore The Team</span>
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('team-hero-view');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 rounded-xl bg-slate-950 border border-cyan-800/35 hover:border-cyan-400 text-white font-mono font-black text-xs tracking-widest uppercase transition-all duration-300 cursor-pointer"
            >
              <span>Return To Top</span>
            </button>
          </div>
        </div>
      </section>

      {/* ==================================================
          15. FOOTER
          ================================================== */}
      <footer className="pt-16 pb-12 px-4 sm:px-6 max-w-7xl mx-auto border-t border-blue-950/50" id="team-footer">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 text-left">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-cyan-400" />
              <span className="text-lg font-black text-white tracking-widest uppercase font-sans">XSZO AI DEFENCE</span>
            </div>
            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider leading-relaxed">
              AI • CYBERSECURITY • RESEARCH • ENGINEERING
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-mono text-cyan-400 block font-bold tracking-widest uppercase">PLATFORM</span>
            <ul className="space-y-2 text-xs text-gray-400 font-mono">
              <li>AI Security</li>
              <li>Threat Intelligence</li>
              <li>Defence Frameworks</li>
              <li>Security Research</li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-mono text-cyan-400 block font-bold tracking-widest uppercase">TEAM</span>
            <ul className="space-y-2 text-xs text-gray-400 font-mono">
              <li>M.SUBASH KUMAR</li>
              <li>SATHIYASEELAN.S</li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-mono text-cyan-400 block font-bold tracking-widest uppercase">SOCIALS</span>
            <ul className="space-y-2 text-xs text-gray-400 font-mono">
              <li>GitHub</li>
              <li>YouTube</li>
              <li>Instagram</li>
              <li>LinkedIn</li>
            </ul>
          </div>

        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 pt-8 border-t border-blue-950/30 text-xs font-mono text-gray-500">
          <span>&copy; {new Date().getFullYear()} XSZO AI DEFENCE. All Rights Reserved.</span>
          <span>INTELLIGENT DEFENSIVE NETWORKS</span>
        </div>
      </footer>

    </div>
  );
}
