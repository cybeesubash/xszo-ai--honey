import { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, X } from 'lucide-react';
import { fetchAdvisor, sendChatMessage, sendGlobalChat } from '../lib/api';

// Precise, targeted questions — not broad phrases that trigger keyword-match avalanches
const STARTERS = [
  'What are the top 3 attacker IPs from recent honeypot events?',
  'Give me an iptables rule to block the most active attacker IP',
  'Which attack types are most common across all services?',
  'How do I isolate the ESP32 honeypot sensor in a DMZ?',
];

export default function AIChatView({ logs, selectedIp, onSelectIp }) {
  const [focusIp, setFocusIp] = useState(selectedIp || '');
  const [advisor, setAdvisor] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'GOC AI Agent online. Ask about threats, firewall rules, or select an attacker IP for focused analysis.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const uniqueIps = [...new Set(logs.map((l) => l.ip))].slice(0, 20);

  useEffect(() => {
    if (selectedIp) setFocusIp(selectedIp);
  }, [selectedIp]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!focusIp) {
      setAdvisor(null);
      return;
    }
    fetchAdvisor(focusIp).then(setAdvisor);
  }, [focusIp]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setLoading(true);

    let reply;
    if (focusIp) {
      const res = await sendChatMessage(focusIp, text);
      reply = res?.response;
    } else {
      const res = await sendGlobalChat(text);
      reply = res?.response;
    }

    setLoading(false);
    setMessages((m) => [
      ...m,
      {
        role: 'assistant',
        content: reply || 'Could not reach AI Analyst. Check OPENROUTER_API_KEY or GEMINI_API_KEY in backend/.env and restart the server.',
      },
    ]);
  };

  const askStarter = (q) => {
    setInput(q);
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div>
        <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <Bot size={16} className="text-cyan-400" /> XSZO AI Security Advisor
        </h2>
        <p className="text-xs text-slate-500 mt-1">XSZO AI defensive intelligence grounded in real honeypot telemetry</p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <label className="text-xs font-mono text-slate-500">Focus IP:</label>
        <select
          value={focusIp}
          onChange={(e) => {
            setFocusIp(e.target.value);
            if (e.target.value) onSelectIp(e.target.value);
          }}
          className="bg-slate-950 border border-white/10 text-xs font-mono text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500/50"
        >
          <option value="">— Global SOC context —</option>
          {uniqueIps.map((ip) => (
            <option key={ip} value={ip}>{ip}</option>
          ))}
        </select>
        {focusIp && (
          <button
            type="button"
            onClick={() => {
              setFocusIp('');
              onSelectIp(null);
            }}
            title="Remove Focus IP — return to Global SOC context"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-950/40 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/60 text-red-400 hover:text-red-300 text-[10px] font-mono font-bold transition-all duration-200 group"
          >
            <X size={10} className="group-hover:rotate-90 transition-transform duration-200" />
            Remove
          </button>
        )}
        {focusIp && advisor?.firewall_rule && (
          <code className="text-[10px] font-mono text-cyan-400 bg-slate-950 px-2 py-1 rounded border border-cyan-500/20 truncate max-w-md">
            {advisor.firewall_rule}
          </code>
        )}
      </div>

      <div className="card-glass flex-1 flex flex-col border border-white/10 min-h-[480px] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl text-xs leading-relaxed font-mono ${
                msg.role === 'user'
                  ? 'ml-8 bg-cyan-950/40 border border-cyan-500/30 text-cyan-100'
                  : 'mr-6 bg-slate-900/80 border border-white/10 text-slate-200'
              }`}
            >
              {msg.content}
            </div>
          ))}
          {loading && (
            <div className="text-xs text-cyan-400 animate-pulse font-mono flex items-center gap-2">
              <Sparkles size={12} /> Gemini is analyzing...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length <= 2 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {STARTERS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => askStarter(q)}
                className="text-[10px] font-mono px-2 py-1 rounded-lg bg-slate-900 border border-white/10 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSend} className="p-4 border-t border-white/10 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={focusIp ? `Ask about ${focusIp}...` : 'Ask the SOC AI anything...'}
            className="flex-1 bg-slate-950 border border-white/10 text-slate-100 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500/50 font-mono"
            disabled={loading}
          />
          <button type="submit" disabled={loading} className="btn-cyber btn-cyber-primary px-4">
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
