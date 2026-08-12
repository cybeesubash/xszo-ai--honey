import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, Shield, Send, Check, Terminal, Search, Zap, ArrowRight, X } from 'lucide-react';
import { fetchAdvisor, sendChatMessage, sendTestEvent } from '../lib/api';

export default function AnalystPanel({ selectedIp, onSelectIp, onBlockIp, onInspectIp, logs = [], onSimulateAttack }) {
  const [advisorData, setAdvisorData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedRule, setCopiedRule] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [customIpInput, setCustomIpInput] = useState('');

  // Extract unique IPs from logs
  const capturedIps = [...new Set(logs.map((l) => l.src_ip || l.ip).filter(Boolean))];
  const targetLogs = selectedIp
    ? logs.filter((log) => (log.src_ip || log.ip) === selectedIp)
    : [];
  const newestEvent = targetLogs[0];
  const oldestEvent = targetLogs.length > 0
    ? targetLogs.reduce((oldest, entry) => new Date(entry.timestamp) < new Date(oldest.timestamp) ? entry : oldest)
    : null;
  const targetedServices = [...new Set(targetLogs.map((entry) => entry.service).filter(Boolean))];
  const targetedPorts = [...new Set(targetLogs.map((entry) => entry.port).filter(Boolean))];
  const formatTimestamp = (value) => value
    ? new Date(value).toLocaleString()
    : 'Not observed';

  // Auto-select first IP from logs if none selected
  useEffect(() => {
    if (!selectedIp && capturedIps.length > 0 && onSelectIp) {
      onSelectIp(capturedIps[0]);
    }
  }, [selectedIp, capturedIps]);

  useEffect(() => {
    if (!selectedIp) {
      setAdvisorData(null);
      setChatMessages([]);
      return;
    }

    async function loadAdvisor() {
      setLoading(true);
      const data = await fetchAdvisor(selectedIp);
      setAdvisorData(data);
      setLoading(false);
      setChatMessages([
        {
          role: 'assistant',
          content: `Initialized GOC AI Agent defensive grounding for IP ${selectedIp}. Ask me any SOC question regarding rule synthesis, threat intent, or mitigation strategies.`
        }
      ]);
    }

    loadAdvisor();
  }, [selectedIp]);

  const handleCustomIpSubmit = (e) => {
    e.preventDefault();
    const target = customIpInput.trim();
    if (target && onSelectIp) {
      onSelectIp(target);
      setCustomIpInput('');
    }
  };

  const copyFirewallRule = () => {
    const rule = advisorData?.firewall_rule_iptables || advisorData?.firewall_rule || `iptables -A INPUT -s ${selectedIp || '0.0.0.0'} -j DROP`;
    navigator.clipboard.writeText(rule);
    setCopiedRule(true);
    setTimeout(() => setCopiedRule(false), 2000);
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedIp || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);

    const res = await sendChatMessage(selectedIp, userMsg);
    setChatLoading(false);

    if (res?.response) {
      setChatMessages((prev) => [...prev, { role: 'assistant', content: res.response }]);
    } else {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Unable to process recommendation. Verify backend connectivity.' }
      ]);
    }
  };

  const triggerSimulate = async () => {
    const res = await sendTestEvent();
    if (res?.ok) {
      if (onSimulateAttack) onSimulateAttack();
    }
  };

  return (
    <div className="card-glass flex flex-col h-full overflow-hidden border border-white/10 shadow-2xl min-h-[520px]">
      {/* Panel Header + IP Selector */}
      <div className="p-4 bg-slate-900/80 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-cyan-400 animate-pulse" />
          <span className="font-extrabold text-xs tracking-wider uppercase text-white font-mono text-glow-cyan">
            GOC AI Agent Mitigation
          </span>
        </div>

        {/* IP Selector / Search Bar */}
        <form onSubmit={handleCustomIpSubmit} className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search size={12} className="absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Enter IP (e.g. 10.204.23.189)..."
              value={customIpInput}
              onChange={(e) => setCustomIpInput(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-lg pl-7 pr-2 py-1 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <button
            type="submit"
            className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-colors shrink-0"
          >
            Analyze
          </button>
        </form>
      </div>

      {/* Quick Select Chips for captured IPs */}
      {capturedIps.length > 0 && (
        <div className="px-4 py-2 bg-slate-950/60 border-b border-white/5 flex items-center gap-2 overflow-x-auto text-[11px] font-mono">
          <span className="text-slate-500 text-[10px] uppercase font-bold shrink-0">Captured IPs:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {capturedIps.slice(0, 8).map((ip) => (
              <button
                key={ip}
                onClick={() => onSelectIp && onSelectIp(ip)}
                className={`px-2 py-0.5 rounded-md border text-[10px] font-bold transition-colors shrink-0 ${
                  selectedIp === ip
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {ip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {!selectedIp ? (
        <div className="p-8 flex-1 flex flex-col items-center justify-center text-center font-mono space-y-4">
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/20">
            <Sparkles size={36} className="animate-pulse" />
          </div>
          <div className="space-y-2 max-w-sm">
            <h3 className="font-extrabold text-sm tracking-wide text-white uppercase text-glow-cyan">
              Select or Enter Attacker IP
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose an IP from the chips above or click "Simulate Ingress" to generate live attack telemetry for GOC AI Agent classification.
            </p>
          </div>
          <button
            onClick={triggerSimulate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-colors cursor-pointer"
          >
            <Zap size={14} className="text-amber-300 animate-bounce" />
            <span>Simulate Ingress Attack Event</span>
          </button>
        </div>
      ) : (
        <div className="p-4 flex-1 overflow-y-auto space-y-4 max-h-[640px]">
          {/* Target IP Banner */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold">Target Attacker IP:</span>
              <span className="text-cyan-300 font-extrabold text-sm">{selectedIp}</span>
              {onInspectIp && (
                <button
                  type="button"
                  onClick={() => onInspectIp(selectedIp)}
                  className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)] ml-2"
                >
                  🌐 Inspect Full IP Intelligence
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold">
                ACTIVE TELEMETRY
              </span>
              <button
                type="button"
                onClick={() => onSelectIp && onSelectIp(null)}
                title="Clear Focus IP — return to Global SOC context"
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-950/40 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/60 text-red-400 hover:text-red-300 text-[10px] font-bold transition-all duration-200 group"
              >
                <X size={10} className="group-hover:rotate-90 transition-transform duration-200" />
                Remove IP
              </button>
            </div>
          </div>

          {/* Captured IP intelligence */}
          <div className="rounded-xl bg-slate-950/70 border border-white/10 overflow-hidden font-mono">
            <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
              <span className="text-[10px] font-extrabold tracking-wider text-cyan-400 uppercase">Captured IP Intelligence</span>
              <span className={`text-[10px] font-bold ${targetLogs.length ? 'text-emerald-400' : 'text-amber-400'}`}>
                {targetLogs.length ? `${targetLogs.length} OBSERVED EVENT${targetLogs.length === 1 ? '' : 'S'}` : 'NO CAPTURED TELEMETRY'}
              </span>
            </div>
            {targetLogs.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
                <div className="bg-slate-950/80 p-3"><span className="block text-[9px] text-slate-500 uppercase">Country / Source</span><span className="text-xs text-slate-200">{newestEvent?.country || 'Unknown'} {newestEvent?.country_code ? `(${newestEvent.country_code})` : ''}</span></div>
                <div className="bg-slate-950/80 p-3"><span className="block text-[9px] text-slate-500 uppercase">Services / Ports</span><span className="text-xs text-slate-200">{targetedServices.join(', ') || 'Unknown'} · {targetedPorts.join(', ') || '—'}</span></div>
                <div className="bg-slate-950/80 p-3"><span className="block text-[9px] text-slate-500 uppercase">Latest Threat</span><span className="text-xs text-amber-300">{newestEvent?.attack_type || 'Unknown'} · {(newestEvent?.severity || 'unknown').toUpperCase()}</span></div>
                <div className="bg-slate-950/80 p-3"><span className="block text-[9px] text-slate-500 uppercase">CVSS / Confidence</span><span className="text-xs text-slate-200">{newestEvent?.cvss_score ?? '—'} / {newestEvent?.confidence != null ? `${Math.round(newestEvent.confidence * 100)}%` : '—'}</span></div>
                <div className="bg-slate-950/80 p-3"><span className="block text-[9px] text-slate-500 uppercase">First Seen</span><span className="text-[10px] text-slate-300">{formatTimestamp(oldestEvent?.timestamp)}</span></div>
                <div className="bg-slate-950/80 p-3"><span className="block text-[9px] text-slate-500 uppercase">Last Seen</span><span className="text-[10px] text-slate-300">{formatTimestamp(newestEvent?.timestamp)}</span></div>
              </div>
            ) : (
              <p className="px-3 py-3 text-[11px] text-slate-400">This IP has not been captured by the honeypot yet. The advisor can provide a watchlist recommendation, but no location or attack history is available.</p>
            )}
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs font-mono text-cyan-400 animate-pulse space-y-2">
              <Sparkles size={24} className="mx-auto text-cyan-400 animate-spin" />
              <p>Executing GOC AI Agent threat classification & mitigation synthesis...</p>
            </div>
          ) : (
            <>
              {/* Mitigation Badges Header */}
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Threat Classification</span>
                  <span className="text-cyan-400 font-bold">{advisorData?.threat_classification || 'Automated Botnet'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Confidence & Severity</span>
                  <span className="text-amber-400 font-bold">
                    {advisorData?.confidence || '90%'} · {advisorData?.severity || 'High'}
                  </span>
                </div>
              </div>

              {/* Recommendation */}
              <div className="space-y-1 font-mono text-xs">
                <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400 block">
                  SOC Recommendation
                </span>
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold">
                  {advisorData?.recommendation || `BLOCK - Attacker IP ${selectedIp} engaged in active brute-force probes.`}
                </div>
              </div>

              {/* Attacker Behavioral Intent */}
              <div className="space-y-1 font-mono text-xs">
                <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400 block">
                  Attacker Behavioral Intent
                </span>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-slate-300 leading-relaxed text-[11px]">
                  {advisorData?.intent || advisorData?.intent_analysis || `Traffic from ${selectedIp} represents automated scan and probe attempts targeting honeypot subsystems.`}
                </div>
              </div>

              {/* Firewall Rules: IPTables & UFW */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400">
                    Perimeter Firewall Rules Syntax
                  </span>
                  <button
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
                    onClick={copyFirewallRule}
                  >
                    {copiedRule ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedRule ? 'Copied' : 'Copy IPTables'}</span>
                  </button>
                </div>
                <div className="space-y-1.5">
                  <div className="bg-slate-950 border border-cyan-500/30 rounded-xl p-2.5">
                    <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">IPTables Rule:</span>
                    <code className="text-cyan-300 text-xs font-mono select-all">
                      {advisorData?.firewall_rule_iptables || advisorData?.firewall_rule || `iptables -A INPUT -s ${selectedIp} -j DROP`}
                    </code>
                  </div>
                  <div className="bg-slate-950 border border-white/10 rounded-xl p-2.5">
                    <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">UFW Rule:</span>
                    <code className="text-emerald-300 text-xs font-mono select-all">
                      {advisorData?.firewall_rule_ufw || `ufw deny from ${selectedIp}`}
                    </code>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 font-mono">
                <button
                  className="btn-cyber btn-cyber-danger flex-1 text-xs py-2"
                  onClick={() => onBlockIp && onBlockIp(selectedIp)}
                >
                  <Shield size={14} />
                  <span>Block Attacker IP</span>
                </button>
                <button
                  className="btn-cyber btn-cyber-secondary flex-1 text-xs py-2"
                  onClick={copyFirewallRule}
                >
                  <Copy size={14} />
                  <span>Copy Rule</span>
                </button>
              </div>

              {/* Interactive Chat Console */}
              <div className="pt-3 border-t border-white/10 space-y-2 font-mono text-xs">
                <span className="font-extrabold text-[11px] uppercase tracking-wider text-cyan-400 block">
                  Interactive SOC Analyst Chat
                </span>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl text-xs ${
                        msg.role === 'user'
                          ? 'ml-6 bg-cyan-950/40 border border-cyan-500/30 text-cyan-100'
                          : 'mr-4 bg-slate-900/80 border border-white/10 text-slate-200'
                      }`}
                    >
                      {msg.content}
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="text-xs py-1 text-cyan-400 animate-pulse italic">
                      GOC AI Agent is formulating response...
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendChat} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder={`Ask GOC AI Agent about ${selectedIp}...`}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-white/10 text-slate-100 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500/50 font-mono"
                  />
                  <button
                    type="submit"
                    className="btn-cyber btn-cyber-primary py-2 px-3"
                    disabled={chatLoading}
                  >
                    <Send size={12} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
