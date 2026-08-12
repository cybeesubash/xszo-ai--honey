import React, { useEffect, useState } from 'react';
import { Globe, Shield, MapPin, Zap, AlertTriangle } from 'lucide-react';
import { AttackEvent } from '../types.js';

interface CyberMapProps {
  recentAttacks: AttackEvent[];
  activeAttack: AttackEvent | null;
}

interface GeoPoint {
  name: string;
  code: string;
  x: number; // Percentage X of map width (0 - 100)
  y: number; // Percentage Y of map height (0 - 100)
}

// Map coordinate database of key geo-origins and our central Honeypots
const NATIONS: { [key: string]: GeoPoint } = {
  "RU": { name: "Russia (Moscow)", code: "RU", x: 62, y: 30 },
  "CN": { name: "China (Beijing)", code: "CN", x: 78, y: 45 },
  "DE": { name: "Germany (Berlin)", code: "DE", x: 48, y: 32 },
  "NL": { name: "Netherlands (Amsterdam)", code: "NL", x: 46, y: 30 },
  "US": { name: "United States (New York)", code: "US", x: 25, y: 38 },
  "UA": { name: "Ukraine (Kyiv)", code: "UA", x: 53, y: 33 },
  "BR": { name: "Brazil (Brasilia)", code: "BR", x: 34, y: 72 },
  "KR": { name: "South Korea (Seoul)", code: "KR", x: 82, y: 44 },
  "IR": { name: "Iran (Tehran)", code: "IR", x: 59, y: 45 },
  "KP": { name: "North Korea (Pyongyang)", code: "KP", x: 81, y: 42 }
};

// Target location representing where our honeypots are "hosted"
const TARGET_SOC: GeoPoint = { name: "CYBER-EYE SOC Ingress Gateway", code: "SOC", x: 40, y: 45 };

export default function CyberMap({ recentAttacks, activeAttack }: CyberMapProps) {
  const [liveLines, setLiveLines] = useState<Array<{ id: string; from: GeoPoint; to: GeoPoint; color: string; thickness: number; severity: string }>>([]);
  const [activeGeo, setActiveGeo] = useState<GeoPoint | null>(null);

  // Hook to draw lines from recent attacks
  useEffect(() => {
    if (recentAttacks.length === 0) return;

    // Take the last 4 attacks and construct visual laser beams
    const lines = recentAttacks.slice(0, 4).map((atk, index) => {
      const origin = NATIONS[atk.countryCode] || { name: atk.country, code: atk.countryCode, x: 20 + (index * 15) % 70, y: 25 + (index * 10) % 50 };
      
      let color = '#3b82f6'; // Blue for Medium
      if (atk.analysis?.severity === 'High') color = '#f97316'; // Orange
      if (atk.analysis?.severity === 'Critical') color = '#ef4444'; // Red
      if (atk.analysis?.severity === 'Low') color = '#10b981'; // Green

      return {
        id: atk.id,
        from: origin,
        to: TARGET_SOC,
        color,
        thickness: atk.analysis?.severity === 'Critical' ? 3 : 1.5,
        severity: atk.analysis?.severity || 'Medium'
      };
    });

    setLiveLines(lines);

    // Spotlight the absolute newest attack origin
    if (recentAttacks.length > 0) {
      const newestAtk = recentAttacks[0];
      const newestOrigin = NATIONS[newestAtk.countryCode];
      if (newestOrigin) {
        setActiveGeo(newestOrigin);
      }
    }
  }, [recentAttacks]);

  // Handle manual clicked item highlight
  useEffect(() => {
    if (activeAttack) {
      const origin = NATIONS[activeAttack.countryCode];
      if (origin) {
        setActiveGeo(origin);
      }
    }
  }, [activeAttack]);

  return (
    <div className="bg-[#090b1e]/60 border border-blue-950 rounded-xl p-5 relative overflow-hidden" id="cyber-map-container">
      {/* Visual Header */}
      <div className="flex items-center justify-between mb-4" id="map-header">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-500 animate-pulse" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Live Threat Vector Plotter</h3>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-gray-400">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>CRITICAL</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span>HIGH</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>MEDIUM</span>
          </div>
        </div>
      </div>

      {/* Stylized Visual Map Viewport */}
      <div className="relative w-full h-[280px] md:h-[320px] bg-[#050611] border border-blue-950/60 rounded-xl overflow-hidden" id="map-viewport">
        {/* Radar grids overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#0c1837_1px,transparent_1.2px)] bg-[size:1.5rem_1.5rem] opacity-30"></div>
        <div className="absolute inset-0 border border-blue-950/20 rounded-xl flex items-center justify-center pointer-events-none">
          <div className="w-[120px] h-[120px] border border-blue-950/40 rounded-full animate-pulse"></div>
          <div className="w-[240px] h-[240px] border border-blue-950/10 rounded-full absolute"></div>
        </div>

        {/* Dynamic Vector Lines and Markers Drawing */}
        <svg className="absolute inset-0 w-full h-full" id="threat-map-svg">
          <defs>
            <radialGradient id="soc-pulsate" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </radialGradient>
            
            {/* Pulsating glow for active country node */}
            <radialGradient id="active-pulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Draw laser connections */}
          {liveLines.map((line, idx) => {
            // Curving line coordinates
            const x1 = `${line.from.x}%`;
            const y1 = `${line.from.y}%`;
            const x2 = `${line.to.x}%`;
            const y2 = `${line.to.y}%`;
            
            // Calculate a control midpoint for a curved bezier path
            const ctrlX = (line.from.x + line.to.x) / 2;
            const ctrlY = Math.min(line.from.y, line.to.y) - 15; // Arc height offset
            
            const pathData = `M ${line.from.x} ${line.from.y} Q ${ctrlX} ${ctrlY} ${line.to.x} ${line.to.y}`;

            return (
              <g key={line.id + idx}>
                {/* Backing glow line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={line.color}
                  strokeWidth={line.thickness * 2.5}
                  strokeOpacity="0.25"
                  pathLength="100"
                />
                {/* Active vector line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={line.color}
                  strokeWidth={line.thickness}
                  strokeOpacity="0.8"
                  strokeDasharray="6 4"
                  pathLength="100"
                  id={`vector-line-${line.id}`}
                >
                  <animate 
                    attributeName="stroke-dashoffset" 
                    values="100;0" 
                    dur={line.severity === 'Critical' ? '2s' : '4s'} 
                    repeatCount="indefinite" 
                  />
                </path>
              </g>
            );
          })}

          {/* Central target SOC node */}
          <circle 
            cx={`${TARGET_SOC.x}%`} 
            cy={`${TARGET_SOC.y}%`} 
            r="16" 
            fill="url(#soc-pulsate)" 
            className="animate-pulse"
          />
          <circle 
            cx={`${TARGET_SOC.x}%`} 
            cy={`${TARGET_SOC.y}%`} 
            r="5" 
            fill="#3b82f6" 
            stroke="#1d4ed8" 
            strokeWidth="1.5"
          />

          {/* Country nodes plot dots */}
          {Object.values(NATIONS).map((point) => {
            const isActive = activeGeo && activeGeo.code === point.code;
            return (
              <g key={point.code} className="cursor-pointer group" onClick={() => setActiveGeo(point)}>
                {isActive && (
                  <circle 
                    cx={`${point.x}%`} 
                    cy={`${point.y}%`} 
                    r="12" 
                    fill="url(#active-pulse)" 
                  />
                )}
                <circle 
                  cx={`${point.x}%`} 
                  cy={`${point.y}%`} 
                  r="3.5" 
                  fill={isActive ? '#ef4444' : '#1e293b'} 
                  stroke={isActive ? '#f87171' : '#334155'} 
                  strokeWidth="1.5"
                  className="transition-all duration-300 group-hover:scale-125"
                />
              </g>
            );
          })}
        </svg>

        {/* Central SOC Pin Labels */}
        <div 
          className="absolute text-[9px] font-mono font-bold text-blue-400 bg-blue-950/90 border border-blue-500/30 px-1.5 py-0.5 rounded shadow pointer-events-none"
          style={{ left: `${TARGET_SOC.x - 4}%`, top: `${TARGET_SOC.y + 4}%` }}
        >
          SOC GATEWAY
        </div>

        {/* Overlay Nation Tag Infobox */}
        {activeGeo && (
          <div className="absolute bottom-3 right-3 bg-[#0a0c20]/95 backdrop-blur-md border border-blue-950 p-3 rounded-lg shadow-xl max-w-[160px] text-xs font-mono animate-slideIn">
            <div className="flex items-center gap-1.5 font-bold text-white border-b border-blue-950/80 pb-1 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <span className="truncate">{activeGeo.name.split(' ')[0]}</span>
            </div>
            <div className="space-y-0.5 text-[10px] text-gray-400">
              <div className="flex justify-between">
                <span>GEO CODE:</span>
                <span className="text-white font-bold">{activeGeo.code}</span>
              </div>
              <div className="flex justify-between">
                <span>LAT/LON:</span>
                <span className="text-white">{(activeGeo.y * 1.8 - 90).toFixed(2)}, {(activeGeo.x * 3.6 - 180).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Micro overlay alarm for critical attacks */}
        {recentAttacks.length > 0 && recentAttacks[0].analysis?.severity === 'Critical' && (
          <div className="absolute top-3 left-3 bg-red-950/90 border border-red-500/40 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-mono text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.25)] animate-bounce" id="map-critical-toast">
            <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
            <span>CRITICAL ATTACK DETECTED</span>
          </div>
        )}
      </div>

      <div className="mt-3.5 flex items-center justify-between text-[11px] font-mono text-gray-500" id="map-footer">
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500/25 border border-blue-500 flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-blue-400"></span>
            </span>
            <span>Central SOC Gateway</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#1e293b] border border-[#334155]"></span>
            <span>Honeypots</span>
          </div>
        </div>
        <span>Projection: Cyber Flat Mercator GRID</span>
      </div>
    </div>
  );
}
