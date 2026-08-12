import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchTimeline } from '../lib/api';
import { TrendingUp } from 'lucide-react';

export default function TrendChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function loadData() {
      const res = await fetchTimeline(24);
      if (res?.length) {
        setData(res.map((item) => ({
          ...item,
          formattedTime: new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })));
      } else {
        setData([]);
      }
    }
    loadData();
    const iv = setInterval(loadData, 30000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="card-glass p-5 flex flex-col border border-white/10 shadow-2xl min-h-[280px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-cyan-400" />
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-white font-mono text-glow-cyan">
            24-Hour Attack Timeline
          </h3>
        </div>
        <span className="font-mono text-[11px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-white/10">
          Hourly Ingress
        </span>
      </div>

      <div className="flex-1 w-full min-h-[190px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center font-mono text-xs text-slate-500">
            No timeline data yet — click Simulate Attack to ingest events
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="criticalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="lowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <XAxis 
                dataKey="formattedTime" 
                stroke="#64748B" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#64748B" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(15, 23, 42, 0.95)', 
                  borderColor: 'rgba(255, 255, 255, 0.15)', 
                  borderRadius: 12, 
                  fontSize: 12,
                  color: '#F8FAFC',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                }} 
              />
              <Area type="monotone" dataKey="critical" stackId="1" stroke="#EF4444" fill="url(#criticalGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="high" stackId="1" stroke="#F97316" fill="url(#highGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="medium" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} strokeWidth={1.5} />
              <Area type="monotone" dataKey="low" stackId="1" stroke="#22C55E" fill="url(#lowGrad)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
