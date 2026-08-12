import React from 'react';
import {
  Activity, Flame, AlertTriangle, CheckCircle2,
  Globe, Globe2, Ban, BrainCircuit, ShieldAlert, Zap, TrendingUp
} from 'lucide-react';

const CARDS = [
  { title: 'Total Events',        key: 'total_events',    icon: Activity,     color: '#3B82F6', grad: 'from-blue-500 to-cyan-500',    trend: '+12.4%', up: true },
  { title: 'Critical Alerts',     key: 'critical_alerts', icon: Flame,        color: '#EF4444', grad: 'from-red-600 to-rose-500',     trend: '+18.2%', up: true },
  { title: 'Medium Alerts',       key: 'medium_alerts',   icon: AlertTriangle,color: '#EAB308', grad: 'from-amber-500 to-yellow-400', trend: '-4.1%',  up: false },
  { title: 'Low Alerts',          key: 'low_alerts',      icon: CheckCircle2, color: '#22C55E', grad: 'from-emerald-500 to-green-400',trend: '-8.5%',  up: false },
  { title: 'Unique IPs',          key: 'unique_ips',      icon: Globe,        color: '#8B5CF6', grad: 'from-purple-500 to-indigo-500',trend: '+9.3%',  up: true },
  { title: 'Countries',           key: 'countries_count', icon: Globe2,       color: '#06B6D4', grad: 'from-cyan-500 to-teal-400',   trend: '+2.0%',  up: true },
  { title: 'Blocked IPs',         key: 'blocked_ips',     icon: Ban,          color: '#F97316', grad: 'from-red-500 to-orange-500',  trend: '+15.0%', up: true },
  { title: 'AI Confidence',       key: 'avg_confidence',  icon: BrainCircuit, color: '#6366F1', grad: 'from-indigo-500 to-blue-400', trend: '+1.5%',  up: true, suffix:'%' },
  { title: 'Avg CVSS',            key: 'avg_cvss',        icon: ShieldAlert,  color: '#F43F5E', grad: 'from-rose-500 to-red-600',    trend: '+0.4',   up: true },
  { title: "Today's Events",      key: 'today_events',    icon: Zap,          color: '#10B981', grad: 'from-blue-400 to-emerald-400',trend: '+24.8%', up: true },
];

const DEFAULTS = {
  total_events:148,critical_alerts:34,medium_alerts:51,low_alerts:21,
  unique_ips:68,countries_count:19,blocked_ips:48,
  avg_confidence:94.2,avg_cvss:8.4,today_events:312
};

const SPARKLINES = [
  'M0,20 Q25,5 50,18 T100,10','M0,25 Q25,10 50,20 T100,5',
  'M0,15 Q25,22 50,12 T100,18','M0,10 Q25,15 50,5 T100,22',
  'M0,22 Q25,12 50,18 T100,8', 'M0,18 Q25,8 50,15 T100,12',
  'M0,25 Q25,18 50,8 T100,2',  'M0,15 Q25,10 50,12 T100,5',
  'M0,20 Q25,15 50,8 T100,4',  'M0,28 Q25,14 50,10 T100,4',
];

export default function MetricCards({ stats }) {
  const d = stats || DEFAULTS;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(10, 1fr)',
      gap: 10,
    }}>
      {CARDS.map((c, i) => {
        const Icon = c.icon;
        const raw = d[c.key] ?? 0;
        const val = c.suffix ? `${raw}${c.suffix}` : raw;
        return (
          <div key={i} className="cyber-glass cyber-card-top" style={{
            padding: '12px 12px 10px',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'default',
            transition: 'transform 0.2s ease',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {/* Top color bar */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 3,
              background: `linear-gradient(90deg, ${c.color}, transparent)`,
              borderRadius: '14px 14px 0 0'
            }} />

            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, lineHeight: 1.3, maxWidth: '70%' }}>{c.title}</span>
              <div style={{
                padding: 5, borderRadius: 7,
                background: `${c.color}18`,
                border: `1px solid ${c.color}35`,
                display:'flex',alignItems:'center',justifyContent:'center'
              }}>
                <Icon size={13} color={c.color} />
              </div>
            </div>

            {/* Value */}
            <div style={{ fontFamily:'Fira Code,monospace', fontWeight:900, fontSize:20, color:'#F9FAFB', lineHeight:1 }}>
              {val}
            </div>

            {/* Trend */}
            <div style={{ display:'flex', alignItems:'center', gap:3, marginTop:3 }}>
              <TrendingUp size={10} color={c.up ? '#10B981' : '#F59E0B'}
                style={{ transform: c.up ? 'none' : 'rotate(180deg)' }} />
              <span style={{ fontSize:10, fontFamily:'Fira Code,monospace', fontWeight:700,
                color: c.up ? '#10B981' : '#F59E0B' }}>{c.trend}</span>
            </div>

            {/* Sparkline */}
            <div style={{ marginTop: 8, height:20, width:'100%' }}>
              <svg viewBox="0 0 100 30" preserveAspectRatio="none" style={{ width:'100%', height:'100%' }}>
                <path d={SPARKLINES[i]} fill="none" stroke={c.color} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}
