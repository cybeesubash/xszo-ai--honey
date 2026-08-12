import React from 'react';
import { Cpu, Server, Database, Radio, Bot } from 'lucide-react';

export default function SystemHealth({ wsConnected, backendConnected }) {
  const metrics = [
    { label: 'CPU Usage', value: '24%', percentage: 24, color: 'linear-gradient(90deg,#3B82F6,#22D3EE)' },
    { label: 'RAM Memory', value: '1.2 GB / 4 GB (30%)', percentage: 30, color: 'linear-gradient(90deg,#10B981,#34D399)' },
    { label: 'API Latency', value: '18 ms', percentage: 18, color: 'linear-gradient(90deg,#8B5CF6,#C4B5FD)' },
    { label: 'Network Throughput', value: '450 KB/s', percentage: 45, color: 'linear-gradient(90deg,#F59E0B,#FBBF24)' },
  ];

  const nodes = [
    { name: 'ESP32 Sensor', icon: Cpu, status: 'ONLINE', details: 'Dual-Core 240MHz' },
    { name: 'FastAPI Backend', icon: Server, status: backendConnected ? 'ONLINE' : 'OFFLINE', details: 'Port 8000' },
    { name: 'SQLite Database', icon: Database, status: 'ONLINE', details: 'honeypot.db' },
    { name: 'GOC AI Agent', icon: Bot, status: 'ONLINE', details: 'Threat Intelligence' },
    { name: 'WebSocket Stream', icon: Radio, status: wsConnected ? 'ACTIVE' : 'RECONNECTING', details: '/ws/live' },
  ];

  return (
    <div className="cyber-glass" style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Fira Code,monospace' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Cpu size={16} color="#38BDF8" />
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#F9FAFB', fontFamily: 'Inter,sans-serif' }}>System Health</h3>
          <p style={{ fontSize: 10, color: '#64748B', fontFamily: 'Inter,sans-serif' }}>Hardware Nodes & Resource Usage</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        {nodes.map((node, idx) => {
          const Icon = node.icon;
          const isOk = node.status === 'ONLINE' || node.status === 'ACTIVE';
          return (
            <div key={idx} style={{ padding: '6px 8px', borderRadius: 6, background: '#0F172A', border: '1px solid #1F2937', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon size={14} color="#94A3B8" />
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 10.5, color: '#E5E7EB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.name}</div>
                <div style={{ fontSize: 9, color: '#64748B' }}>{node.details}</div>
              </div>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: isOk ? '#10B981' : '#EF4444', boxShadow: `0 0 6px ${isOk ? '#10B981' : '#EF4444'}`, display: 'inline-block', flexShrink: 0 }} />
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {metrics.map((m, idx) => (
          <div key={idx}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#94A3B8', marginBottom: 4 }}>
              <span>{m.label}</span>
              <span style={{ color: '#FFF', fontWeight: 700 }}>{m.value}</span>
            </div>
            <div style={{ width: '100%', height: 5, background: '#1E293B', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${m.percentage}%`, height: '100%', background: m.color, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
