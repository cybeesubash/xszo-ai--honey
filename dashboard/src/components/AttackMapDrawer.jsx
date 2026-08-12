/**
 * AttackMapDrawer.jsx — Full-screen 3D globe threat map modal.
 * Uses <AttackMap> canvas globe + live stats sidebar.
 */
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Zap, Shield, Activity, AlertTriangle, Cpu } from 'lucide-react';
import AttackMap from './AttackMap';

const SEV_COLOR  = { critical:'#ef4444', high:'#f97316', medium:'#eab308', low:'#22c55e', sensor:'#38bdf8' };
const SEV_BG     = { critical:'rgba(239,68,68,0.12)', high:'rgba(249,115,22,0.12)', medium:'rgba(234,179,8,0.12)', low:'rgba(34,197,94,0.12)', sensor:'rgba(56,189,248,0.12)' };

export default function AttackMapDrawer({ onClose, logs = [], stats }) {
  /* top attackers by count */
  const topAttackers = useMemo(() => {
    const map = {};
    logs.forEach(l => {
      const k = l.ip;
      if (!map[k]) map[k] = { ip:l.ip, country:l.country||'Unknown', country_code:l.country_code||'XX', severity:l.severity||'low', count:0 };
      map[k].count += 1;
      const rank = { low:0,medium:1,high:2,critical:3 };
      if (rank[l.severity]>rank[map[k].severity]) map[k].severity=l.severity;
    });
    return Object.values(map).sort((a,b)=>b.count-a.count).slice(0,8);
  }, [logs]);

  const total     = logs.length;
  const critical  = logs.filter(l=>l.severity==='critical').length;
  const countries = new Set(logs.map(l=>l.country_code)).size;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity:0 }}
        animate={{ opacity:1 }}
        exit={{ opacity:0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale:0.93, y:24 }}
          animate={{ scale:1, y:0 }}
          exit={{ scale:0.93, y:24 }}
          transition={{ type:'spring', stiffness:280, damping:28 }}
          className="w-full max-w-7xl flex flex-col overflow-hidden rounded-2xl border border-cyan-500/25 shadow-2xl"
          style={{ height:'88vh', background:'#050c17' }}
          onClick={e=>e.stopPropagation()}
        >
          {/* ── Header ──────────────────────────── */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/25">
                <Globe size={18} className="text-cyan-400" style={{ animation:'spin 14s linear infinite' }} />
              </div>
              <div>
                <h2 className="font-extrabold text-sm tracking-widest text-white uppercase font-mono" style={{ textShadow:'0 0 16px #38bdf888' }}>
                  Global Threat Origin Map
                </h2>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                  3D Live Geolocation — {total} events from {countries} origin{countries !== 1 ? 's' : ''}
                </p>
              </div>
              {/* LIVE badge */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 ml-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[9px] font-extrabold font-mono text-rose-400 tracking-widest">LIVE</span>
              </div>
            </div>
            <button
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>

          {/* ── Body ────────────────────────────── */}
          <div className="flex flex-1 overflow-hidden">
            {/* Globe */}
            <div className="flex-1 relative">
              <AttackMap logs={logs} />
              {/* Corner watermark */}
              <div className="absolute bottom-4 left-4 font-mono text-[9px] text-slate-600 select-none pointer-events-none">
                CYBER-EYE SOC · 3D Threat Globe
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-64 border-l border-white/[0.05] bg-slate-900/40 flex flex-col overflow-y-auto">
              {/* Quick Stats */}
              <div className="p-4 border-b border-white/[0.05]">
                <p className="text-[9px] font-extrabold font-mono text-slate-500 uppercase tracking-widest mb-3">Live Intel</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label:'Total Events', val: total,    icon: <Activity size={12}/>,    color:'#38bdf8' },
                    { label:'Critical',     val: critical, icon: <AlertTriangle size={12}/>,color:'#ef4444' },
                    { label:'Origins',      val: countries,icon: <Globe size={12}/>,        color:'#a855f7' },
                    { label:'Devices',      val: stats?.devices_online ?? 1, icon:<Cpu size={12}/>, color:'#22c55e' },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl border border-white/[0.05] bg-slate-800/40 p-2.5 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5" style={{ color: s.color }}>
                        {s.icon}
                        <span className="text-[9px] font-mono font-bold uppercase text-slate-500">{s.label}</span>
                      </div>
                      <span className="text-lg font-extrabold font-mono" style={{ color: s.color }}>{s.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Attackers */}
              <div className="flex-1 p-4">
                <p className="text-[9px] font-extrabold font-mono text-slate-500 uppercase tracking-widest mb-3">Top Attackers</p>
                {topAttackers.length === 0 ? (
                  <div className="text-center text-slate-600 text-xs font-mono mt-8">
                    <Cpu size={24} className="mx-auto mb-2 text-cyan-500/40" />
                    No attacker data yet.<br/>Showing ESP32 sensor only.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {topAttackers.map((a, i) => (
                      <div
                        key={a.ip}
                        className="rounded-xl border p-2.5 font-mono text-[10px] flex items-start gap-2 transition-colors hover:border-white/20"
                        style={{ borderColor: SEV_COLOR[a.severity]+'44', background: SEV_BG[a.severity] }}
                      >
                        <span className="text-slate-500 w-4 shrink-0 pt-px">{i+1}.</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-200 truncate">{a.ip}</div>
                          <div className="text-slate-500 text-[9px]">{a.country}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-bold" style={{ color: SEV_COLOR[a.severity] }}>{a.count}×</div>
                          <div className="text-[8px] uppercase font-extrabold" style={{ color: SEV_COLOR[a.severity] }}>{a.severity}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="p-4 border-t border-white/[0.05]">
                <p className="text-[9px] font-extrabold font-mono text-slate-500 uppercase tracking-widest mb-2">Legend</p>
                <div className="space-y-1.5">
                  {[
                    { color:'#38bdf8', label:'ESP32 Sensor Node' },
                    { color:'#ef4444', label:'Critical Attacker' },
                    { color:'#f97316', label:'High Severity' },
                    { color:'#eab308', label:'Medium Severity' },
                    { color:'#22c55e', label:'Low / Probe' },
                  ].map(l => (
                    <div key={l.label} className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: l.color, boxShadow:`0 0 6px ${l.color}` }} />
                      {l.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Footer ──────────────────────────── */}
          <div className="px-5 py-3 border-t border-white/[0.05] bg-slate-900/60 flex items-center justify-between font-mono text-[10px] text-slate-500">
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-cyan-400" />
              <span>WebSocket telemetry active · Globe auto-rotates · Hover dots for detail</span>
            </div>
            <button
              className="px-4 py-1.5 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-colors text-[10px] font-bold"
              onClick={onClose}
            >
              Close Map
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
