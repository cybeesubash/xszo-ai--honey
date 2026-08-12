import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { fetchTimeline } from '../lib/api';

const COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

export default function SeverityChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchTimeline(24).then(setData);
    const iv = setInterval(() => fetchTimeline(24).then(setData), 60000);
    return () => clearInterval(iv);
  }, []);

  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }));

  return (
    <div className="panel p-4">
      <h3 className="text-sm font-medium text-slate-200 flex items-center gap-2 mb-3">
        <TrendingUp size={14} className="text-slate-500" />
        Severity Trend (24h)
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={formatted}>
          <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} width={30} />
          <Tooltip contentStyle={{ background: '#111827', border: '1px solid #334155', fontSize: 11 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {Object.entries(COLORS).map(([key, color]) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId="1"
              stroke={color}
              fill={color}
              fillOpacity={0.3}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
