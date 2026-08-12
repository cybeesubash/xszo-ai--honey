import React, { useState } from 'react';
import { Terminal, CheckCircle2, AlertCircle, KeyRound, Copy, Check } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ApiDocsView({ backendOk }) {
  const [apiKey, setApiKey] = useState('');
  const [copied, setCopied] = useState(false);

  const generateApiKey = () => {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    setApiKey(`xszo_${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`);
    setCopied(false);
  };

  const copyApiKey = async () => {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const endpoints = [
    { method: 'GET', path: '/health', desc: 'System health check and connected AI model status' },
    { method: 'GET', path: '/stats', desc: 'Aggregated threat statistics, CVSS metrics, top IPs and countries' },
    { method: 'GET', path: '/logs', desc: 'Fetch recent attack logs (query param: ?limit=150)' },
    { method: 'POST', path: '/api/event', desc: 'Ingest ESP32 telemetry (Authorization: Bearer <API_KEY>)' },
    { method: 'GET', path: '/devices', desc: 'List registered ESP32 honeypot hardware devices' },
    { method: 'GET', path: '/api/advisor/{ip}', desc: 'Get GOC AI Agent defensive analysis & firewall rule for an IP' },
    { method: 'POST', path: '/api/advisor/{ip}/chat', desc: 'Chat with GOC AI Agent grounded on specific IP interaction history' },
    { method: 'POST', path: '/api/chat', desc: 'Global SOC AI chat endpoint for general threat inquiries' },
    { method: 'GET', path: '/ws/live', desc: 'WebSocket live attack telemetry stream' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <Terminal size={16} className="text-cyan-400" /> Fast-API OpenAPI Specifications & Docs
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Interactive REST API reference, schemas, and live test console for FastAPI backend on port 8000
          </p>
        </div>

      </div>

      {/* Backend Connection Status Banner */}
      <div className={`p-4 rounded-xl border font-mono text-xs flex items-center justify-between ${
        backendOk ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/5 border-amber-500/20 text-amber-400'
      }`}>
        <div className="flex items-center gap-2">
          {backendOk ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>
            {backendOk
              ? `FastAPI Server is ONLINE at ${API_BASE}`
              : `FastAPI Server is OFFLINE. Start backend with: cd backend && python main.py`}
          </span>
        </div>
        <span className="text-[10px] text-slate-500">Port 8000</span>
      </div>

      {/* Device API key provisioning */}
      <section className="card-glass border border-cyan-500/20 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <KeyRound size={14} className="text-cyan-400" /> ESP32 Device API Key
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Generate a strong shared key, save it in the backend, then use the exact same key in the ESP32 setup portal.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={generateApiKey} className="px-3 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold transition-colors">
            Generate API Key
          </button>
          {apiKey && (
            <div className="flex flex-1 items-center gap-2 min-w-0 rounded-lg bg-slate-950 border border-white/10 px-3 py-2">
              <code className="flex-1 min-w-0 truncate text-cyan-200 font-mono text-xs select-all">{apiKey}</code>
              <button onClick={copyApiKey} title="Copy API key" className="text-slate-400 hover:text-white shrink-0">
                {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
              </button>
            </div>
          )}
        </div>

        <ol className="list-decimal list-inside space-y-1 text-xs text-slate-400 leading-relaxed">
          <li>Copy the generated key into <code className="text-cyan-300">backend/.env</code>: <code className="text-cyan-300">HONEYPOT_API_KEY=your_key</code>.</li>
          <li>Restart the backend, then paste the same key into the ESP32 <strong className="text-slate-200">API Key</strong> setup field.</li>
          <li>For device requests, send <code className="text-cyan-300">Authorization: Bearer your_key</code>.</li>
        </ol>
      </section>

      {/* REST API Endpoints Quick Reference Table */}
      <div className="card-glass border border-white/10 rounded-2xl p-5 space-y-4">
        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Terminal size={14} className="text-cyan-400" /> Core REST API Endpoints Reference
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="text-left px-3 py-2">Method</th>
                <th className="text-left px-3 py-2">Endpoint</th>
                <th className="text-left px-3 py-2">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {endpoints.map((ep, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02]">
                  <td className="px-3 py-2.5 font-bold">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      ep.method === 'GET'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        : ep.method === 'POST'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                    }`}>
                      {ep.method}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-cyan-300 font-bold">{ep.path}</td>
                  <td className="px-3 py-2.5 text-slate-400">{ep.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
