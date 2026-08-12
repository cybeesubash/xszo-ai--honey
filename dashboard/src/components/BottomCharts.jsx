import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { fetchTimeline } from '../lib/api';

const ATTACK_TYPE_COLORS = ['#3B82F6', '#06B6D4', '#8B5CF6', '#F97316', '#10B981'];

export default function BottomCharts({ stats, logs = [] }) {
  const [timelineData, setTimelineData] = useState([]);

  // Load timeline data
  useEffect(() => {
    async function loadTimeline() {
      const data = await fetchTimeline(24);
      if (data && data.length > 0) {
        setTimelineData(data.map(item => ({
          ...item,
          formattedTime: new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
      } else {
        const emptyTimeline = Array.from({ length: 24 }).map((_, i) => ({
          formattedTime: `${String(i).padStart(2, '0')}:00`,
          total: 0
        }));
        setTimelineData(emptyTimeline);
      }
    }
    loadTimeline();
    const iv = setInterval(loadTimeline, 30000);
    return () => clearInterval(iv);
  }, []);

  // Format Donut Chart Data (Attack Types)
  const getDonutData = () => {
    const rawBreakdown = stats?.attack_type_breakdown;
    if (rawBreakdown && Object.keys(rawBreakdown).length > 0) {
      return Object.entries(rawBreakdown).map(([key, val]) => ({
        name: key.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
        value: val
      })).slice(0, 5);
    }
    return [];
  };

  const donutData = getDonutData();
  const totalDonutValue = donutData.reduce((acc, curr) => acc + curr.value, 0);

  // Format Top Targeted Ports Data
  const getPortsData = () => {
    // Parse from logs dynamically
    const counts = {};
    logs.forEach(log => {
      const p = log.port || (log.service?.toLowerCase() === 'ssh' ? 22 : log.service?.toLowerCase() === 'telnet' ? 23 : 80);
      const s = log.service || 'HTTP';
      const key = `${p} (${s.toUpperCase()})`;
      counts[key] = (counts[key] || 0) + 1;
    });

    const parsed = Object.entries(counts).map(([name, val]) => ({
      name,
      count: val
    })).sort((a, b) => b.count - a.count);

    return parsed.slice(0, 6);
  };

  const portsData = getPortsData();
  const maxPortCount = Math.max(...portsData.map(p => p.count), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 1. Attacks Over Time Area Chart */}
      <div className="rounded-2xl border border-white/5 bg-[#0B1220] p-4 flex flex-col h-[280px]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-extrabold text-xs tracking-wider uppercase text-white font-mono">
            ATTACKS OVER TIME
          </h2>
          <span className="font-mono text-[9px] text-slate-400 border border-white/5 px-2 py-0.5 rounded">
            Last 24 Hours
          </span>
        </div>

        <div className="flex-1 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="formattedTime"
                stroke="#475569"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => val.split(':')[0] + 'h'}
              />
              <YAxis
                stroke="#475569"
                fontSize={9}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#0B1220',
                  borderColor: 'rgba(255,255,255,0.1)',
                  fontSize: 10,
                  color: '#FFF',
                  fontFamily: 'monospace'
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#EF4444"
                fill="url(#areaGlow)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Attack Types Donut Chart */}
      <div className="rounded-2xl border border-white/5 bg-[#0B1220] p-4 flex flex-col h-[280px]">
        <div className="mb-2">
          <h2 className="font-extrabold text-xs tracking-wider uppercase text-white font-mono">
            ATTACK TYPES
          </h2>
        </div>

        <div className="flex-1 flex items-center justify-between relative">
          <div className="w-1/2 h-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ATTACK_TYPE_COLORS[index % ATTACK_TYPE_COLORS.length]} stroke="rgba(255,255,255,0.02)" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Absolute center text overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
              <span className="text-sm font-extrabold text-white">
                {totalDonutValue.toLocaleString()}
              </span>
              <span className="text-[8px] text-slate-500 font-bold">Total</span>
            </div>
          </div>

          {/* Right side legend list */}
          <div className="w-1/2 space-y-2 pl-3">
            {donutData.map((item, idx) => {
              const pct = ((item.value / totalDonutValue) * 100).toFixed(1);
              return (
                <div key={idx} className="flex items-center justify-between font-mono text-[10px]">
                  <div className="flex items-center gap-1.5 truncate max-w-[80px]">
                    <span 
                      className="w-1.5 h-1.5 rounded-full shrink-0" 
                      style={{ backgroundColor: ATTACK_TYPE_COLORS[idx % ATTACK_TYPE_COLORS.length] }} 
                    />
                    <span className="text-slate-400 truncate">{item.name}</span>
                  </div>
                  <span className="text-white font-bold">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Top Targeted Ports Bar Chart */}
      <div className="rounded-2xl border border-white/5 bg-[#0B1220] p-4 flex flex-col h-[280px] justify-between">
        <div className="mb-3">
          <h2 className="font-extrabold text-xs tracking-wider uppercase text-white font-mono">
            TOP TARGETED PORTS
          </h2>
        </div>

        <div className="space-y-3 flex-1 flex flex-col justify-center">
          {portsData.map((port, idx) => {
            const pct = Math.round((port.count / maxPortCount) * 100);
            const percentageText = port.percentage || `${Math.round((port.count / (stats?.total_events || totalDonutValue)) * 100)}%`;
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[10px] font-bold">
                  <span className="text-slate-400">{port.name}</span>
                  <span className="text-white">{percentageText}</span>
                </div>
                <div className="w-full bg-[#050811] h-1.5 rounded-full overflow-hidden border border-white/[0.02]">
                  <div
                    className="bg-gradient-to-r from-red-600 to-rose-500 h-full rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
