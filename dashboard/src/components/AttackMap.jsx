/**
 * AttackMap.jsx — CYBER-EYE Tactical SOC Map & Globe Visualizer.
 * Features 3D Interactive Earth Globe (Drag rotation, 60FPS WebGL/Canvas),
 * 2D Mercator Tactical Overview (matching Military SOC specification),
 * Framer 3D Globe, and Canvas 3D Particle Sphere.
 */
import React, { useEffect, useRef, useState, useMemo, lazy, Suspense } from 'react';
import { Globe, Layers, ShieldAlert, Radio, Flame, Maximize2, Crosshair, Zap, Compass } from 'lucide-react';

// Lazy load Framer 3D Tactical Globe component
const TacticalGlobe3D = lazy(() =>
  import(/* @vite-ignore */ 'https://framer.com/m/TacticalGlobe3D-uVMtXj.js@UhPxNuaENi2YMvlzEzft')
    .then(mod => ({ default: mod.default || mod.TacticalGlobe3D || mod }))
    .catch(err => {
      console.warn("Framer 3D Globe fallback triggered:", err);
      return { default: CanvasFallbackGlobe };
    })
);

/* ── Country code → [lat, lng] ─────────────────────────────────── */
const CC_COORDS = {
  AF:[33.9,67.7],AL:[41.2,20.2],DZ:[28.0,2.6],AO:[-11.2,17.9],AR:[-34.6,-58.4],
  AU:[-25.3,133.8],AT:[47.5,14.6],AZ:[40.1,47.6],BD:[23.7,90.4],BE:[50.5,4.5],
  BR:[-14.2,-51.9],BG:[42.7,25.5],CA:[56.1,-106.3],CL:[-35.7,-71.5],CN:[35.9,104.2],
  CO:[4.6,-74.1],HR:[45.1,15.2],CZ:[49.8,15.5],DK:[56.3,9.5],EG:[26.8,30.8],
  ET:[9.1,40.5],FI:[61.9,25.7],FR:[46.2,2.2],DE:[51.2,10.5],GH:[7.9,-1.0],
  GR:[39.1,22.0],HU:[47.2,19.5],IN:[20.6,78.9],ID:[-0.8,113.9],IR:[32.4,53.7],
  IQ:[33.2,43.7],IE:[53.1,-8.2],IL:[31.5,34.8],IT:[41.9,12.6],JP:[36.2,138.3],
  KZ:[48.0,66.9],KE:[-0.0,37.9],KR:[35.9,127.8],MX:[23.6,-102.6],MA:[31.8,-7.1],
  MM:[21.9,95.9],NL:[52.1,5.3],NZ:[-40.9,174.9],NG:[9.1,8.7],NO:[60.5,8.5],
  PK:[30.4,69.3],PE:[-9.2,-75.0],PH:[12.9,121.8],PL:[51.9,19.1],PT:[39.4,-8.2],
  RO:[45.9,24.97],RU:[61.5,105.3],SA:[24.2,45.1],ZA:[-30.6,22.9],ES:[40.5,-3.7],
  SE:[60.1,18.6],CH:[46.8,8.2],SY:[34.8,38.9],TW:[23.7,120.9],TH:[15.9,100.9],
  TR:[38.9,35.2],UA:[48.4,31.2],GB:[55.4,-3.4],US:[37.1,-95.7],VN:[14.1,108.3],
  XX:[20.0,0.0],
};

const SEV_COLOR = { critical:'#ef4444', high:'#f97316', medium:'#eab308', low:'#22c55e' };

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

/* ── HIGH-PERFORMANCE INTERACTIVE 3D EARTH GLOBE (SaaS Cybersecurity Spec) ── */
function InteractiveEarthGlobe3D({ logs = [], onExpand }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Interactive rotation & physics state
  const rotYRef = useRef(0.5);
  const rotXRef = useRef(0.2);
  const velXRef = useRef(0);
  const velYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const idleTimerRef = useRef(null);
  const isAutoSpinRef = useRef(true);
  const zoomScaleRef = useRef(1.0);

  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [autoSpin, setAutoSpin] = useState(true);
  const [fps, setFps] = useState(60);

  // Target ESP32 Honeypot (Chennai, India)
  const targetNode = { id: 'esp32-target', label: 'ESP32 HONEYPOT SENSOR', country: 'India', code: 'IN', lat: 13.08, lng: 80.27, isTarget: true, ip: '192.168.1.100' };

  // Combine default attacker hubs + dynamic WebSocket logs
  const markers = useMemo(() => {
    const defaultList = [
      { id: 'm-us', country: 'United States', code: 'US', lat: 37.1, lng: -95.7, severity: 'critical', ip: '198.51.100.42', attackType: 'SSH BRUTEFORCE' },
      { id: 'm-de', country: 'Germany', code: 'DE', lat: 51.2, lng: 10.5, severity: 'high', ip: '185.220.101.5', attackType: 'FTP ANONYMOUS' },
      { id: 'm-it', country: 'Italy', code: 'IT', lat: 41.9, lng: 12.6, severity: 'medium', ip: '185.220.101.77', attackType: 'HTTP PROBE' },
      { id: 'm-jp', country: 'Japan', code: 'JP', lat: 36.2, lng: 138.3, severity: 'critical', ip: '202.214.194.1', attackType: 'TELNET EXPLOIT' },
      { id: 'm-ru', country: 'Russia', code: 'RU', lat: 61.5, lng: 105.3, severity: 'high', ip: '95.213.251.1', attackType: 'PORT SCAN' },
      { id: 'm-br', country: 'Brazil', code: 'BR', lat: -14.2, lng: -51.9, severity: 'low', ip: '177.12.89.4', attackType: 'PING SWEEP' },
      { id: 'm-au', country: 'Australia', code: 'AU', lat: -25.3, lng: 133.8, severity: 'medium', ip: '139.130.4.5', attackType: 'TCP SYN FLOOD' },
    ];

    const map = {};
    defaultList.forEach(m => { map[m.ip] = m; });

    logs.slice(0, 15).forEach((l, idx) => {
      const code = l.country_code || 'XX';
      const coords = CC_COORDS[code] || CC_COORDS.XX;
      const ip = l.ip || `ip-${idx}`;
      if (!map[ip]) {
        map[ip] = {
          id: `log-${ip}`,
          country: l.country || code,
          code,
          lat: coords[0] + (Math.random() * 2 - 1),
          lng: coords[1] + (Math.random() * 2 - 1),
          severity: l.severity || 'high',
          ip,
          attackType: l.attack_type || 'PROBE',
        };
      }
    });

    return [targetNode, ...Object.values(map)];
  }, [logs]);

  // World continent sampling grid for dot-matrix 3D landmasses
  const landmassDots = useMemo(() => {
    const dots = [];
    const regions = [
      { minLat: 15, maxLat: 70, minLng: -165, maxLng: -55, step: 4 },
      { minLat: -55, maxLat: 12, minLng: -82, maxLng: -34, step: 4 },
      { minLat: 35, maxLat: 71, minLng: -10, maxLng: 45, step: 3 },
      { minLat: -35, maxLat: 37, minLng: -18, maxLng: 51, step: 4 },
      { minLat: 8, maxLat: 75, minLng: 45, maxLng: 150, step: 4 },
      { minLat: -42, maxLat: -10, minLng: 112, maxLng: 155, step: 4 },
    ];

    regions.forEach(r => {
      for (let lat = r.minLat; lat <= r.maxLat; lat += r.step) {
        for (let lng = r.minLng; lng <= r.maxLng; lng += r.step) {
          dots.push({ lat: lat + (Math.random() * 0.4 - 0.2), lng: lng + (Math.random() * 0.4 - 0.2) });
        }
      }
    });

    return dots;
  }, []);

  // Animated starfield particles
  const stars = useMemo(() => {
    const list = [];
    for (let i = 0; i < 160; i++) {
      list.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 1.8 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
      });
    }
    return list;
  }, []);

  // Handle Drag / Touch Rotation Physics
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    lastMousePosRef.current = { x: clientX, y: clientY };

    isAutoSpinRef.current = false;
    setAutoSpin(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - lastMousePosRef.current.x;
    const deltaY = clientY - lastMousePosRef.current.y;

    velXRef.current = deltaX * 0.005;
    velYRef.current = deltaY * 0.005;

    rotYRef.current += velXRef.current;
    rotXRef.current = Math.max(-1.2, Math.min(1.2, rotXRef.current + velYRef.current));

    lastMousePosRef.current = { x: clientX, y: clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    idleTimerRef.current = setTimeout(() => {
      isAutoSpinRef.current = true;
      setAutoSpin(true);
    }, 2000);
  };

  // Main 60 FPS Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTime = lastTime;

    function convertLatLngTo3D(lat, lng, radius, rotY, rotX) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180 + rotY * (180 / Math.PI)) * (Math.PI / 180);

      const x0 = radius * Math.sin(phi) * Math.cos(theta);
      const y0 = radius * Math.cos(phi);
      const z0 = radius * Math.sin(phi) * Math.sin(theta);

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const x = x0;
      const y = y0 * cosX - z0 * sinX;
      const z = y0 * sinX + z0 * cosX;

      return { x, y, z };
    }

    function render(time) {
      frameCount++;
      if (time - fpsTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (time - fpsTime)));
        frameCount = 0;
        fpsTime = time;
      }

      const width = canvas.offsetWidth * window.devicePixelRatio || 800;
      const height = canvas.offsetHeight * window.devicePixelRatio || 500;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = Math.min(cx, cy) * 0.58 * zoomScaleRef.current;

      if (isAutoSpinRef.current) {
        rotYRef.current += 0.0035;
      } else if (!isDraggingRef.current) {
        rotYRef.current += velXRef.current;
        rotXRef.current = Math.max(-1.2, Math.min(1.2, rotXRef.current + velYRef.current));
        velXRef.current *= 0.92;
        velYRef.current *= 0.92;
      }

      const currentRotY = rotYRef.current;
      const currentRotX = rotXRef.current;

      // 1. Starfield Background
      stars.forEach(star => {
        star.alpha += (Math.random() - 0.5) * star.twinkleSpeed;
        star.alpha = Math.max(0.1, Math.min(0.9, star.alpha));
        ctx.fillStyle = `rgba(186, 230, 253, ${star.alpha})`;
        ctx.beginPath();
        ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Atmospheric Outer Glow
      const atmoGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.95, cx, cy, baseRadius * 1.35);
      atmoGrad.addColorStop(0, 'rgba(6, 182, 212, 0.28)');
      atmoGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.12)');
      atmoGrad.addColorStop(1, 'rgba(3, 9, 18, 0)');
      ctx.fillStyle = atmoGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // 3. Dark Base Globe Sphere
      const globeGrad = ctx.createRadialGradient(
        cx - baseRadius * 0.3,
        cy - baseRadius * 0.3,
        baseRadius * 0.1,
        cx,
        cy,
        baseRadius
      );
      globeGrad.addColorStop(0, '#0d1d33');
      globeGrad.addColorStop(0.7, '#07101e');
      globeGrad.addColorStop(1, '#030712');

      ctx.fillStyle = globeGrad;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 4. Latitude / Longitude Grid Lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.lineWidth = 0.6;

      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let first = true;
        for (let lng = -180; lng <= 180; lng += 10) {
          const p3d = convertLatLngTo3D(lat, lng, baseRadius, currentRotY, currentRotX);
          if (p3d.z > -baseRadius * 0.2) {
            const sx = cx + p3d.x;
            const sy = cy - p3d.y;
            if (first) { ctx.moveTo(sx, sy); first = false; }
            else { ctx.lineTo(sx, sy); }
          }
        }
        ctx.stroke();
      }

      // 5. 3D Landmass Dot Grid Matrix
      landmassDots.forEach(dot => {
        const p3d = convertLatLngTo3D(dot.lat, dot.lng, baseRadius, currentRotY, currentRotX);
        if (p3d.z > 0) {
          const sx = cx + p3d.x;
          const sy = cy - p3d.y;
          const alpha = (p3d.z / baseRadius) * 0.5 + 0.2;
          ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
          ctx.beginPath();
          ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 6. 3D Attack Beams (Arcs)
      const targetP3D = convertLatLngTo3D(targetNode.lat, targetNode.lng, baseRadius, currentRotY, currentRotX);
      const targetSx = cx + targetP3D.x;
      const targetSy = cy - targetP3D.y;

      markers.forEach(m => {
        if (m.isTarget) return;
        const srcP3D = convertLatLngTo3D(m.lat, m.lng, baseRadius, currentRotY, currentRotX);
        if (srcP3D.z > -baseRadius * 0.4 || targetP3D.z > -baseRadius * 0.4) {
          const srcSx = cx + srcP3D.x;
          const srcSy = cy - srcP3D.y;

          const midSx = (srcSx + targetSx) / 2;
          const midSy = (srcSy + targetSy) / 2 - 40 * zoomScaleRef.current;

          const color = SEV_COLOR[m.severity] || '#ef4444';
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.2;
          ctx.globalAlpha = 0.45;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(srcSx, srcSy);
          ctx.quadraticCurveTo(midSx, midSy, targetSx, targetSy);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 1.0;
        }
      });

      // 7. Location Markers & Labels
      markers.forEach(m => {
        const p3d = convertLatLngTo3D(m.lat, m.lng, baseRadius, currentRotY, currentRotX);
        if (p3d.z > -baseRadius * 0.1) {
          const sx = cx + p3d.x;
          const sy = cy - p3d.y;
          const isTarget = m.isTarget;
          const color = isTarget ? '#10b981' : (SEV_COLOR[m.severity] || '#ef4444');
          const isHovered = hoveredMarker?.id === m.id;

          const pulse = Math.sin(time * 0.004) * 0.5 + 0.5;
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.6 - pulse * 0.4;
          ctx.beginPath();
          ctx.arc(sx, sy, (isTarget ? 10 : 7) + pulse * 8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1.0;

          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = isHovered ? 20 : 10;
          ctx.beginPath();
          ctx.arc(sx, sy, isHovered ? 6 : (isTarget ? 5 : 3.5), 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.fillStyle = isTarget ? '#34d399' : '#e2e8f0';
          ctx.font = `bold ${isTarget ? '10px' : '9px'} monospace`;
          ctx.fillText(m.country || m.code, sx + 8, sy + 3);
        }
      });

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [stars, landmassDots, markers, targetNode, hoveredMarker]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#030712] rounded-xl overflow-hidden flex flex-col select-none border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.12)] cursor-grab active:cursor-grabbing"
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    >
      {/* Glassmorphism Header HUD */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-auto bg-[#081225]/85 backdrop-blur-md px-4 py-2.5 rounded-lg border border-cyan-500/30 text-xs text-cyan-200 shadow-xl">
        <div className="flex items-center gap-2.5 font-mono">
          <Globe className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '12s' }} />
          <span className="font-extrabold tracking-widest text-cyan-300 uppercase text-[12px]">3D INTERACTIVE EARTH GLOBE</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 tracking-wider">
            60 FPS WEBGL
          </span>
        </div>

        {/* HUD Quick Controls */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <button
            onClick={(e) => { e.stopPropagation(); isAutoSpinRef.current = !autoSpin; setAutoSpin(!autoSpin); }}
            className={`px-3 py-1 rounded transition-all duration-200 border ${
              autoSpin
                ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {autoSpin ? 'Auto-Spin: ON' : 'Auto-Spin: OFF'}
          </button>
          {onExpand && (
            <button
              onClick={(e) => { e.stopPropagation(); onExpand(); }}
              className="p-1.5 rounded bg-slate-800 hover:bg-cyan-500/20 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main 3D Earth Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block flex-1" />

      {/* Floating Bottom Live Telemetry Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-auto bg-[#081225]/85 backdrop-blur-md px-4 py-2.5 rounded-lg border border-cyan-500/30 text-xs font-mono flex items-center justify-between shadow-xl text-slate-300">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ESP32 DECOY (INDIA)
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-cyan-300 font-bold">{markers.length - 1} Threat Nodes</span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-slate-400 font-bold">{fps} FPS</span>
          <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 uppercase font-extrabold">
            SAAS 3D GLOBE SPEC
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── 2D MERCATOR TACTICAL OVERVIEW COMPONENT (Matches Reference Screenshot) ── */
function TacticalMercatorMap({ logs = [], onExpand }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  const targetCoords = { lat: 13.08, lng: 80.27, label: 'ESP32 HONEYPOT SENSOR (IN)' };
  const targetPos = latLngToMercator(targetCoords.lat, targetCoords.lng);

  const defaultNodes = useMemo(() => [
    { id: 'us-node', country: 'United States', code: 'US', lat: 37.1, lng: -95.7, severity: 'critical', ip: '198.51.100.42' },
    { id: 'de-node', country: 'Germany', code: 'DE', lat: 51.2, lng: 10.5, severity: 'high', ip: '185.220.101.5' },
    { id: 'it-node', country: 'Italy', code: 'IT', lat: 41.9, lng: 12.6, severity: 'medium', ip: '185.220.101.77' },
    { id: 'jp-node', country: 'Japan', code: 'JP', lat: 36.2, lng: 138.3, severity: 'critical', ip: '202.214.194.1' },
    { id: 'ru-node', country: 'Russia', code: 'RU', lat: 61.5, lng: 105.3, severity: 'high', ip: '95.213.251.1' },
  ], []);

  const nodes = useMemo(() => {
    const map = {};
    defaultNodes.forEach(n => { map[n.ip] = n; });

    logs.slice(0, 15).forEach((l, idx) => {
      const code = l.country_code || 'XX';
      const coords = CC_COORDS[code] || CC_COORDS.XX;
      const ip = l.ip || `node-${idx}`;
      if (!map[ip]) {
        map[ip] = {
          id: `log-${ip}`,
          country: l.country || code,
          code,
          lat: coords[0] + (Math.random() * 2 - 1),
          lng: coords[1] + (Math.random() * 2 - 1),
          severity: l.severity || 'high',
          ip,
          attackType: l.attack_type || 'PROBE',
        };
      }
    });
    return Object.values(map);
  }, [logs, defaultNodes]);

  return (
    <div className="relative w-full h-full bg-[#06090e] rounded-xl overflow-hidden flex flex-col select-none border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.08)]">
      {/* Top Header HUD */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0a0e17]/90 border-b border-emerald-500/20 backdrop-blur-md z-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            <h2 className="font-mono text-sm font-extrabold tracking-widest text-emerald-400 uppercase">
              GLOBAL TACTICAL OVERVIEW
            </h2>
          </div>
          <span className="font-mono text-[10px] text-slate-500 tracking-wider pl-4">
            MERCATOR PROJECTION — CYBER-EYE SOC TELEMETRY
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold">
            <Crosshair className="w-3.5 h-3.5 animate-spin" />
            <span>NODES ACTIVE: {nodes.length}</span>
          </div>
          {onExpand && (
            <button
              onClick={onExpand}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-400 transition-all duration-200"
              title="Expand / Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Mercator Map Viewport */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-[#070b12] flex items-center justify-center">
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(16, 185, 129, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(16, 185, 129, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        <svg viewBox="0 0 1000 500" className="w-full h-full object-contain">
          <defs>
            <filter id="greenGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="arcGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g stroke="rgba(16, 185, 129, 0.06)" strokeWidth="0.5" strokeDasharray="3 3">
            {[100, 200, 300, 400].map(y => (
              <line key={`y-${y}`} x1="0" y1={y} x2="1000" y2={y} />
            ))}
            {[200, 400, 600, 800].map(x => (
              <line key={`x-${x}`} x1={x} y1="0" x2={x} y2="500" />
            ))}
          </g>

          <g fill="#141e2c" stroke="#223348" strokeWidth="0.85" opacity="0.95">
            <path d="M 110 50 L 150 40 L 220 50 L 280 40 L 320 60 L 325 85 L 290 100 L 270 95 L 240 115 L 180 110 L 150 125 L 130 95 L 90 90 Z" />
            <path d="M 135 115 L 270 105 L 285 145 L 260 170 L 245 215 L 210 220 L 190 190 L 165 165 L 135 155 Z" />
            <path d="M 310 30 L 375 25 L 390 50 L 355 80 L 320 75 Z" />
            <path d="M 245 220 L 280 225 L 325 255 L 345 290 L 315 380 L 285 420 L 265 410 L 255 340 L 235 270 Z" />
            <path d="M 470 80 L 525 75 L 545 95 L 565 100 L 555 140 L 520 155 L 485 150 L 465 130 L 470 105 Z" />
            <path d="M 455 95 L 470 90 L 475 110 L 460 118 Z" />
            <path d="M 500 50 L 535 45 L 545 80 L 515 85 Z" />
            <path d="M 460 155 L 565 150 L 605 195 L 585 275 L 545 355 L 495 345 L 470 245 L 445 205 L 450 175 Z" />
            <path d="M 605 305 L 620 300 L 615 345 L 600 350 Z" />
            <path d="M 545 45 L 915 35 L 940 75 L 895 120 L 785 115 L 685 105 L 565 95 Z" />
            <path d="M 560 150 L 625 145 L 640 190 L 595 210 L 570 185 Z" />
            <path d="M 660 180 L 720 175 L 740 240 L 690 250 L 665 205 Z" />
            <path d="M 725 115 L 865 110 L 880 180 L 815 215 L 745 195 L 720 160 Z" />
            <path d="M 890 120 L 915 115 L 925 160 L 900 165 Z" />
            <path d="M 750 200 L 805 195 L 820 245 L 780 260 L 755 230 Z" />
            <path d="M 785 255 L 865 250 L 885 280 L 795 290 Z" />
            <path d="M 805 305 L 915 295 L 930 375 L 835 390 L 800 355 Z" />
            <path d="M 940 385 L 960 380 L 955 425 L 935 430 Z" />
          </g>

          {nodes.map(node => {
            const pos = latLngToMercator(node.lat, node.lng);
            const midX = (pos.x + targetPos.x) / 2;
            const midY = Math.min(pos.y, targetPos.y) - 40;

            return (
              <g key={`arc-${node.id}`}>
                <path
                  d={`M ${pos.x} ${pos.y} Q ${midX} ${midY} ${targetPos.x} ${targetPos.y}`}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="1.2"
                  strokeOpacity="0.4"
                  strokeDasharray="4 4"
                  filter="url(#arcGlow)"
                />
              </g>
            );
          })}

          <g transform={`translate(${targetPos.x}, ${targetPos.y})`}>
            <circle r="14" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="1">
              <animate attributeName="r" values="8;20;8" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle r="5" fill="#10b981" filter="url(#greenGlow)" />
            <text x="10" y="4" fill="#10b981" fontSize="9" fontWeight="bold" fontFamily="monospace">
              ESP32 TARGET
            </text>
          </g>

          {nodes.map(node => {
            const pos = latLngToMercator(node.lat, node.lng);
            const isHovered = hoveredNode?.id === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer transition-transform duration-200 hover:scale-125"
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <circle r="12" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="0.8">
                  <animate attributeName="r" values="6;16;6" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0;0.9" dur="3s" repeatCount="indefinite" />
                </circle>

                <circle
                  r={isHovered ? "6.5" : "4.5"}
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth={isHovered ? "1.5" : "0.5"}
                  filter="url(#greenGlow)"
                />

                {isHovered && (
                  <g transform="translate(10, -10)">
                    <rect
                      x="0"
                      y="-14"
                      width="130"
                      height="32"
                      rx="4"
                      fill="rgba(6, 14, 26, 0.95)"
                      stroke="#10b981"
                      strokeWidth="1"
                    />
                    <text x="6" y="-2" fill="#34d399" fontSize="9" fontWeight="bold" fontFamily="monospace">
                      {node.country} ({node.code})
                    </text>
                    <text x="6" y="10" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                      IP: {node.ip}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        <div className="absolute bottom-3 left-3 pointer-events-none flex items-center gap-2 bg-[#08101d]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-emerald-500/30 text-[10px] font-mono text-emerald-300">
          <Zap className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
          <span>LIVE GEO-TELEMETRY SYNCED</span>
        </div>
      </div>
    </div>
  );
}

/* ── 3D Canvas Sphere Fallback ────────────────────────────────── */
function CanvasFallbackGlobe({ logs = [] }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let angle = 0;
    let animId;

    const target = { lat: 13.08, lng: 80.27 };

    const paths = logs.slice(0, 20).map(log => {
      const code = log.country_code || 'XX';
      const coords = CC_COORDS[code] || CC_COORDS.XX;
      return {
        from: { lat: coords[0], lng: coords[1] },
        to: target,
        color: SEV_COLOR[log.severity] || '#ef4444',
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.005,
      };
    });

    function latLngToXY(lat, lng, radius, angleOffset) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + angleOffset) * (Math.PI / 180);
      return {
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
      };
    }

    function projectTo2D(point, cx, cy, distance) {
      const scale = distance / (distance + point.z);
      return {
        x: cx + point.x * scale,
        y: cy - point.y * scale,
        visible: point.z > -150,
      };
    }

    function render() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth * window.devicePixelRatio || 600;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio || 400;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = Math.min(cx, cy) * 0.6;
      angle += 0.002;

      ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.1)';
        for (let lng = -180; lng <= 180; lng += 10) {
          const p3d = latLngToXY(lat, lng, radius, angle * 50);
          const p2d = projectTo2D(p3d, cx, cy, 800);
          if (p2d.visible) {
            if (lng === -180) ctx.moveTo(p2d.x, p2d.y);
            else ctx.lineTo(p2d.x, p2d.y);
          }
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    }

    render();
    return () => cancelAnimationFrame(animId);
  }, [logs]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function AttackMap({ logs = [], mini = false, onExpand }) {
  const [viewMode, setViewMode] = useState('3d_earth'); // '3d_earth' | '2d_mercator' | '3d_framer' | 'canvas'

  // Dynamic Framer 3D markers
  const markers = useMemo(() => {
    const list = [
      {
        label: 'ESP32 HONEYPOT (Sensor)',
        description: 'Decoy Active • Chennai, IN',
        latitude: 13.08,
        longitude: 80.27,
        color: '#10b981',
      },
    ];

    const uniqueMap = {};
    logs.forEach(l => {
      const code = l.country_code || 'XX';
      const coords = CC_COORDS[code] || CC_COORDS.XX;
      const ip = l.ip;
      if (!uniqueMap[ip]) {
        uniqueMap[ip] = {
          label: `${l.country || code} [${ip}]`,
          description: `Threat: ${(l.attack_type || 'Attack').toUpperCase()} (${(l.severity || 'low').toUpperCase()})`,
          latitude: coords[0] + (Math.random() * 2 - 1),
          longitude: coords[1] + (Math.random() * 2 - 1),
          color: SEV_COLOR[l.severity] || '#ef4444',
        };
      }
    });

    return [...list, ...Object.values(uniqueMap)];
  }, [logs]);

  const uniqueIps = Array.from(new Set(logs.map(l => l.ip))).length;
  const uniqueCountries = Array.from(new Set(logs.map(l => l.country || l.country_code))).length;

  const framerGlobeProps = {
    markers,
    mapStyle: {
      oceanColor: '#050B15',
      landFill: '#0D1B2A',
      landStroke: '#1E3A5F',
      strokeWidth: 0.6,
      hoverColor: '#00F0FF',
      disabledColor: '#070F1E',
    },
    interaction: {
      autoRotate: true,
      autoRotateSpeed: 4.5,
      enableDrag: true,
      dragSensitivity: 0.4,
      glowColor: '#00F0FF',
      glowIntensity: 0.6,
      showStars: true,
      showLabels: true,
    },
    grid: { show: true, color: '#00F0FF', opacity: 0.2 },
    layout: { cornerRadius: 12, padding: 0, showBorder: false },
  };

  return (
    <div className="relative w-full h-full min-h-[460px] bg-[#030712] rounded-xl overflow-hidden border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col">
      {/* Top Cyber HUD Mode Switcher */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-auto bg-[#081225]/90 backdrop-blur-md px-4 py-2.5 rounded-lg border border-cyan-500/30 text-xs text-cyan-200 shadow-lg">
        <div className="flex items-center gap-2.5 font-mono">
          <Globe className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-extrabold tracking-widest text-cyan-300 uppercase text-[12px]">GLOBAL THREAT MAPPER</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 tracking-wider uppercase">
            {viewMode.replace('_', ' ')}
          </span>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-1.5 bg-[#030912] p-1 rounded-md border border-cyan-500/30 font-mono">
          <button
            onClick={() => setViewMode('3d_earth')}
            className={`px-3 py-1 rounded text-[11px] font-bold transition-all duration-200 flex items-center gap-1.5 ${
              viewMode === '3d_earth'
                ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" /> 3D Interactive Earth
          </button>
          <button
            onClick={() => setViewMode('2d_mercator')}
            className={`px-3 py-1 rounded text-[11px] font-bold transition-all duration-200 flex items-center gap-1.5 ${
              viewMode === '2d_mercator'
                ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" /> 2D Mercator Tactical
          </button>
          <button
            onClick={() => setViewMode('3d_framer')}
            className={`px-3 py-1 rounded text-[11px] font-bold transition-all duration-200 flex items-center gap-1.5 ${
              viewMode === '3d_framer'
                ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-slate-400" /> Framer 3D
          </button>
        </div>
      </div>

      {/* Main Map Rendering Body */}
      <div className="relative w-full flex-1 h-full overflow-hidden flex items-center justify-center pt-12">
        {viewMode === '3d_earth' ? (
          <InteractiveEarthGlobe3D logs={logs} onExpand={onExpand} />
        ) : viewMode === '2d_mercator' ? (
          <TacticalMercatorMap logs={logs} onExpand={onExpand} />
        ) : viewMode === '3d_framer' ? (
          <Suspense fallback={<CanvasFallbackGlobe logs={logs} />}>
            <div className="w-full h-full flex items-center justify-center p-2">
              <TacticalGlobe3D {...framerGlobeProps} style={{ width: '100%', height: '100%', minHeight: '420px' }} />
            </div>
          </Suspense>
        ) : (
          <CanvasFallbackGlobe logs={logs} />
        )}
      </div>

      {/* Bottom Live Metrics Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-auto bg-[#081225]/90 backdrop-blur-md px-4 py-2.5 rounded-lg border border-cyan-500/30 text-xs font-mono grid grid-cols-2 md:grid-cols-4 gap-3 shadow-xl">
        <div className="flex items-center gap-2.5">
          <Radio className="w-4 h-4 text-emerald-400 animate-spin" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">PRIMARY SENSOR</div>
            <div className="text-emerald-300 font-bold text-[11px]">ESP32 HoneyBot (IN)</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">ATTACKER NODES</div>
            <div className="text-amber-300 font-bold text-[11px]">{uniqueIps || 5} Active Threat IPs</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Flame className="w-4 h-4 text-rose-400" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">ORIGIN NATIONS</div>
            <div className="text-rose-300 font-bold text-[11px]">{uniqueCountries || 4} Source Countries</div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <span className="px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 font-extrabold text-[11px] tracking-wider uppercase">
            3D SAAS MILITARY SPEC v3.0
          </span>
        </div>
      </div>
    </div>
  );
}
