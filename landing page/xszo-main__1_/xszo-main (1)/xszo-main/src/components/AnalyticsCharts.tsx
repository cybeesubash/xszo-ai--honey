import React, { useState } from 'react';
import { Activity, ShieldAlert, BarChart3, TrendingUp, RefreshCw } from 'lucide-react';

interface AnalyticsChartsProps {
  analyticsData: {
    protocols: { [key: string]: number };
    severities: { Low: number; Medium: number; High: number; Critical: number };
    ports: { [key: number]: number };
    timeline: Array<{ hour: string; count: number }>;
  } | null;
}

export default function AnalyticsCharts({ analyticsData }: AnalyticsChartsProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'protocols' | 'severity'>('timeline');

  if (!analyticsData) {
    return (
      <div className="bg-[#090b1e]/60 border border-blue-950 rounded-xl p-6 h-[280px] flex flex-col items-center justify-center text-gray-500 font-mono">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-blue-500" />
        <span>Compiling real-time analytics stream...</span>
      </div>
    );
  }

  const { protocols, severities, ports, timeline } = analyticsData;

  // Render variables
  const maxTimelineCount = Math.max(...timeline.map(t => t.count), 1);
  const totalAttacks = Object.values(protocols).reduce((a, b) => a + b, 0);

  // Protocols sorting
  const sortedProtos = Object.entries(protocols).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-[#090b1e]/60 border border-blue-950 rounded-xl p-5" id="analytics-charts-component">
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-blue-950 pb-4 mb-5" id="charts-header">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Statistical Engines</h3>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-[#040612] p-1 rounded-lg border border-blue-950 text-xs font-mono" id="charts-tab-list">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${activeTab === 'timeline' ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            Timeline (24h)
          </button>
          <button
            onClick={() => setActiveTab('protocols')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${activeTab === 'protocols' ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            Protocols
          </button>
          <button
            onClick={() => setActiveTab('severity')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${activeTab === 'severity' ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            Severity Scale
          </button>
        </div>
      </div>

      {/* CHART MODULES */}
      <div className="h-[210px]" id="chart-viewport">
        {/* 1. TIMELINE GRADIENT AREA CHART (Smooth SVG) */}
        {activeTab === 'timeline' && (
          <div className="w-full h-full flex flex-col justify-between" id="timeline-chart-panel">
            <div className="flex items-center gap-2 text-xs text-gray-400 font-mono mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Attacks Volume per Hourly Cycle</span>
            </div>
            
            {/* SVG Render Area */}
            <div className="relative flex-1 bg-[#050611] border border-blue-950/40 rounded-lg p-3 overflow-hidden flex items-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 240 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Draw Area path */}
                {(() => {
                  if (timeline.length === 0) return null;
                  const stepX = 240 / (timeline.length - 1 || 1);
                  let pathPoints = `M 0 100 `;
                  timeline.forEach((t, idx) => {
                    const x = idx * stepX;
                    const y = 100 - (t.count / maxTimelineCount) * 80;
                    pathPoints += `L ${x} ${y} `;
                  });
                  pathPoints += `L 240 100 Z`;

                  let linePoints = "";
                  timeline.forEach((t, idx) => {
                    const x = idx * stepX;
                    const y = 100 - (t.count / maxTimelineCount) * 80;
                    linePoints += (idx === 0 ? "M " : "L ") + `${x} ${y} `;
                  });

                  return (
                    <>
                      <path d={pathPoints} fill="url(#chart-area-grad)" />
                      <path d={linePoints} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
                      
                      {/* Interactive plot dots */}
                      {timeline.map((t, idx) => {
                        const x = idx * stepX;
                        const y = 100 - (t.count / maxTimelineCount) * 80;
                        return (
                          <g key={idx} className="group cursor-pointer">
                            <circle cx={x} cy={y} r="2" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="1" />
                            <circle cx={x} cy={y} r="6" fill="#3b82f6" fillOpacity="0" className="hover:fill-opacity-25" />
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between text-[8px] font-mono text-gray-500 mt-2.5 px-1">
              <span>{timeline[0]?.hour || "00h"}:00</span>
              <span>{timeline[Math.floor(timeline.length / 2)]?.hour || "12h"}:00</span>
              <span>{timeline[timeline.length - 1]?.hour || "23h"}:00</span>
            </div>
          </div>
        )}

        {/* 2. PROTOCOLS HORIZONTAL BAR GRAPH */}
        {activeTab === 'protocols' && (
          <div className="w-full h-full flex flex-col justify-center space-y-3.5" id="protocols-chart-panel">
            {sortedProtos.length === 0 ? (
              <div className="text-center font-mono text-xs text-gray-500 py-10">No protocol data recorded</div>
            ) : (
              sortedProtos.slice(0, 4).map(([proto, count], idx) => {
                const percentage = totalAttacks > 0 ? Math.round((count / totalAttacks) * 100) : 0;
                // Elegant colors matching branding
                const colors = ['bg-blue-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-purple-500'];
                const textColor = ['text-blue-400', 'text-cyan-400', 'text-indigo-400', 'text-purple-400'];

                return (
                  <div key={proto} className="space-y-1" id={`proto-bar-${proto}`}>
                    <div className="flex justify-between text-xs font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${colors[idx % colors.length]}`}></span>
                        <span className="font-bold text-gray-200">{proto}</span>
                        <span className="text-[10px] text-gray-500">Service</span>
                      </div>
                      <span className={`font-bold ${textColor[idx % textColor.length]}`}>{count} hits ({percentage}%)</span>
                    </div>
                    {/* Meter bar */}
                    <div className="w-full h-2 bg-[#050611] rounded-full overflow-hidden border border-blue-950/40">
                      <div
                        className={`h-full ${colors[idx % colors.length]} rounded-full transition-all duration-1000`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 3. SEVERITY RADIAL DISTRIBUTIONS CARD */}
        {activeTab === 'severity' && (
          <div className="w-full h-full grid grid-cols-2 md:grid-cols-4 gap-3 items-center" id="severity-chart-panel">
            {/* Critical */}
            <div className="bg-[#050611]/80 border border-red-950/40 p-3 rounded-lg text-center space-y-1 shadow-[0_0_10px_rgba(239,68,68,0.05)]">
              <span className="text-[10px] text-red-400 font-mono font-bold uppercase tracking-wider block">CRITICAL</span>
              <p className="text-2xl font-black text-white font-mono">{severities.Critical}</p>
              <div className="w-full bg-red-950/30 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-red-500 h-full transition-all duration-1000" 
                  style={{ width: `${totalAttacks > 0 ? (severities.Critical / totalAttacks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* High */}
            <div className="bg-[#050611]/80 border border-orange-950/40 p-3 rounded-lg text-center space-y-1 shadow-[0_0_10px_rgba(249,115,22,0.05)]">
              <span className="text-[10px] text-orange-400 font-mono font-bold uppercase tracking-wider block">HIGH</span>
              <p className="text-2xl font-black text-white font-mono">{severities.High}</p>
              <div className="w-full bg-orange-950/30 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-orange-500 h-full transition-all duration-1000" 
                  style={{ width: `${totalAttacks > 0 ? (severities.High / totalAttacks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Medium */}
            <div className="bg-[#050611]/80 border border-blue-950/40 p-3 rounded-lg text-center space-y-1 shadow-[0_0_10px_rgba(59,130,246,0.05)]">
              <span className="text-[10px] text-blue-400 font-mono font-bold uppercase tracking-wider block">MEDIUM</span>
              <p className="text-2xl font-black text-white font-mono">{severities.Medium}</p>
              <div className="w-full bg-blue-950/30 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-1000" 
                  style={{ width: `${totalAttacks > 0 ? (severities.Medium / totalAttacks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Low */}
            <div className="bg-[#050611]/80 border border-emerald-950/40 p-3 rounded-lg text-center space-y-1 shadow-[0_0_10px_rgba(16,185,129,0.05)]">
              <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider block">LOW</span>
              <p className="text-2xl font-black text-white font-mono">{severities.Low}</p>
              <div className="w-full bg-emerald-950/30 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-1000" 
                  style={{ width: `${totalAttacks > 0 ? (severities.Low / totalAttacks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-blue-950/50 pt-3 mt-4 flex items-center justify-between text-[10px] font-mono text-gray-500">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
          <span>Real-Time Engine Sync Active</span>
        </div>
        <span>Aggregate metrics of {totalAttacks} alerts</span>
      </div>
    </div>
  );
}
