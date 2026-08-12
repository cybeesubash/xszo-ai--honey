import {
  LayoutDashboard, Crosshair, Map, Cpu, Brain,
  Bell, FileText, BarChart3, ShieldAlert, Settings, Terminal
} from 'lucide-react';
import xszoBrand from '../assets/xszo-ai-brand.png';

const MENU = [
  { id: 'dashboard',  label: 'Dashboard',        icon: LayoutDashboard },
  { id: 'live',       label: 'Live Attacks',      icon: Crosshair },
  { id: 'map',        label: 'Attacks Map',       icon: Map },
  { id: 'devices',    label: 'Honeypot Devices',  icon: Cpu },
  { id: 'ai',         label: 'AI Analysis',       icon: Brain },
  { id: 'alerts',     label: 'Alerts',            icon: Bell,     badge: 12 },
  { id: 'logs',       label: 'Logs',              icon: FileText },
  { id: 'reports',    label: 'Reports',           icon: BarChart3 },
  { id: 'mitigation', label: 'Mitigation',        icon: ShieldAlert },
  { id: 'config',     label: 'Settings',          icon: Settings },
  { id: 'api_docs',   label: 'API Docs',          icon: Terminal },
];

function fmtUptime(s) {
  if (!s) return '—';
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

export default function Sidebar({ activeView, onNavigate, devices = [] }) {
  const dev = (devices && devices.length > 0) ? devices[0] : {
    device_id: 'No Device Registered',
    ip: '—',
    online: false,
    uptime_sec: 0,
    firmware_version: '—',
  };

  return (
    <aside style={{
      width: 220,
      minWidth: 220,
      background: '#07101e',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
      zIndex: 30,
    }}>
      {/* ── Brand ── */}
      <div style={{ padding: '20px 18px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* XSZO AI shield/eagle brand mark */}
          <div style={{
            width: 34, height: 34,
            borderRadius: 10,
            backgroundImage: `url(${xszoBrand})`,
            backgroundSize: '240%',
            backgroundPosition: '50% 11%',
            border: '1px solid rgba(34,211,238,0.58)',
            boxShadow: '0 0 14px rgba(34,211,238,0.28)',
            flexShrink: 0,
          }}>
          </div>
          <div>
            <div style={{
              fontSize: 12, fontWeight: 800,
              fontFamily: 'JetBrains Mono, monospace',
              color: '#F1F5F9', letterSpacing: '0.04em', lineHeight: 1,
            }}>
              XSZO AI SOC
            </div>
            <div style={{
              fontSize: 9, color: 'rgba(56,189,248,0.7)',
              fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
              marginTop: 3, letterSpacing: '0.02em',
            }}>
              Protect · Detect · Control · Assure
            </div>
          </div>
        </div>
      </div>

      {/* ── Nav Items ── */}
      <nav style={{ flex: 1, padding: '4px 10px', overflowY: 'auto' }}>
        {MENU.map(({ id, label, icon: Icon, badge }) => {
          const active = activeView === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '8px 10px',
                marginBottom: 2,
                borderRadius: 8,
                border: active ? '1px solid rgba(56,189,248,0.18)' : '1px solid transparent',
                background: active ? 'rgba(56,189,248,0.08)' : 'transparent',
                color: active ? '#38BDF8' : '#64748B',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#CBD5E1'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Icon size={14} />
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                  whiteSpace: 'nowrap',
                }}>
                  {label}
                </span>
              </div>
              {badge && (
                <span style={{
                  background: '#EF4444',
                  color: '#fff',
                  fontSize: 8, fontWeight: 900,
                  fontFamily: 'JetBrains Mono, monospace',
                  padding: '1px 5px',
                  borderRadius: 4,
                  boxShadow: '0 0 6px rgba(239,68,68,0.4)',
                }}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── ESP32 Device Card ── */}
      <div style={{ padding: '12px 12px 20px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12,
          padding: '12px 12px',
        }}>
          <div style={{
            fontSize: 8, fontWeight: 800, color: '#475569',
            fontFamily: 'JetBrains Mono, monospace',
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
          }}>
            Honeypot Device
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            {/* ESP32 Board SVG */}
            <div style={{
              width: 44, height: 56,
              background: '#1a2332',
              border: '1px solid #2d3d52',
              borderRadius: 5,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'space-between',
              padding: '4px 3px',
              flexShrink: 0, position: 'relative',
            }}>
              {/* Antenna */}
              <div style={{
                width: '80%', height: 7,
                background: 'rgba(245,158,11,0.25)',
                border: '1px solid rgba(245,158,11,0.5)',
                borderRadius: 3,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 5, color: '#F59E0B', fontFamily: 'monospace' }}>RF</span>
              </div>

              {/* MCU Chip */}
              <div style={{
                width: 20, height: 16,
                background: '#0a1220',
                border: '1px solid #374151',
                borderRadius: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 4.5, color: '#64748B', fontFamily: 'monospace', textAlign: 'center', lineHeight: 1.2 }}>ESP{'\n'}32</span>
              </div>

              {/* Bottom */}
              <div style={{ width: '80%', height: 6, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 2 }} />

              {/* Status LED */}
              <div style={{
                position: 'absolute', bottom: 4, right: 4,
                width: 5, height: 5, borderRadius: '50%',
                background: dev.online ? '#22C55E' : '#EF4444',
                boxShadow: dev.online ? '0 0 6px #22C55E' : '0 0 6px #EF4444',
              }} />

              {/* Left Pins */}
              {[0,1,2,3].map(i => (
                <div key={i} style={{
                  position: 'absolute', left: -3, top: 10 + i * 9,
                  width: 3, height: 2, background: '#F59E0B', borderRadius: 1,
                }} />
              ))}
              {/* Right Pins */}
              {[0,1,2,3].map(i => (
                <div key={i} style={{
                  position: 'absolute', right: -3, top: 10 + i * 9,
                  width: 3, height: 2, background: '#F59E0B', borderRadius: 1,
                }} />
              ))}
            </div>

            {/* Device Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 10, fontWeight: 800, color: '#E2E8F0',
                fontFamily: 'JetBrains Mono, monospace',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                marginBottom: 4,
              }}>
                {dev.device_id}
              </div>

              {/* Online badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: dev.online ? '#22C55E' : '#EF4444',
                  boxShadow: dev.online ? '0 0 5px rgba(34,197,94,0.7)' : 'none',
                  animation: dev.online ? 'pulseGreen 2s infinite' : 'none',
                }} />
                <span style={{
                  fontSize: 9, fontWeight: 800,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: dev.online ? '#4ADE80' : '#F87171',
                }}>
                  {dev.online ? '● Online' : '○ Offline'}
                </span>
              </div>

              {/* Details */}
              <div style={{
                fontSize: 8.5, fontFamily: 'JetBrains Mono, monospace',
                color: '#475569', lineHeight: 1.8,
              }}>
                <div>IP: {dev.ip}</div>
                <div>Uptime: {fmtUptime(dev.uptime_sec)}</div>
                <div>Firmware: {dev.firmware_version}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
