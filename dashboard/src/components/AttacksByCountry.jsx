import React, { useState } from 'react';
import { Maximize2, ShieldAlert, Radio } from 'lucide-react';

/* ── Country code → [lat, lng] ── */
const CC_COORDS = {
  US: [37.1, -95.7],
  DE: [51.2, 10.5],
  RU: [61.5, 105.3],
  CN: [35.9, 104.2],
  JP: [36.2, 138.3],
  IN: [20.6, 78.9],
  BR: [-14.2, -51.9],
  GB: [55.4, -3.4],
  FR: [46.2, 2.2],
  IT: [41.9, 12.6],
  AU: [-25.3, 133.8],
  NL: [52.1, 5.3],
  KR: [35.9, 127.8],
  CA: [56.1, -106.3],
  XX: [20.0, 0.0],
};

const DEFAULT_HOTSPOTS = [
  { name: 'United States', code: 'US', lat: 37.1, lng: -95.7, count: 142 },
  { name: 'Germany', code: 'DE', lat: 51.2, lng: 10.5, count: 98 },
  { name: 'Italy', code: 'IT', lat: 41.9, lng: 12.6, count: 64 },
  { name: 'Japan', code: 'JP', lat: 36.2, lng: 138.3, count: 87 },
  { name: 'Russia', code: 'RU', lat: 61.5, lng: 105.3, count: 110 },
  { name: 'China', code: 'CN', lat: 35.9, lng: 104.2, count: 75 },
  { name: 'India', code: 'IN', lat: 20.6, lng: 78.9, count: 53 },
  { name: 'Brazil', code: 'BR', lat: -14.2, lng: -51.9, count: 41 },
];

/**
 * Mercator lat/lng -> [x, y] projection in 1000x500 viewBox
 */
function latLngToMercator(lat, lng, width = 1000, height = 500) {
  const x = ((lng + 180) / 360) * width;
  const clampedLat = Math.max(-75, Math.min(75, lat));
  const latRad = (clampedLat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = height / 2 - (mercN / 2.3) * (height / 2.2);
  return { x, y };
}

export default function AttacksByCountry({ stats, logs = [], onExpand }) {
  const [hoveredCountry, setHoveredCountry] = useState(null);

  // Parse real stats data or fallback to defaults
  const topCountries = stats?.top_countries && stats.top_countries.length > 0
    ? stats.top_countries
    : DEFAULT_HOTSPOTS;

  const totalEvents = stats?.total_events || topCountries.reduce((acc, c) => acc + (c.count || 0), 0) || 1;

  // Compute percentage list
  let sumPercentage = 0;
  const listItems = topCountries.slice(0, 6).map((c) => {
    const pct = parseFloat((((c.count || 10) / totalEvents) * 100).toFixed(1)) || 5.0;
    sumPercentage += pct;
    return {
      name: c.country || c.name || 'Unknown',
      code: c.code || 'XX',
      count: c.count || 10,
      percentage: pct
    };
  });

  const othersPct = parseFloat(Math.max(0, 100 - sumPercentage).toFixed(1));
  if (othersPct > 0) {
    listItems.push({
      name: 'Others',
      code: 'XX',
      count: Math.round((othersPct / 100) * totalEvents),
      percentage: othersPct
    });
  }

  // Hotspot dots for map
  const activeNodes = topCountries.map((c, i) => {
    const code = c.code || (c.country ? c.country.substring(0, 2).toUpperCase() : 'XX');
    const coords = CC_COORDS[code] || CC_COORDS[c.name] || [20, i * 30];
    const pos = latLngToMercator(coords[0], coords[1]);
    return {
      name: c.country || c.name,
      code,
      count: c.count || 12,
      x: pos.x,
      y: pos.y,
    };
  });

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#090d14] p-4 flex flex-col h-full shadow-2xl relative overflow-hidden select-none">
      {/* Header HUD */}
      <div className="flex items-center justify-between mb-3 z-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00ff9d] animate-pulse shadow-[0_0_8px_#00ff9d]" />
            <h2 className="font-mono text-xs font-extrabold tracking-widest text-[#00ff9d] uppercase">
              GLOBAL TACTICAL OVERVIEW
            </h2>
          </div>
          <span className="font-mono text-[9px] text-slate-500 tracking-wider pl-4">
            MERCATOR PROJECTION — LIVE ATTACK RADAR
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onExpand && (
            <button
              onClick={onExpand}
              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-[#00ff9d]/20 border border-slate-800 hover:border-[#00ff9d]/40 text-slate-400 hover:text-[#00ff9d] transition-all duration-200"
              title="Fullscreen View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-center">
        {/* Map Canvas Container */}
        <div className="lg:col-span-8 relative rounded-xl border border-slate-800/80 bg-[#0c1017] p-1 flex items-center justify-center overflow-hidden h-[260px]">
          {/* Grid lines background */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(0,255,157,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,255,157,0.12) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          <svg viewBox="0 0 1000 500" className="w-full h-full object-contain">
            <defs>
              <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="coloredGlow" />
                <feMerge>
                  <feMergeNode in="coloredGlow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Grid coordinate marks */}
            <g stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="3 3">
              {[100, 200, 300, 400].map(y => (
                <line key={`y-${y}`} x1="0" y1={y} x2="1000" y2={y} />
              ))}
              {[200, 400, 600, 800].map(x => (
                <line key={`x-${x}`} x1={x} y1="0" x2={x} y2="500" />
              ))}
            </g>

            {/* Detailed World Country & Continent Vector Paths */}
            <g fill="#161f2c" stroke="#2a384c" strokeWidth="0.8" opacity="0.95">
              {/* Greenland */}
              <path d="M 310 25 L 375 20 L 395 45 L 360 85 L 320 80 Z" />
              {/* North America & USA */}
              <path d="M 80 45 L 140 35 L 210 45 L 275 35 L 315 55 L 320 80 L 285 95 L 265 90 L 235 110 L 175 105 L 145 120 L 125 90 L 85 85 Z" />
              <path d="M 130 110 L 265 100 L 280 140 L 255 165 L 240 210 L 205 215 L 185 185 L 160 160 L 130 150 Z" />
              {/* Mexico & Central America */}
              <path d="M 160 160 L 235 165 L 255 210 L 230 225 L 210 210 Z" />
              {/* South America */}
              <path d="M 245 220 L 280 225 L 325 255 L 345 290 L 315 380 L 285 420 L 265 410 L 255 340 L 235 270 Z" />
              {/* Europe — UK & Western Europe */}
              <path d="M 455 90 L 470 85 L 475 105 L 460 115 Z" />
              <path d="M 470 75 L 525 70 L 545 90 L 565 95 L 555 135 L 520 150 L 485 145 L 465 125 L 470 100 Z" />
              {/* Scandinavia */}
              <path d="M 500 45 L 535 40 L 545 75 L 515 80 Z" />
              {/* Africa */}
              <path d="M 460 155 L 565 150 L 605 195 L 585 275 L 545 355 L 495 345 L 470 245 L 445 205 L 450 175 Z" />
              <path d="M 605 305 L 620 300 L 615 345 L 600 350 Z" />
              {/* Russia & North Eurasia */}
              <path d="M 545 40 L 915 30 L 940 70 L 895 115 L 785 110 L 685 100 L 565 90 Z" />
              {/* Middle East */}
              <path d="M 560 145 L 625 140 L 640 185 L 595 205 L 570 180 Z" />
              {/* India & South Asia */}
              <path d="M 660 175 L 720 170 L 740 235 L 690 245 L 665 200 Z" />
              {/* China & East Asia */}
              <path d="M 725 110 L 865 105 L 880 175 L 815 210 L 745 190 L 720 155 Z" />
              {/* Japan */}
              <path d="M 890 115 L 915 110 L 925 155 L 900 160 Z" />
              {/* Southeast Asia */}
              <path d="M 750 195 L 805 190 L 820 240 L 780 255 L 755 225 Z" />
              <path d="M 785 250 L 865 245 L 885 275 L 795 285 Z" />
              {/* Australia & New Zealand */}
              <path d="M 805 300 L 915 290 L 930 370 L 835 385 L 800 350 Z" />
              <path d="M 940 380 L 960 375 L 955 420 L 935 425 Z" />
            </g>

            {/* Glowing Mint-Green Attack Hotspot Nodes */}
            {activeNodes.map((node, i) => (
              <g
                key={i}
                transform={`translate(${node.x},${node.y})`}
                className="cursor-pointer transition-transform duration-200 hover:scale-125"
                onMouseEnter={() => setHoveredCountry(node)}
                onMouseLeave={() => setHoveredCountry(null)}
              >
                {/* Outer Expanding Pulse Halo */}
                <circle r="4" fill="none" stroke="#00ff9d" strokeWidth="1.2">
                  <animate attributeName="r" values="4;18;4" dur="2.5s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                  <animate attributeName="opacity" values="0.9;0;0.9" dur="2.5s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                </circle>

                {/* Inner Glow Core */}
                <circle r="4.5" fill="#00ff9d" filter="url(#neonGlow)" />
                <circle r="2" fill="#ffffff" />
              </g>
            ))}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredCountry && (
            <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-[#090d14]/90 border border-[#00ff9d]/40 text-[#00ff9d] font-mono text-[10px] shadow-lg flex items-center gap-2 pointer-events-none backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-ping" />
              <span className="font-bold uppercase">{hoveredCountry.name}</span>
              <span className="text-slate-400">({hoveredCountry.count} events)</span>
            </div>
          )}
        </div>

        {/* Country Breakdown Stats Sidebar */}
        <div className="lg:col-span-4 space-y-2.5 pr-1 flex flex-col justify-center">
          <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Top Ingress Vectors</span>
            <span className="text-[#00ff9d]">{totalEvents} Total</span>
          </div>
          {listItems.map((item, idx) => (
            <div key={idx} className="space-y-1 group">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-300 group-hover:text-[#00ff9d] transition-colors truncate max-w-[110px] font-medium">
                  {item.name}
                </span>
                <span className="text-slate-200 font-bold">{item.percentage}%</span>
              </div>
              <div className="w-full bg-slate-900/90 h-1.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-[#00ff9d] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,255,157,0.3)]"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

