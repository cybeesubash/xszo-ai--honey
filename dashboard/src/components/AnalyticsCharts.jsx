import React from 'react';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area
} from 'recharts';
import { PieChart as PieIcon, BarChart2, Activity, ShieldAlert } from 'lucide-react';

const SEVERITY_COLORS = {
  CRITICAL: '#EF4444',
  HIGH: '#F97316',
  MEDIUM: '#EAB308',
  LOW: '#22C55E',
};

export default function AnalyticsCharts({ stats, logs = [] }) {
  const severityData = [
    { name: 'CRITICAL', value: stats?.critical_alerts || 34, color: SEVERITY_COLORS.CRITICAL },
    { name: 'HIGH', value: stats?.high_alerts || 42, color: SEVERITY_COLORS.HIGH },
    { name: 'MEDIUM', value: stats?.medium_alerts || 51, color: SEVERITY_COLORS.MEDIUM },
    { name: 'LOW', value: stats?.low_alerts || 21, color: SEVERITY_COLORS.LOW },
  ];

  const serviceCounts = logs.reduce((acc, log) => {
    const s = log.service || 'HTTP';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, { SSH: 45, HTTP: 38, Telnet: 29, FTP: 18, MQTT: 12 });

  const serviceData = Object.entries(serviceCounts).map(([name, count]) => ({ name, count }));

  const radarData = [
    { subject: 'Brute Force', A: 120 },
    { subject: 'Port Scan', A: 98 },
    { subject: 'SQL Injection', A: 86 },
    { subject: 'Exploit Probe', A: 65 },
    { subject: 'Command Inj', A: 75 },
    { subject: 'Cred Stuffing', A: 90 },
  ];

  const trendData = [
    { hour: '00:00', attacks: 12 },
    { hour: '03:00', attacks: 18 },
    { hour: '06:00', attacks: 25 },
    { hour: '09:00', attacks: 42 },
    { hour: '12:00', attacks: 38 },
    { hour: '15:00', attacks: 55 },
    { hour: '18:00', attacks: 48 },
    { hour: '21:00', attacks: 32 },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 16
    }}>
      {/* Donut Chart */}
      <div className="cyber-glass" style={{ padding: 16, height: 260, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <PieIcon size={16} color="#F87171" />
          <span style={{ fontWeight: 700, fontSize: 13, color: '#F9FAFB' }}>Severity Breakdown</span>
        </div>
        <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={severityData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={4} dataKey="value">
                {severityData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} stroke="#0F172A" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <span style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Fira Code,monospace', color: '#FFF' }}>{stats?.total_events || 148}</span>
            <span style={{ fontSize: 10, color: '#64748B', fontFamily: 'Fira Code,monospace' }}>TOTAL</span>
          </div>
        </div>
      </div>

      {/* Target Services Bar Chart */}
      <div className="cyber-glass" style={{ padding: 16, height: 260, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <BarChart2 size={16} color="#38BDF8" />
          <span style={{ fontWeight: 700, fontSize: 13, color: '#F9FAFB' }}>Target Services</span>
        </div>
        <div style={{ flex: 1, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={serviceData} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <XAxis type="number" stroke="#64748B" fontSize={10} fontFamily="Fira Code,monospace" />
              <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={10} fontFamily="Fira Code,monospace" width={50} />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attack Vector Radar Chart */}
      <div className="cyber-glass" style={{ padding: 16, height: 260, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <ShieldAlert size={16} color="#C4B5FD" />
          <span style={{ fontWeight: 700, fontSize: 13, color: '#F9FAFB' }}>Attack Vector Matrix</span>
        </div>
        <div style={{ flex: 1, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" stroke="#94A3B8" fontSize={9} fontFamily="Fira Code,monospace" />
              <PolarRadiusAxis angle={30} domain={[0, 150]} stroke="#475569" fontSize={8} />
              <Radar name="Vectors" dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 24-Hour Activity Area Chart */}
      <div className="cyber-glass" style={{ padding: 16, height: 260, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Activity size={16} color="#34D399" />
          <span style={{ fontWeight: 700, fontSize: 13, color: '#F9FAFB' }}>24-Hour Attack Trend</span>
        </div>
        <div style={{ flex: 1, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" stroke="#64748B" fontSize={10} fontFamily="Fira Code,monospace" />
              <YAxis stroke="#64748B" fontSize={10} fontFamily="Fira Code,monospace" />
              <Tooltip />
              <Area type="monotone" dataKey="attacks" stroke="#10B981" fillOpacity={1} fill="url(#colorAttacks)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
