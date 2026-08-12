import React, { useEffect, useState } from 'react';
import { Shield, Globe, AlertTriangle, Zap, Layers } from 'lucide-react';
import { severityBadgeClass } from '../lib/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ThreatIntelPanel({ stats, logs, onSelectIp, onInspectIp }) {
  const [campaign, setCampaign] = useState(null);

  useEffect(() => {
    async function loadCampaign() {
      try {
        const res = await fetch(`${API_BASE}/api/campaigns`);
        if (res.ok) {
          const data = await res.json();
          setCampaign(data);
        }
      } catch { /* noop */ }
    }
    loadCampaign();
  }, [logs]);

  const topIps = stats?.top_attacker_ips || [];
  const topCountries = stats?.top_countries || [];
  const types = stats?.attack_type_breakdown || {};
  const recentCritical = logs.filter((l) => ['high', 'critical'].includes(l.severity?.toLowerCase())).slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <Shield size={16} className="text-cyan-400" /> Threat Intelligence & Campaign Correlation
        </h2>
        <p className="text-xs text-slate-500 mt-1">GOC AI Agent multi-IP correlation and botnet campaign tracking</p>
      </div>

      {/* Campaign Correlation Alert Card */}
      {campaign?.is_coordinated ? (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-xs space-y-2 shadow-lg shadow-rose-500/10 animate-pulse">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Zap size={14} className="text-amber-400" /> Coordinated Botnet Campaign Detected
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
              CRITICAL ALERT
            </span>
          </div>
          <p className="text-slate-200 text-[11px] leading-relaxed">
            {campaign.summary}
          </p>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Participating IPs:</span>
            <div className="flex flex-wrap gap-1">
              {campaign.participating_ips?.map((ip) => (
                <button key={ip} onClick={() => onSelectIp(ip)} className="px-2 py-0.5 rounded bg-slate-900 text-cyan-400 hover:underline border border-cyan-500/30 text-[10px] font-bold">
                  {ip}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/10 text-slate-400 font-mono text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-cyan-400" />
            <span>Campaign Correlation Status: <strong className="text-emerald-400">Normal</strong></span>
          </div>
          <span className="text-[10px] text-slate-500">Monitoring multi-IP vectors</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-glass p-4 border border-white/10">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase mb-3">Top Attacker IPs</h3>
          {topIps.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono">No data — simulate an attack to populate</p>
          ) : (
            <ul className="space-y-2">
              {topIps.map((row) => (
                <li key={row.ip} className="flex justify-between items-center text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <button className="text-cyan-400 hover:underline font-bold" onClick={() => onSelectIp(row.ip)}>
                      {row.ip}
                    </button>
                    {onInspectIp && (
                      <button
                        onClick={() => onInspectIp(row.ip)}
                        className="px-1.5 py-0.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold"
                        title="View Full IPinfo Intelligence"
                      >
                        Intel 🌐
                      </button>
                    )}
                  </div>
                  <span className="text-slate-500">{row.country || '—'} · {row.count} hits</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-glass p-4 border border-white/10">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase mb-3 flex items-center gap-1">
            <Globe size={12} /> Top Countries
          </h3>
          {topCountries.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono">No geolocation data yet</p>
          ) : (
            <ul className="space-y-2">
              {topCountries.map((c) => (
                <li key={c.code + c.country} className="flex justify-between text-xs font-mono">
                  <span className="text-slate-200">{c.country} ({c.code})</span>
                  <span className="text-slate-500">{c.count} events</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-glass p-4 border border-white/10">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase mb-3">Attack Types</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(types).length === 0 ? (
              <p className="text-xs text-slate-500 font-mono">No classifications yet</p>
            ) : (
              Object.entries(types).map(([type, count]) => (
                <span key={type} className="badge badge-medium">{type.replace(/_/g, ' ')}: {count}</span>
              ))
            )}
          </div>
        </div>

        <div className="card-glass p-4 border border-white/10">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase mb-3 flex items-center gap-1">
            <AlertTriangle size={12} className="text-rose-400" /> High / Critical Events
          </h3>
          {recentCritical.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono">No high-severity events</p>
          ) : (
            <ul className="space-y-2">
              {recentCritical.map((l) => (
                <li key={l.id} className="flex justify-between items-center text-xs font-mono">
                  <button className="text-cyan-400 hover:underline" onClick={() => onSelectIp(l.ip)}>{l.ip}</button>
                  <span className={severityBadgeClass(l.severity)}>{l.severity}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
