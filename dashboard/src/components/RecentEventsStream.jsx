import React from 'react';
import { Activity, KeyRound, Globe, Terminal, Wifi } from 'lucide-react';

export default function RecentEventsStream({ logs = [] }) {
  const displayLogs = logs.slice(0, 6);

  const getServiceIcon = (service) => {
    switch (service) {
      case 'SSH': return <KeyRound size={14} color="#38BDF8" />;
      case 'HTTP': return <Globe size={14} color="#60A5FA" />;
      case 'Telnet': return <Terminal size={14} color="#F87171" />;
      case 'MQTT': return <Wifi size={14} color="#34D399" />;
      default: return <Activity size={14} color="#C4B5FD" />;
    }
  };

  return (
    <div className="cyber-glass" style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={16} color="#34D399" className="animate-pulse-dot" />
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#F9FAFB' }}>Live Ingress Ticker</h3>
        </div>
        <span style={{ fontSize: 10, color: '#34D399', fontFamily: 'Fira Code,monospace', fontWeight: 700, marginLeft: 'auto' }}>
          STREAMING
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }}>
        {displayLogs.map((log, idx) => (
          <div key={log.id || idx} style={{
            padding: '8px 10px', borderRadius: 8,
            background: 'rgba(15,23,42,0.8)', border: '1px solid #1F2937',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
              <div style={{ padding: 5, borderRadius: 6, background: '#0F172A', border: '1px solid #1F2937', display: 'flex', alignItems: 'center' }}>
                {getServiceIcon(log.service)}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 700, fontSize: 11, color: '#E5E7EB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span style={{ marginRight: 4 }}>{log.flag || '🌐'}</span>{log.attack_type || 'Ingress Alert'}
                </div>
                <div style={{ fontSize: 10, color: '#64748B', fontFamily: 'Fira Code,monospace' }}>
                  {log.src_ip} ➔ Port {log.port || 80}
                </div>
              </div>
            </div>

            <span className={`badge ${
              log.severity === 'CRITICAL' ? 'badge-critical' :
              log.severity === 'HIGH' ? 'badge-high' : 'badge-low'
            }`}>
              {log.severity || 'MED'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
