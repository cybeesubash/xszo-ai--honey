import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Cpu, Activity, Server, Zap, Compass, Terminal, ArrowRight, 
  CheckCircle, Globe, Network, Radio, Sparkles, AlertTriangle, Play, 
  MapPin, ShieldAlert, Key, Map, Database, LineChart, MessageSquare, 
  HelpCircle, ChevronRight, HardDrive, RefreshCw, Layers, Send, Laptop, 
  Check, Info, Mail, Lock, User, Users, PlusCircle, Trash2, ArrowUpRight, Search, 
  Settings, Fingerprint, Clock, FileText, ChevronDown, Eye, FlaskConical,
  BookOpen, Code, Github, Linkedin, ExternalLink, Youtube, Instagram, Rocket, Lightbulb, Share2
} from 'lucide-react';
import CyberGlobe3D from './CyberGlobe3D';
import { FalconShieldLogo } from './LandingPage.jsx';

import godOfCyberImg from '../assets/images/god_of_cyber.png';
import sathiyaseelanImg from '../assets/images/sathiyaseelan.jpg';
import xszoShieldImg from '../assets/images/xszo_shield.png';

interface AboutPageProps {
  onNavigateHome?: () => void;
  onNavigateLogin?: () => void;
  onNavigateDemo?: () => void;
}

export default function AboutPage({
  onNavigateHome,
  onNavigateLogin,
  onNavigateDemo
}: AboutPageProps) {
  // Navigation & Scroll State
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'god_of_cyber' | 'sathiyaseelan'>('all');
  const [activeTech, setActiveTech] = useState<string | null>('AI / ML');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Mouse tilt effect for founder cards
  const [tiltFounder, setTiltFounder] = useState({ x: 0, y: 0 });
  const [tiltCTO, setTiltCTO] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(url);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleMouseMoveFounder = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 15;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -15;
    setTiltFounder({ x, y });
  };

  const handleMouseMoveCTO = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 15;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -15;
    setTiltCTO({ x, y });
  };

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden relative">

      {/* 1. NAVBAR */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-[#030712]/90 backdrop-blur-xl border-b border-blue-950/60 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)]' 
            : 'bg-transparent py-5 border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={onNavigateHome} 
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative flex items-center justify-center">
              <FalconShieldLogo className="w-9 h-9 transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-cyan-500/20 blur-lg rounded-full group-hover:bg-cyan-400/40 transition-all" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-lg tracking-wider font-mono flex items-center gap-1.5 leading-none">
                XSZO <span className="text-cyan-400 font-light">AI</span>
              </span>
              <span className="text-[9px] tracking-[0.25em] text-blue-400/80 font-mono font-semibold uppercase leading-tight mt-0.5">
                DEFENCE
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="hidden lg:flex items-center gap-7 text-xs font-mono tracking-wider text-gray-300">
            <button onClick={onNavigateHome} className="hover:text-cyan-400 transition-colors cursor-pointer">HOME</button>
            <button onClick={onNavigateHome} className="hover:text-cyan-400 transition-colors cursor-pointer">PLATFORM</button>
            <button onClick={onNavigateHome} className="hover:text-cyan-400 transition-colors cursor-pointer">AI SECURITY</button>
            <button onClick={onNavigateHome} className="hover:text-cyan-400 transition-colors cursor-pointer">INTELLIGENCE</button>
            <button onClick={onNavigateHome} className="hover:text-cyan-400 transition-colors cursor-pointer">DEFENCE</button>
            <button onClick={onNavigateHome} className="hover:text-cyan-400 transition-colors cursor-pointer">RESEARCH</button>
            <button className="text-cyan-400 font-bold border-b border-cyan-400 pb-0.5 cursor-default">ABOUT</button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button 
              onClick={onNavigateLogin}
              className="px-4 py-2 text-xs font-mono text-cyan-300 hover:text-white bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/50 rounded-lg transition-all cursor-pointer"
            >
              Login
            </button>
            <button 
              onClick={onNavigateDemo || onNavigateLogin}
              className="px-4 py-2 text-xs font-mono font-bold text-black bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-300 hover:brightness-110 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Book a Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Background Ambient Glow Grid */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[700px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[180px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* 2. ABOUT HERO */}
      <section className="relative pt-36 pb-24 lg:pt-44 lg:pb-32 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.15)]"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>ABOUT XSZO</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans"
              >
                BUILDING THE FUTURE OF <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 drop-shadow-[0_0_25px_rgba(56,189,248,0.3)]">
                  AI-POWERED CYBER DEFENCE
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-gray-300 text-base sm:text-lg max-w-2xl leading-relaxed font-light"
              >
                “XSZO AI Defence is building intelligent cybersecurity technologies designed to detect, understand and respond to evolving digital threats.”
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-wrap gap-4 pt-2"
              >
                <a 
                  href="#who-we-are"
                  className="px-7 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono text-sm font-bold rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore XSZO</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a 
                  href="#founding-team"
                  className="px-7 py-3.5 bg-blue-950/60 hover:bg-blue-900/80 border border-blue-700/50 hover:border-cyan-400/50 text-cyan-300 hover:text-white font-mono text-sm font-semibold rounded-xl backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Meet Our Team</span>
                </a>
              </motion.div>
            </div>

            {/* Right Side: 3D XSZO Shield / Security Core */}
            <div className="lg:col-span-5 flex justify-center relative">
              <motion.div 
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.2 }}
                className="relative w-full max-w-[420px] aspect-square flex items-center justify-center"
              >
                {/* Rotating Holographic Rings */}
                <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-4 rounded-full border border-dashed border-blue-500/30 animate-[spin_15s_linear_infinite_reverse]" />
                <div className="absolute inset-10 rounded-full border border-violet-500/20 animate-[spin_25s_linear_infinite]" />

                {/* Pulsing Aura */}
                <div className="absolute w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />

                {/* Futuristic Floating Platform Underneath */}
                <div className="absolute -bottom-6 w-72 h-12 bg-gradient-to-t from-cyan-500/30 via-blue-600/10 to-transparent rounded-full blur-md" />

                {/* 3D Shield Image Card */}
                <div className="relative z-10 p-6 bg-[#06101F]/80 border border-cyan-500/40 rounded-3xl backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col items-center justify-center group">
                  <img 
                    src={xszoShieldImg} 
                    alt="XSZO AI Security Shield" 
                    className="w-64 sm:w-72 h-auto object-contain drop-shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-cyan-950/80 border border-cyan-800/60 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-[11px] font-mono font-bold text-cyan-300 tracking-wider uppercase">INTELLIGENT DEFENCE CORE</span>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. WHO WE ARE */}
      <section id="who-we-are" className="py-24 relative border-t border-blue-950/50 bg-[#040919]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest px-3 py-1 bg-blue-950/60 border border-blue-800/40 rounded-full">
              ORGANIZATION OVERVIEW
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              WHO WE ARE
            </h2>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed font-light">
              “XSZO AI Defence is an AI-native cybersecurity initiative focused on building intelligent defensive technologies. We combine cybersecurity engineering, artificial intelligence, security research and software engineering to develop practical solutions for the modern threat landscape.”
            </p>
          </div>

          {/* 3 Floating 3D Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: AI */}
            <motion.div 
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="p-8 rounded-2xl bg-[#071328]/70 border border-cyan-500/30 hover:border-cyan-400 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-black transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <Cpu className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 font-mono">AI</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Integrating neural networks, LLMs, heuristics and predictive threat models to analyze complex digital telemetry autonomously.
              </p>
            </motion.div>

            {/* Card 2: CYBERSECURITY */}
            <motion.div 
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="p-8 rounded-2xl bg-[#071328]/70 border border-blue-500/30 hover:border-blue-400 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-black transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 font-mono">CYBERSECURITY</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Building resilient threat detection, honeypot telemetry grids, automated incident suppression, and offensive vulnerability auditing.
              </p>
            </motion.div>

            {/* Card 3: ENGINEERING */}
            <motion.div 
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="p-8 rounded-2xl bg-[#071328]/70 border border-violet-500/30 hover:border-violet-400 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-violet-950/80 border border-violet-800/60 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-110 group-hover:bg-violet-500 group-hover:text-black transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                <Terminal className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 font-mono">ENGINEERING</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Architecting high-throughput full-stack platforms, real-time WebSocket pipelines, and enterprise-grade distributed security tooling.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 4. OUR MISSION */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest px-3 py-1 bg-cyan-950/60 border border-cyan-800/40 rounded-full">
                PURPOSE & DIRECTION
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
                OUR MISSION
              </h2>
              <blockquote className="p-6 rounded-2xl bg-[#071328]/80 border-l-4 border-cyan-400 text-gray-200 text-lg sm:text-xl font-light leading-relaxed italic backdrop-blur-md shadow-xl">
                “Build intelligent defensive technologies that help organizations understand threats, reduce risk and protect their digital infrastructure.”
              </blockquote>
            </div>

            {/* Right 3D Visual Shield Protecting Digital City */}
            <div className="lg:col-span-6">
              <div className="relative p-8 rounded-3xl bg-gradient-to-b from-[#0a1835]/90 to-[#030712]/90 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_40px_rgba(6,182,212,0.15)] overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                
                {/* Central Shield Protection Graphic */}
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                      <ShieldAlert className="w-12 h-12 animate-pulse" />
                    </div>
                    <div className="absolute -inset-3 rounded-2xl border border-dashed border-cyan-400/30 animate-spin" />
                  </div>
                  <h4 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
                    Digital Subnet Protection Layer
                  </h4>

                  {/* 4 Orbital Nodes Around City */}
                  <div className="grid grid-cols-2 gap-4 w-full">
                    {[
                      { title: 'AI', desc: 'Predictive Defense', icon: Cpu, color: 'text-cyan-400' },
                      { title: 'Threat Intelligence', desc: 'Pattern Recognition', icon: Globe, color: 'text-blue-400' },
                      { title: 'Automation', desc: 'Instant Response', icon: Zap, color: 'text-violet-400' },
                      { title: 'Security Analytics', desc: 'Telemetry Auditing', icon: Activity, color: 'text-emerald-400' }
                    ].map((node, i) => (
                      <div key={i} className="p-4 rounded-xl bg-[#040a1b]/90 border border-blue-900/60 flex items-center gap-3">
                        <node.icon className={`w-5 h-5 ${node.color} flex-shrink-0`} />
                        <div className="text-left">
                          <span className="text-xs font-mono font-bold text-white block">{node.title}</span>
                          <span className="text-[10px] text-gray-400 font-sans">{node.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>


      {/* 6. WHAT WE BUILD */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest px-3 py-1 bg-cyan-950/60 border border-cyan-800/40 rounded-full">
              DEFENSIVE CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              WHAT WE BUILD
            </h2>
            <p className="text-gray-400 text-sm sm:text-base font-light">
              Architecting core technologies designed for modern enterprise threat environments.
            </p>
          </div>

          {/* 6 Premium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'AI-POWERED SECURITY',
                desc: 'AI-driven security analysis and intelligent defence against non-deterministic attack vectors.',
                icon: Cpu,
                color: 'from-cyan-500/20 to-blue-600/10',
                border: 'border-cyan-500/40'
              },
              {
                title: 'THREAT INTELLIGENCE',
                desc: 'Understand threats, attackers and emerging attack patterns with real-time telemetry analysis.',
                icon: Globe,
                color: 'from-blue-500/20 to-indigo-600/10',
                border: 'border-blue-500/40'
              },
              {
                title: 'LLM SECURITY',
                desc: 'Protect AI applications, RAG systems, prompt pipelines and autonomous AI agents.',
                icon: Lock,
                color: 'from-violet-500/20 to-purple-600/10',
                border: 'border-violet-500/40'
              },
              {
                title: 'SECURITY AUTOMATION',
                desc: 'Automate security workflows, incident response playbooks and forensic investigations.',
                icon: Zap,
                color: 'from-cyan-500/20 to-emerald-600/10',
                border: 'border-emerald-500/40'
              },
              {
                title: 'CYBER DEFENCE',
                desc: 'Build proactive systems that detect, isolate and suppress cyber intrusions instantly.',
                icon: ShieldAlert,
                color: 'from-blue-600/20 to-cyan-600/10',
                border: 'border-blue-400/40'
              },
              {
                title: 'SECURITY ENGINEERING',
                desc: 'Develop scalable cybersecurity products, firmware audit pipelines and robust infrastructure.',
                icon: Code,
                color: 'from-indigo-500/20 to-violet-600/10',
                border: 'border-indigo-400/40'
              }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className={`p-7 rounded-2xl bg-gradient-to-b ${item.color} bg-[#060c1e]/90 border ${item.border} backdrop-blur-xl shadow-xl flex flex-col justify-between group`}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2.5 font-mono tracking-wide">
                    {item.title}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-cyan-400">
                  <span>CAPABILITY NODE {idx + 1}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. FOUNDING TEAM SECTION */}
      <section id="founding-team" className="py-28 relative border-t border-blue-950/60 bg-[#030614]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest px-3.5 py-1.5 bg-cyan-950/60 border border-cyan-800/40 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            >
              EXECUTIVE LEADERSHIP
            </motion.span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
              THE PEOPLE BEHIND XSZO
            </h2>
            <p className="text-cyan-300 text-lg sm:text-xl font-mono font-medium">
              “Two builders. One vision. A new approach to cyber defence.”
            </p>
          </div>

          {/* 8 & 9. FOUNDER & CTO CARDS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* 8. FOUNDER — M.SUBASH KUMAR */}
            <motion.div 
              onMouseMove={handleMouseMoveFounder}
              onMouseLeave={() => setTiltFounder({ x: 0, y: 0 })}
              style={{
                transform: `perspective(1000px) rotateX(${tiltFounder.y}deg) rotateY(${tiltFounder.x}deg)`
              }}
              className="p-8 sm:p-10 rounded-3xl bg-[#061024]/90 border border-cyan-500/50 backdrop-blur-2xl shadow-[0_20px_50px_rgba(6,182,212,0.2)] transition-transform duration-200 ease-out flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Top Glow Accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                {/* Header Profile Section */}
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                  
                  {/* Holographic Circular Portrait Frame */}
                  <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 animate-[spin_12s_linear_infinite]" />
                    <div className="absolute inset-1.5 rounded-full border border-dashed border-cyan-300/60 animate-[spin_8s_linear_infinite_reverse]" />
                    <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md" />
                    
                    <img 
                      src={godOfCyberImg} 
                      alt="M.SUBASH KUMAR - Founder" 
                      className="w-28 h-28 rounded-full object-cover relative z-10 border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.5)]"
                    />

                    <div className="absolute bottom-0 right-0 z-20 p-1.5 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300">
                      <Shield className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="text-center sm:text-left space-y-1.5">
                    <div className="inline-block px-2.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                      FOUNDER & CEO | M.SUBASH KUMAR
                    </div>
                    <h3 className="text-3xl font-extrabold text-white font-sans tracking-wide">
                      M.SUBASH KUMAR
                    </h3>
                    <p className="text-cyan-300 text-sm font-mono font-semibold">
                      Founder & CEO — Cybersecurity Engineer
                    </p>
                  </div>

                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-light mb-6">
                  “Focused on cybersecurity, AI security, LLM security, threat research and cyber defence engineering. Building XSZO with a focus on intelligent security systems, security research and AI-powered defensive technologies.”
                </p>

                {/* Expertise Badges */}
                <div className="space-y-3 mb-8">
                  <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider block">
                    AREAS OF EXPERTISE:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Cybersecurity', 'AI Security', 'LLM Security', 
                      'Threat Research', 'Security Engineering', 'Cyber Defence'
                    ].map((exp, i) => (
                      <span 
                        key={i} 
                        className="px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-mono font-medium shadow-inner"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons & Verification Links */}
              <div className="pt-6 border-t border-cyan-900/40 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <a 
                    href="https://godofcybertech.vercel.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a 
                    href="https://github.com/masssubash240" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 border border-blue-700/60 text-white font-mono text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Github className="w-3.5 h-3.5 text-cyan-400" />
                    <span>GitHub</span>
                  </a>

                  <a 
                    href="https://www.youtube.com/@god_of_cyber" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-800/50 text-red-300 font-mono text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Youtube className="w-3.5 h-3.5 text-red-400" />
                    <span>YouTube</span>
                  </a>
                </div>

                {/* Additional Links Row */}
                <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
                  <a href="https://www.instagram.com/god_of_cyber_" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition-colors flex items-center gap-1">
                    <Instagram className="w-3 h-3 text-pink-400" /> Instagram
                  </a>
                  <a href="https://www.linkedin.com/in/%20subash-kumar-8a07ab344" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition-colors flex items-center gap-1">
                    <Linkedin className="w-3 h-3 text-blue-400" /> LinkedIn
                  </a>
                </div>
              </div>

            </motion.div>

            {/* 9. CTO — SATHIYASEELAN S. */}
            <motion.div 
              onMouseMove={handleMouseMoveCTO}
              onMouseLeave={() => setTiltCTO({ x: 0, y: 0 })}
              style={{
                transform: `perspective(1000px) rotateX(${tiltCTO.y}deg) rotateY(${tiltCTO.x}deg)`
              }}
              className="p-8 sm:p-10 rounded-3xl bg-[#081028]/90 border border-violet-500/50 backdrop-blur-2xl shadow-[0_20px_50px_rgba(139,92,246,0.2)] transition-transform duration-200 ease-out flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Top Glow Accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                {/* Header Profile Section */}
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                  
                  {/* Holographic Circular Portrait Frame */}
                  <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-violet-400/40 animate-[spin_14s_linear_infinite]" />
                    <div className="absolute inset-1.5 rounded-full border border-dashed border-violet-300/60 animate-[spin_10s_linear_infinite_reverse]" />
                    <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-md" />
                    
                    <img 
                      src={sathiyaseelanImg} 
                      alt="SATHIYASEELAN S. - CTO" 
                      className="w-28 h-28 rounded-full object-cover relative z-10 border-2 border-violet-400 shadow-[0_0_25px_rgba(139,92,246,0.5)]"
                    />

                    <div className="absolute bottom-0 right-0 z-20 p-1.5 rounded-full bg-violet-950 border border-violet-400 text-violet-300">
                      <Cpu className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="text-center sm:text-left space-y-1.5">
                    <div className="inline-block px-2.5 py-0.5 rounded bg-violet-950/80 border border-violet-500/40 text-[10px] font-mono font-bold text-violet-300 uppercase tracking-widest">
                      CHIEF TECHNOLOGY OFFICER
                    </div>
                    <h3 className="text-3xl font-extrabold text-white font-sans tracking-wide">
                      SATHIYASEELAN S.
                    </h3>
                    <p className="text-violet-300 text-sm font-mono font-semibold">
                      CTO — Full-Stack Engineer & AI Developer
                    </p>
                  </div>

                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-light mb-6">
                  “Focused on full-stack engineering, AI development and building scalable digital products for the XSZO ecosystem.”
                </p>

                {/* Expertise Badges */}
                <div className="space-y-3 mb-6">
                  <span className="text-xs font-mono font-semibold text-violet-400 uppercase tracking-wider block">
                    AREAS OF EXPERTISE:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Full-Stack Engineering', 'AI Development', 'Frontend Development', 
                      'Backend Development', 'Application Development', 'Product Engineering'
                    ].map((exp, i) => (
                      <span 
                        key={i} 
                        className="px-3 py-1 rounded-lg bg-violet-950/60 border border-violet-800/60 text-violet-200 text-xs font-mono font-medium shadow-inner"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tech Stack Pills */}
                <div className="space-y-2 mb-8">
                  <span className="text-[11px] font-mono font-semibold text-gray-400 uppercase tracking-wider block">
                    CORE TECHNOLOGIES:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['React', 'Node.js', 'Python', 'Flutter', 'Firebase', 'MySQL', 'APIs'].map((tech, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 bg-black/60 border border-blue-900/60 text-cyan-300 rounded text-[11px] font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons & Links */}
              <div className="pt-6 border-t border-violet-900/40 flex flex-wrap items-center gap-3">
                <a 
                  href="https://sathiyaseelanportf.netlify.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.4)] cursor-pointer"
                >
                  <span>Portfolio</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a 
                  href="https://github.com/sathiyaseelan18" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 border border-blue-700/60 text-white font-mono text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Github className="w-3.5 h-3.5 text-violet-400" />
                  <span>GitHub</span>
                </a>

                <a 
                  href="https://www.linkedin.com/in/sathiya-seelan-ba1905408" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-800 text-blue-300 font-mono text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                  <span>LinkedIn</span>
                </a>
              </div>

            </motion.div>

          </div>

        </div>
      </section>

      {/* 10. FOUNDING TEAM CONNECTION */}
      <section className="py-24 relative border-t border-blue-950/60 bg-[#020512]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest px-3 py-1 bg-blue-950/60 border border-blue-800/40 rounded-full">
              INTERACTIVE ARCHITECTURE MATRIX
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
              SECURITY × ENGINEERING × AI
            </h2>
          </div>

          {/* 3D Interactive Visualization */}
          <div className="p-8 sm:p-12 rounded-3xl bg-[#050c1f]/80 border border-cyan-500/30 backdrop-blur-xl relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)]">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              {/* Left Node: M.SUBASH KUMAR */}
              <div className="lg:col-span-4 p-6 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-cyan-400" />
                  <span className="font-mono font-bold text-white text-lg">M.SUBASH KUMAR</span>
                </div>
                <div className="space-y-2 text-xs font-mono text-cyan-300">
                  <div className="p-2 rounded bg-black/60 border border-cyan-900">Cybersecurity Engineering</div>
                  <div className="p-2 rounded bg-black/60 border border-cyan-900">AI Security & Threat Research</div>
                  <div className="p-2 rounded bg-black/60 border border-cyan-900">LLM Exploit Auditing</div>
                </div>
              </div>

              {/* Center Core Node: XSZO AI DEFENCE */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-6 my-4 lg:my-0">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 p-1 animate-[spin_10s_linear_infinite]">
                    <div className="w-full h-full rounded-full bg-[#030712] flex items-center justify-center">
                      <FalconShieldLogo className="w-10 h-10" />
                    </div>
                  </div>
                  <div className="absolute -inset-4 bg-cyan-400/20 rounded-full blur-xl animate-pulse" />
                </div>
                <h4 className="text-xl font-extrabold text-white font-mono mt-4">XSZO</h4>
                <p className="text-xs font-mono text-cyan-400">INTELLIGENT DEFENCE GRID</p>
              </div>

              {/* Right Node: SATHIYASEELAN S. */}
              <div className="lg:col-span-4 p-6 rounded-2xl bg-violet-950/40 border border-violet-500/40 space-y-4">
                <div className="flex items-center gap-3">
                  <Cpu className="w-6 h-6 text-violet-400" />
                  <span className="font-mono font-bold text-white text-lg">SATHIYASEELAN S.</span>
                </div>
                <div className="space-y-2 text-xs font-mono text-violet-200">
                  <div className="p-2 rounded bg-black/60 border border-violet-900">Full-Stack Engineering</div>
                  <div className="p-2 rounded bg-black/60 border border-violet-900">AI Product Development</div>
                  <div className="p-2 rounded bg-black/60 border border-violet-900">Scalable System Architecture</div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 11. HOW WE BUILD */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest px-3 py-1 bg-cyan-950/60 border border-cyan-800/40 rounded-full">
              METHODOLOGY & PIPELINE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              HOW WE BUILD
            </h2>
          </div>

          {/* 4-Stage Visual Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'RESEARCH', desc: 'Understand emerging technologies, vulnerability vectors and evolving threat patterns.' },
              { num: '02', title: 'DESIGN', desc: 'Create secure architectures, threat models and resilient product concepts.' },
              { num: '03', title: 'BUILD', desc: 'Turn ideas into high-performance functional software systems.' },
              { num: '04', title: 'DEFEND', desc: 'Continuously audit, refine and improve security resilience.' }
            ].map((stage, idx) => (
              <div key={idx} className="p-7 rounded-2xl bg-[#060e22]/80 border border-cyan-500/30 backdrop-blur-xl relative overflow-hidden group">
                <div className="text-4xl font-extrabold text-cyan-500/30 font-mono mb-4 group-hover:text-cyan-400 transition-colors">
                  {stage.num}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-mono tracking-wider">
                  {stage.title}
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed font-light">
                  {stage.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 12. OUR CORE VALUES */}
      <section className="py-24 relative border-t border-blue-950/50 bg-[#04091c]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest px-3 py-1 bg-blue-950/60 border border-blue-800/40 rounded-full">
              GUIDING PRINCIPLES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              OUR CORE VALUES
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'INNOVATION', desc: 'Explore new ideas and build what comes next.', icon: Lightbulb, color: 'text-amber-400' },
              { title: 'SECURITY', desc: 'Security is not an add-on; it is part of the core architecture.', icon: Shield, color: 'text-cyan-400' },
              { title: 'COLLABORATION', desc: 'Great technology is built together through shared discipline.', icon: Network, color: 'text-blue-400' },
              { title: 'IMPACT', desc: 'Build practical solutions that solve meaningful real-world problems.', icon: Rocket, color: 'text-violet-400' }
            ].map((val, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -6 }}
                className="p-7 rounded-2xl bg-[#061024]/90 border border-blue-900/60 backdrop-blur-xl space-y-4"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-800/60 flex items-center justify-center">
                  <val.icon className={`w-6 h-6 ${val.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white font-mono">{val.title}</h3>
                <p className="text-gray-300 text-xs sm:text-sm font-light leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 13. XSZO TECHNOLOGY CONSTELLATION */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest px-3 py-1 bg-cyan-950/60 border border-cyan-800/40 rounded-full">
              TECH CONSTELLATION
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              XSZO TECHNOLOGY
            </h2>
          </div>

          <div className="p-8 rounded-3xl bg-[#050a1a]/90 border border-cyan-500/30 flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {[
              'Python', 'FastAPI', 'React', 'Node.js', 'AI / ML', 'LLMs', 
              'AI Agents', 'APIs', 'Databases', 'Cloud', 'Docker', 'Security Automation'
            ].map((tech, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveTech(tech)}
                className={`px-5 py-2.5 rounded-xl font-mono text-sm font-semibold transition-all cursor-pointer ${
                  activeTech === tech 
                    ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.5)] scale-105' 
                    : 'bg-blue-950/50 hover:bg-blue-900/60 border border-blue-800/50 text-cyan-300'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* 14. RESEARCH & INNOVATION */}
      <section className="py-24 relative border-t border-blue-950/50 bg-[#040818]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest px-3 py-1 bg-cyan-950/60 border border-cyan-800/40 rounded-full">
              RESEARCH LABS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              BUILT FOR THE NEXT THREAT
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { title: 'AI SECURITY', items: ['Threat Research', 'LLM Security'] },
              { title: 'VULNERABILITY AUDITING', items: ['Vulnerability Research', 'Dynamic Stack Heuristics'] },
              { title: 'AUTONOMOUS DEFENCE', items: ['Cyber Defence', 'Security Automation'] }
            ].map((res, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-[#061026]/90 border border-cyan-500/30 backdrop-blur-xl text-left space-y-4">
                <FlaskConical className="w-8 h-8 text-cyan-400" />
                <h3 className="text-xl font-bold text-white font-mono">{res.title}</h3>
                <ul className="space-y-2 text-sm text-gray-300 font-mono">
                  {res.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-cyan-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <button 
            onClick={onNavigateHome}
            className="px-8 py-3.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-cyan-500/40 text-cyan-300 hover:text-white font-mono text-sm font-bold transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>Explore XSZO Research</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>
      </section>

      {/* 15. OUR JOURNEY */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest px-3 py-1 bg-blue-950/60 border border-blue-800/40 rounded-full">
              ORGANIZATION MILESTONES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              OUR JOURNEY
            </h2>
          </div>

          {/* Futuristic Verified Timeline */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-5xl mx-auto">
            {['IDEA', 'RESEARCH', 'PROTOTYPE', 'ENGINEERING', 'XSZO AI DEFENCE'].map((step, idx) => (
              <React.Fragment key={idx}>
                <div className="px-6 py-4 rounded-xl bg-[#07132b]/90 border border-cyan-500/40 font-mono text-sm font-bold text-white shadow-lg text-center w-full md:w-auto">
                  {step}
                </div>
                {idx < 4 && (
                  <ArrowRight className="w-5 h-5 text-cyan-400 hidden md:block flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>

        </div>
      </section>

      {/* 17. FINAL CTA */}
      <section className="py-28 relative overflow-hidden bg-gradient-to-b from-[#030712] via-[#061026] to-[#030712] border-t border-blue-950/60 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
          
          <img 
            src={xszoShieldImg} 
            alt="XSZO AI Shield" 
            className="w-44 h-auto mx-auto drop-shadow-[0_0_35px_rgba(6,182,212,0.5)] animate-pulse"
          />

          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
            BUILD THE FUTURE OF <br />
            <span className="text-cyan-400">CYBER DEFENCE WITH US.</span>
          </h2>

          <p className="text-gray-300 text-base sm:text-lg max-w-xl mx-auto font-light">
            “Explore XSZO AI Defence and discover how intelligent security technology can transform modern defence.”
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button 
              onClick={onNavigateHome}
              className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black font-mono text-sm font-bold rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all cursor-pointer"
            >
              Explore Platform
            </button>
            <button 
              onClick={onNavigateHome}
              className="px-8 py-4 bg-blue-950/80 hover:bg-blue-900 border border-cyan-500/50 text-cyan-300 font-mono text-sm font-semibold rounded-xl backdrop-blur-md transition-all cursor-pointer"
            >
              Back to Home
            </button>
          </div>

        </div>
      </section>

      {/* 18. FOOTER */}
      <footer className="bg-[#02040b] border-t border-blue-950/80 py-16 text-gray-400 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <FalconShieldLogo className="w-7 h-7" />
              <span className="font-extrabold text-white text-base tracking-wider font-mono">XSZO AI DEFENCE</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed font-sans">
              “AI-powered cyber defence for a safer digital world.”
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <span className="text-white font-bold block mb-1">PLATFORM</span>
            <div><button onClick={onNavigateHome} className="hover:text-cyan-400 transition-colors">Platform Overview</button></div>
            <div><button onClick={onNavigateHome} className="hover:text-cyan-400 transition-colors">AI Security Engine</button></div>
            <div><button onClick={onNavigateHome} className="hover:text-cyan-400 transition-colors">Threat Intelligence</button></div>
            <div><button onClick={onNavigateHome} className="hover:text-cyan-400 transition-colors">Autonomous Defence</button></div>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <span className="text-white font-bold block mb-1">COMPANY</span>
            <div><button className="text-cyan-400">About XSZO</button></div>
            <div><a href="#founding-team" className="hover:text-cyan-400 transition-colors">Founding Team</a></div>
            <div><button onClick={onNavigateHome} className="hover:text-cyan-400 transition-colors">Careers</button></div>
            <div><button onClick={onNavigateHome} className="hover:text-cyan-400 transition-colors">Research</button></div>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <span className="text-white font-bold block mb-1">CONNECT</span>
            <div><a href="https://github.com/masssubash240" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">GitHub</a></div>
            <div><a href="https://www.youtube.com/@god_of_cyber" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">YouTube</a></div>
            <div><a href="https://www.instagram.com/god_of_cyber_" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">Instagram</a></div>
            <div><a href="https://www.linkedin.com/in/%20subash-kumar-8a07ab344" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">LinkedIn</a></div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>© {new Date().getFullYear()} XSZO AI Defence. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <span className="hover:text-gray-200 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-200 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-gray-200 transition-colors cursor-pointer">Security Practices</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
