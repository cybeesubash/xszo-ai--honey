import { Server, Wifi, WifiOff, Cpu, Clock } from 'lucide-react';

function formatUptime(sec) {
  if (!sec) return '—';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function DevicesPanel({ devices }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Honeypot Devices</h2>
        <p className="text-xs text-slate-500 mt-1">ESP32 sensors registered with CYBER-EYE backend</p>
      </div>

      {devices.length === 0 ? (
        <div className="card-glass p-8 text-center border border-white/10">
          <Server size={32} className="mx-auto text-slate-600 mb-3" />
          <p className="text-sm text-slate-400 font-mono">No devices registered yet</p>
          <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
            Flash ESP32 firmware and configure WiFi + backend URL via the HoneyBot_Setup portal.
            Devices auto-register on boot.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {devices.map((d) => (
            <div key={d.device_id} className="card-glass p-4 border border-white/10 flex flex-wrap gap-4 items-start">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${d.online ? 'bg-emerald-500/10' : 'bg-slate-800'}`}>
                  {d.online ? <Wifi size={18} className="text-emerald-400" /> : <WifiOff size={18} className="text-slate-500" />}
                </div>
                <div>
                  <p className="font-mono text-sm text-white font-bold">{d.device_id}</p>
                  <p className="text-xs text-slate-500">{d.hostname || 'cyber-eye-honeypot'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 ml-auto">
                <span className={d.online ? 'text-emerald-400' : 'text-rose-400'}>
                  {d.online ? '● ONLINE' : '● OFFLINE'}
                </span>
                <span>IP: <span className="text-slate-200">{d.ip || '—'}</span></span>
                <span>FW: <span className="text-slate-200">{d.firmware_version || '—'}</span></span>
                <span className="flex items-center gap-1"><Cpu size={12} /> Heap: {d.free_heap ?? '—'}</span>
                <span>RSSI: {d.wifi_rssi ?? '—'} dBm</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {formatUptime(d.uptime_sec)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
