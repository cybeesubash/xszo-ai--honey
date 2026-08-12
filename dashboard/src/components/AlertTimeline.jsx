import React from 'react';
import { formatTime } from '../lib/api';
import { ShieldAlert, ExternalLink } from 'lucide-react';

export default function AlertTimeline({ logs, onSelectIp }) {
  const recentLogs = logs.slice(0, 8);

  return (
    <div className="card-glass p-5 flex flex-col border border-white/10 shadow-2xl min-h-[280px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-rose-400" />
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-white font-mono text-glow-cyan">
            Recent Critical & High Incidents
          </h3>
        </div>
        <span className="font-mono text-[11px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-white/10">
          Real-time Feed
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 max-h-[190px]">
        {recentLogs.length === 0 ? (
          <div className="py-10 text-center font-mono text-xs text-slate-500">
            No incidents captured yet.
          </div>
        ) : (
          recentLogs.map((log) => {
            const sev = (log.severity || 'low').toLowerCase();
            return (
              <div
                key={log.id}
                onClick={() => onSelectIp(log.ip)}
                className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/40 flex items-center justify-between gap-2 cursor-pointer transition-all hover:bg-slate-900"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={`badge badge-${sev}`}>
                    {sev}
                  </span>
                  <span className="font-mono text-xs font-bold text-cyan-400 truncate">
                    {log.ip}
                  </span>
                  <span className="text-xs text-slate-200 truncate font-medium">
                    {log.attack_type || 'Probe Activity'}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-[11px] text-slate-400">
                    {formatTime(log.timestamp)}
                  </span>
                  <ExternalLink size={12} className="text-slate-500 hover:text-cyan-400" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
