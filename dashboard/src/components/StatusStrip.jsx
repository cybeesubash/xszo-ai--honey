import { Activity, Database, Cpu, Wifi, Radio } from 'lucide-react';

function Dot({ ok }) {
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-500' : 'bg-red-500'}`}
    />
  );
}

export default function StatusStrip({ health, wsConnected, espOnline }) {
  const items = [
    { label: 'Backend', ok: !!health, icon: Activity },
    { label: 'ESP32', ok: espOnline, icon: Cpu },
    { label: 'AI', ok: !!health?.engine, icon: Radio },
    { label: 'DB', ok: !!health, icon: Database },
    { label: 'WebSocket', ok: wsConnected, icon: Wifi },
  ];

  return (
    <div className="flex items-center gap-4 text-xs text-slate-400">
      {items.map(({ label, ok, icon: Icon }) => (
        <div key={label} className="flex items-center gap-1.5">
          <Icon size={12} className="text-slate-500" />
          <Dot ok={ok} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
