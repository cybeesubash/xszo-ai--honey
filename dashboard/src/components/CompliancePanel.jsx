import { FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function CompliancePanel({ stats, logs }) {
  const total = stats?.total_events || 0;
  const critical = stats?.critical_alerts || 0;
  const sev = stats?.severity_breakdown || {};
  const retention = 'SQLite — 90-day rolling (configurable)';

  const checks = [
    { label: 'Event logging active', ok: total > 0, detail: `${total} events recorded` },
    { label: 'AI classification pipeline', ok: logs.some((l) => l.attack_type), detail: 'GOC AI Agent' },
    { label: 'Critical alert tracking', ok: true, detail: `${critical} critical alerts` },
    { label: 'Attacker IP attribution', ok: (stats?.unique_ips || 0) > 0, detail: `${stats?.unique_ips || 0} unique IPs` },
    { label: 'Geolocation enrichment', ok: logs.some((l) => l.country), detail: 'ip-api.com' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <FileText size={16} className="text-cyan-400" /> Compliance Reports
        </h2>
        <p className="text-xs text-slate-500 mt-1">SOC audit summary and data retention status</p>
      </div>

      <div className="card-glass p-5 border border-white/10">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase mb-4">System Compliance Checks</h3>
        <ul className="space-y-3">
          {checks.map((c) => (
            <li key={c.label} className="flex items-center gap-3 text-xs font-mono">
              {c.ok ? (
                <CheckCircle size={14} className="text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle size={14} className="text-amber-400 shrink-0" />
              )}
              <span className="text-slate-200">{c.label}</span>
              <span className="text-slate-500 ml-auto">{c.detail}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(sev).map(([level, count]) => (
          <div key={level} className="card-glass p-4 border border-white/10 text-center">
            <p className="text-xs text-slate-500 uppercase font-mono capitalize">{level}</p>
            <p className="text-2xl font-bold text-white font-mono mt-1">{count}</p>
          </div>
        ))}
      </div>

      <div className="card-glass p-4 border border-white/10 text-xs font-mono text-slate-400">
        <p><span className="text-slate-500">Data retention:</span> {retention}</p>
        <p className="mt-1"><span className="text-slate-500">Export:</span> Use Live Feed → Export JSON per event</p>
      </div>
    </div>
  );
}
