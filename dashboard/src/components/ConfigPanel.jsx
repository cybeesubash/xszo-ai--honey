import { Settings, Activity, Database, Sparkles, Wifi } from 'lucide-react';

export default function ConfigPanel({ health, wsConnected, espOnline, backendOk }) {
  const rows = [
    { label: 'Backend API', value: 'http://127.0.0.1:8000', status: backendOk },
    { label: 'Dashboard', value: 'http://127.0.0.1:5173', status: true },
    { label: 'WebSocket', value: '/ws/live', status: wsConnected },
    { label: 'AI Engine', value: health?.engine || 'GOC AI Agent / Heuristic Engine', status: !!health },
    { label: 'Database', value: 'In-Memory SOC Store', status: backendOk },
    { label: 'ESP32 Honeypot', value: espOnline ? 'Connected' : 'Awaiting device', status: espOnline },
    { label: 'Telegram Alerts', value: 'High/Critical only', status: true },
    { label: 'API Auth', value: 'Bearer token (HONEYPOT_API_KEY)', status: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <Settings size={16} className="text-cyan-400" /> SOC System Config
        </h2>
        <p className="text-xs text-slate-500 mt-1">Runtime configuration and service connectivity</p>
      </div>

      <div className="card-glass border border-white/10 overflow-hidden">
        <table className="w-full text-xs font-mono">
          <thead className="bg-slate-900/80 text-slate-500 uppercase">
            <tr>
              <th className="text-left px-4 py-2 font-semibold">Component</th>
              <th className="text-left px-4 py-2 font-semibold">Value</th>
              <th className="text-left px-4 py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-slate-300">{r.label}</td>
                <td className="px-4 py-3 text-slate-400">{r.value}</td>
                <td className="px-4 py-3">
                  <span className={r.status ? 'text-emerald-400' : 'text-rose-400'}>
                    {r.status ? '● Online' : '● Offline'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-glass p-4 border border-white/10 text-xs font-mono text-slate-400 space-y-2">
        <p className="text-slate-300 font-bold uppercase tracking-wider mb-2">Quick Start Commands</p>
        <pre className="bg-slate-950 p-3 rounded-lg text-cyan-400/90 overflow-x-auto">
{`# Backend
cd backend
python main.py

# Dashboard
npm run dev`}
        </pre>
      </div>
    </div>
  );
}
