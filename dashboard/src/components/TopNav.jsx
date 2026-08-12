import React, { useState } from 'react';
import {
  ShieldAlert, Search, Bell, Settings, User,
  Activity, Cpu, Database, Radio, Bot,
  Moon, X
} from 'lucide-react';

export default function TopNav({ wsConnected, backendConnected, logsCount }) {
  const [search, setSearch] = useState('');
  const [showNotif, setShowNotif] = useState(false);

  const connNodes = [
    { label: 'Backend',   ok: backendConnected, icon: Activity },
    { label: 'ESP32',     ok: true,             icon: Cpu },
    { label: 'GOC AI Agent', ok: true,          icon: Bot },
    { label: 'Database',  ok: true,             icon: Database },
    { label: 'WebSocket', ok: wsConnected,       icon: Radio },
  ];

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(7,11,20,0.95)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid #1F2937',
      padding: '0 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 58, gap: 16
    }}>
      {/* ── Left: Logo + Status ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: '#2563EB',
            borderRadius: 6, padding: '7px 9px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ShieldAlert size={18} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{
                fontWeight: 800, fontSize: 16, color: '#F9FAFB'
              }}>CYBER-EYE</span>
              <span style={{
                fontSize: 10, fontFamily: 'Fira Code,monospace', fontWeight: 700,
                background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.4)',
                borderRadius: 4, padding: '1px 6px', color: '#93C5FD'
              }}>v2.4-GEMINI</span>
            </div>
            <div style={{ fontSize: 10.5, color: '#94A3B8', fontWeight: 500 }}>
              ESP32 AI Honeypot SOC Operations
            </div>
          </div>
        </div>

        {/* Connection Nodes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {connNodes.map((n, i) => {
            const Icon = n.icon;
            return (
              <div key={i} title={`${n.label}: ${n.ok ? 'Online' : 'Offline'}`} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 20,
                background: 'rgba(15,23,42,0.8)',
                border: `1px solid ${n.ok ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                fontSize: 10.5, fontFamily: 'Fira Code,monospace'
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: n.ok ? '#10B981' : '#EF4444',
                  boxShadow: `0 0 8px ${n.ok ? '#10B981' : '#EF4444'}`,
                  display: 'inline-block', flexShrink: 0
                }} />
                <Icon size={12} color="#94A3B8" />
                <span style={{ color: '#CBD5E1', fontWeight: 600 }}>{n.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right: Search + Controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={13} color="#475569" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search IP, CVE, Port, Country..."
            className="soc-input"
            style={{ paddingLeft: 28, paddingRight: 32, width: 240 }}
          />
          <span style={{
            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
            fontSize: 10, color: '#475569', fontFamily: 'Fira Code,monospace',
            border: '1px solid #374151', borderRadius: 4, padding: '0 4px'
          }}>⌘K</span>
        </div>

        {/* Theme */}
        <button className="btn-ghost" style={{ padding: '6px 8px', borderRadius: 8 }} title="Theme">
          <Moon size={15} color="#94A3B8" />
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button className="btn-ghost" style={{ padding: '5px 8px', borderRadius: 8 }} onClick={() => setShowNotif(v => !v)}>
            <Bell size={15} color="#94A3B8" />
            {logsCount > 0 && (
              <span style={{
                position: 'absolute', top: -5, right: -5,
                background: '#EF4444', color: '#fff',
                borderRadius: '50%', width: 17, height: 17,
                fontSize: 9, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #0B1220'
              }}>{logsCount > 9 ? '9+' : logsCount}</span>
            )}
          </button>

          {showNotif && (
            <div className="cyber-glass animate-slide-up" style={{
              position: 'absolute', right: 0, top: 44, width: 300, zIndex: 99, padding: 16
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 12, color: '#E5E7EB' }}>SOC Notifications</span>
                <button onClick={() => setShowNotif(false)} style={{ color: '#64748B', cursor: 'pointer', background: 'none', border: 'none' }}><X size={14} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ padding: '8px 10px', borderRadius: 8, background: 'rgba(127,29,29,0.3)', border: '1px solid rgba(239,68,68,0.3)', fontSize: 11 }}>
                  <div style={{ color: '#FCA5A5', fontWeight: 700, marginBottom: 3 }}>⚠ Critical Threat Active</div>
                  <div style={{ color: '#94A3B8' }}>Multiple brute-force attempts on Port 22 from Tor exit node detected.</div>
                </div>
                <div style={{ padding: '8px 10px', borderRadius: 8, background: 'rgba(30,58,138,0.3)', border: '1px solid rgba(59,130,246,0.3)', fontSize: 11 }}>
                  <div style={{ color: '#93C5FD', fontWeight: 700, marginBottom: 3 }}>🤖 Gemini AI Analysis Ready</div>
                  <div style={{ color: '#94A3B8' }}>Google Gemini AI generated Sigma, YARA and IPTables rules for the payload.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <button className="btn-ghost" style={{ padding: '6px 8px', borderRadius: 8 }} title="Settings">
          <Settings size={15} color="#94A3B8" />
        </button>

        {/* Profile */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          paddingLeft: 12, borderLeft: '1px solid #1F2937'
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg,#06B6D4,#3B82F6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(6,182,212,0.35)'
          }}>
            <User size={16} color="#fff" />
          </div>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#E5E7EB' }}>Security Analyst</div>
            <div style={{ fontSize: 10, color: '#10B981', fontFamily: 'Fira Code,monospace' }}>Tier-3 SOC Lead</div>
          </div>
        </div>
      </div>
    </header>
  );
}
