import React, { useEffect, useRef, useState } from 'react';

// Helper types for 3D Math
interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  speed: number;
  size: number;
  opacity: number;
  seed: number;
}

export default function CyberGlobe3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width = 450;
    let height = canvas.height = 450;

    // Resize observer to ensure the canvas is responsive and fits perfectly
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width: entryWidth, height: entryHeight } = entry.contentRect;
        width = canvas.width = entryWidth || 450;
        height = canvas.height = entryHeight || 450;
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Initialize floating hologram particles (rising digital dust)
    const floatingParticles: Particle[] = [];
    const numFloatingParticles = 35;
    for (let i = 0; i < numFloatingParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 110;
      floatingParticles.push({
        x: Math.cos(angle) * radius,
        y: (Math.random() * 160) - 80, // Between y=-80 and y=80
        z: Math.sin(angle) * radius,
        speed: 0.4 + Math.random() * 0.8,
        size: Math.random() * 1.5 + 0.8,
        opacity: 0.1 + Math.random() * 0.6,
        seed: Math.random() * 100
      });
    }

    // Animation state variables
    let rotY = 0;
    let rotX = 0;
    let targetRotY = 0;
    let targetRotX = 0;
    let currentRotY = 0;
    let currentRotX = 0;
    let scanY = -50; // Scanline sweep vertical coordinate
    let platformRot = 0; // Independent platform rotation

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      // Calculate normalized mouse offset from center (-1 to 1)
      const nx = (e.clientX - cx) / (rect.width / 2);
      const ny = (e.clientY - cy) / (rect.height / 2);

      // Map to subtle tilt rotation targets
      targetRotY = nx * 0.35;
      targetRotX = -ny * 0.25;
    };

    const handleMouseLeave = () => {
      // Gently return to centered passive rotation
      targetRotY = 0;
      targetRotX = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Dynamic scale helper to size the scene relative to canvas dimensions
    const getSceneScale = () => Math.min(width, height) / 280;

    // 3D Projection function with Euler rotations around Y, then X
    const project = (x: number, y: number, z: number, rX: number, rY: number) => {
      const cosY = Math.cos(rY);
      const sinY = Math.sin(rY);
      const cosX = Math.cos(rX);
      const sinX = Math.sin(rX);

      // Rotate around Y axis
      const x1 = x * cosY - z * sinY;
      const z1 = z * cosY + x * sinY;

      // Rotate around X axis
      const y2 = y * cosX - z1 * sinX;
      const z2 = z1 * cosX + y * sinX;

      // Perspective scale factor
      const cameraDistance = 320;
      const perspectiveScale = cameraDistance / (cameraDistance + z2);

      const sceneScale = getSceneScale();

      const projX = x1 * perspectiveScale * sceneScale + width / 2;
      const projY = y2 * perspectiveScale * sceneScale + height / 2;

      return {
        x: projX,
        y: projY,
        z: z2,
        scale: perspectiveScale * sceneScale
      };
    };

    // Helper for rotating around static orbital axes
    const rotateOrbit = (x: number, y: number, z: number, roll: number, pitch: number) => {
      // Roll (Z rotation)
      const cosZ = Math.cos(roll);
      const sinZ = Math.sin(roll);
      let rx1 = x * cosZ - y * sinZ;
      let ry1 = y * cosZ + x * sinZ;
      let rz1 = z;

      // Pitch (X rotation)
      const cosX = Math.cos(pitch);
      const sinX = Math.sin(pitch);
      let rx2 = rx1;
      let ry2 = ry1 * cosX - rz1 * sinX;
      let rz2 = rz1 * cosX + ry1 * sinX;

      return { x: rx2, y: ry2, z: rz2 };
    };

    // Helper to determine shield boundary width at specific Y coordinate
    const getShieldWidthAtY = (y: number): number => {
      if (y < -50) return 0;
      if (y <= -26) {
        const pct = (y - (-50)) / 24;
        return 26 + pct * 12; // Outward curve
      }
      if (y <= 15) {
        const pct = (y - (-26)) / 41;
        return 38 - pct * 6; // Slight taper
      }
      if (y <= 60) {
        const pct = (y - 15) / 45;
        return 32 * (1 - pct); // Tapering to bottom tip
      }
      return 0;
    };

    // Main render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Increment passive base rotations and animations
      platformRot += 0.008;
      rotY += 0.003;
      scanY += 1.2;
      if (scanY > 60) scanY = -50; // Wrap scanline sweep

      // Dynamic mouse tracking spring physics
      currentRotY += (targetRotY - currentRotY) * 0.05;
      currentRotX += (targetRotX - currentRotX) * 0.05;

      const dynamicRotY = rotY * 0.6 + currentRotY;
      const dynamicRotX = -0.15 + currentRotX; // default slightly tilted down

      // Z-Buffer array to depth-sort rendering calls (prevents overlap bugs)
      const drawQueue: { depth: number; draw: () => void }[] = [];

      // ==========================================
      // 1. PROJECT PLATFORM BASE (XZ plane at y = 80)
      // ==========================================
      const platformY = 85;

      // Concentric circles inside base platform
      const baseR1 = 115; // Outer tick ring
      const baseR2 = 92;  // Rotating dotted ring
      const baseR3 = 70;  // Inner solid rim

      // Draw Outer Tick Ring (24 radial ticks)
      const numTicks = 32;
      for (let i = 0; i < numTicks; i++) {
        const angle = (i / numTicks) * Math.PI * 2 + platformRot * 0.5;
        const tickLength = 7;
        const rInner = baseR1 - tickLength;

        const p1 = { x: Math.cos(angle) * rInner, y: platformY, z: Math.sin(angle) * rInner };
        const p2 = { x: Math.cos(angle) * baseR1, y: platformY, z: Math.sin(angle) * baseR1 };

        const proj1 = project(p1.x, p1.y, p1.z, dynamicRotX, dynamicRotY);
        const proj2 = project(p2.x, p2.y, p2.z, dynamicRotX, dynamicRotY);

        const averageDepth = (proj1.z + proj2.z) / 2;

        drawQueue.push({
          depth: averageDepth + 60, // Sort to back/base
          draw: () => {
            const alpha = Math.max(0.08, (140 - averageDepth) / 160) * 0.4;
            ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
            ctx.lineWidth = 1.2 * proj1.scale;
            ctx.beginPath();
            ctx.moveTo(proj1.x, proj1.y);
            ctx.lineTo(proj2.x, proj2.y);
            ctx.stroke();
          }
        });
      }

      // Draw middle rotating dashed rings
      const numSegments = 160;
      const platformPts: Point3D[] = [];
      for (let i = 0; i <= numSegments; i++) {
        const angle = (i / numSegments) * Math.PI * 2;
        platformPts.push({
          x: Math.cos(angle) * baseR2,
          y: platformY,
          z: Math.sin(angle) * baseR2
        });
      }

      // Render concentric platform circles in perspective
      [baseR2, baseR3, baseR1 + 10].forEach((radius, rIdx) => {
        const pointsInCircle: Point3D[] = [];
        const segments = 64;
        for (let i = 0; i <= segments; i++) {
          const angle = (i / segments) * Math.PI * 2 + (rIdx === 1 ? -platformRot * 0.3 : platformRot * 0.15);
          pointsInCircle.push({
            x: Math.cos(angle) * radius,
            y: platformY,
            z: Math.sin(angle) * radius
          });
        }

        // Project points
        const projectedCircle = pointsInCircle.map(p => project(p.x, p.y, p.z, dynamicRotX, dynamicRotY));

        drawQueue.push({
          depth: 150 + rIdx, // Force bottom rendering
          draw: () => {
            ctx.strokeStyle = rIdx === 1 ? 'rgba(34, 211, 238, 0.18)' : 'rgba(59, 130, 246, 0.08)';
            ctx.lineWidth = rIdx === 0 ? 1.5 : 0.8;
            if (rIdx === 0) {
              ctx.setLineDash([5, 8]); // Digital ticking effect
            } else {
              ctx.setLineDash([]);
            }
            ctx.beginPath();
            ctx.moveTo(projectedCircle[0].x, projectedCircle[0].y);
            for (let i = 1; i < projectedCircle.length; i++) {
              ctx.lineTo(projectedCircle[i].x, projectedCircle[i].y);
            }
            ctx.stroke();
            ctx.setLineDash([]); // Reset
          }
        });
      });

      // Platform Grid Mesh Floor (Subtle background depth)
      const gridCount = 5;
      const gridSpacing = 40;
      for (let i = -gridCount; i <= gridCount; i++) {
        // Lines parallel to Z
        const pZStart = { x: i * gridSpacing, y: platformY, z: -gridCount * gridSpacing };
        const pZEnd = { x: i * gridSpacing, y: platformY, z: gridCount * gridSpacing };
        // Lines parallel to X
        const pXStart = { x: -gridCount * gridSpacing, y: platformY, z: i * gridSpacing };
        const pXEnd = { x: gridCount * gridSpacing, y: platformY, z: i * gridSpacing };

        const projZS = project(pZStart.x, pZStart.y, pZStart.z, dynamicRotX, dynamicRotY);
        const projZE = project(pZEnd.x, pZEnd.y, pZEnd.z, dynamicRotX, dynamicRotY);
        const projXS = project(pXStart.x, pXStart.y, pXStart.z, dynamicRotX, dynamicRotY);
        const projXE = project(pXEnd.x, pXEnd.y, pXEnd.z, dynamicRotX, dynamicRotY);

        drawQueue.push({
          depth: 200, // Background floor layer
          draw: () => {
            ctx.strokeStyle = 'rgba(8, 47, 73, 0.12)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(projXS.x, projXS.y);
            ctx.lineTo(projXE.x, projXE.y);
            ctx.moveTo(projZS.x, projZS.y);
            ctx.lineTo(projZE.x, projZE.y);
            ctx.stroke();
          }
        });
      }

      // Vertical Projector Light Columns (Emitting upwards from base)
      const numBeams = 8;
      for (let i = 0; i < numBeams; i++) {
        const angle = (i / numBeams) * Math.PI * 2 + platformRot * 0.2;
        const beamR = baseR3 + 5;
        const pBottom = { x: Math.cos(angle) * beamR, y: platformY, z: Math.sin(angle) * beamR };
        const pTop = { x: Math.cos(angle) * beamR, y: platformY - 50, z: Math.sin(angle) * beamR };

        const projBottom = project(pBottom.x, pBottom.y, pBottom.z, dynamicRotX, dynamicRotY);
        const projTop = project(pTop.x, pTop.y, pTop.z, dynamicRotX, dynamicRotY);

        const avgZ = (projBottom.z + projTop.z) / 2;

        drawQueue.push({
          depth: avgZ + 45,
          draw: () => {
            const alpha = Math.max(0.05, (120 - avgZ) / 150) * 0.35;
            if (!Number.isFinite(projBottom.x) || !Number.isFinite(projBottom.y) || !Number.isFinite(projTop.x) || !Number.isFinite(projTop.y)) {
              return;
            }
            const grad = ctx.createLinearGradient(projBottom.x, projBottom.y, projTop.x, projTop.y);
            grad.addColorStop(0, `rgba(34, 211, 238, ${alpha})`);
            grad.addColorStop(0.6, `rgba(59, 130, 246, ${alpha * 0.3})`);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.strokeStyle = grad;
            ctx.lineWidth = 1 * projBottom.scale;
            ctx.beginPath();
            ctx.moveTo(projBottom.x, projBottom.y);
            ctx.lineTo(projTop.x, projTop.y);
            ctx.stroke();

            // Tiny glowing dot at the base of each beam
            ctx.fillStyle = `rgba(165, 243, 252, ${alpha * 1.5})`;
            ctx.beginPath();
            ctx.arc(projBottom.x, projBottom.y, 1.2 * projBottom.scale, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      // ==========================================
      // 2. PROJECT HOLOGRAPHIC SHIELD CURVES (Center)
      // ==========================================
      const shieldYMax = 60;
      const shieldYMin = -50;
      const maxShieldWidth = 38;

      // Helper to generate curved Z coordinate for shield front-bulge
      const getShieldZ = (x: number) => {
        // Curved face: curves closer to camera (negative Z) at center
        const normalizedX = Math.abs(x) / maxShieldWidth;
        const xCurve = Math.max(0, 1 - normalizedX * normalizedX);
        return -14 * xCurve - 3; // Shift slightly forward from axis
      };

      // 2A. Horizontal Shield Grid Lines
      const horizGridYs = [-38, -25, -12, 1, 14, 27, 40, 52];
      horizGridYs.forEach(y => {
        const w = getShieldWidthAtY(y);
        if (w <= 0) return;

        const numLinePoints = 14;
        const linePoints: Point3D[] = [];
        for (let i = 0; i < numLinePoints; i++) {
          const x = -w + (2 * w) * (i / (numLinePoints - 1));
          linePoints.push({ x, y, z: getShieldZ(x) });
        }

        // Project line points
        const projPoints = linePoints.map(p => project(p.x, p.y, p.z, dynamicRotX, dynamicRotY));

        // Average depth of the line
        const avgZ = projPoints.reduce((acc, curr) => acc + curr.z, 0) / projPoints.length;

        drawQueue.push({
          depth: avgZ + 10,
          draw: () => {
            ctx.lineWidth = 0.8;
            for (let i = 0; i < projPoints.length - 1; i++) {
              const p1 = projPoints[i];
              const p2 = projPoints[i + 1];

              // Proximity to horizontal scan sweep bar
              const distToScan1 = Math.abs(linePoints[i].y - scanY);
              const distToScan2 = Math.abs(linePoints[i+1].y - scanY);
              const scanProximity = (distToScan1 + distToScan2) / 2;

              let lineAlpha = 0.09;
              let strokeColor = 'rgba(34, 211, 238, 0.09)';
              
              if (scanProximity < 12) {
                // Glow sweep illumination
                const glowIntensity = 1 - (scanProximity / 12);
                lineAlpha = 0.12 + glowIntensity * 0.7;
                strokeColor = `rgba(165, 243, 252, ${lineAlpha})`;
                ctx.lineWidth = 1.6 * p1.scale;
              } else {
                ctx.lineWidth = 0.8 * p1.scale;
              }

              ctx.strokeStyle = strokeColor;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        });
      });

      // 2B. Vertical Shield Grid Lines
      const vertGridXs = [-26, -15, -5, 5, 15, 26];
      vertGridXs.forEach(x => {
        // Find top and bottom limits of shield boundary for this X
        let topY = -50;
        let bottomY = 60;

        // Calculate limits based on tapering profile
        const absX = Math.abs(x);
        if (absX > 26) {
          // Beyond top center corners
          const limitPct = (absX - 26) / 12;
          topY = -50 + limitPct * 24;
        }
        if (absX <= 32) {
          bottomY = 15 + 45 * (1 - absX / 32);
        } else {
          bottomY = -26 + 41 * (1 - (absX - 32) / 6);
        }

        if (bottomY <= topY) return;

        const numLinePoints = 14;
        const linePoints: Point3D[] = [];
        for (let i = 0; i < numLinePoints; i++) {
          const y = topY + (bottomY - topY) * (i / (numLinePoints - 1));
          linePoints.push({ x, y, z: getShieldZ(x) });
        }

        const projPoints = linePoints.map(p => project(p.x, p.y, p.z, dynamicRotX, dynamicRotY));
        const avgZ = projPoints.reduce((acc, curr) => acc + curr.z, 0) / projPoints.length;

        drawQueue.push({
          depth: avgZ + 11,
          draw: () => {
            for (let i = 0; i < projPoints.length - 1; i++) {
              const p1 = projPoints[i];
              const p2 = projPoints[i + 1];

              // Proximity to horizontal scan sweep bar
              const pyAverage = (linePoints[i].y + linePoints[i+1].y) / 2;
              const scanProximity = Math.abs(pyAverage - scanY);

              let lineAlpha = 0.08;
              let strokeColor = 'rgba(59, 130, 246, 0.08)';

              if (scanProximity < 12) {
                const glowIntensity = 1 - (scanProximity / 12);
                lineAlpha = 0.12 + glowIntensity * 0.65;
                strokeColor = `rgba(165, 243, 252, ${lineAlpha})`;
                ctx.lineWidth = 1.4 * p1.scale;
              } else {
                ctx.lineWidth = 0.8 * p1.scale;
              }

              ctx.strokeStyle = strokeColor;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        });
      });

      // 2C. Outer Shield Border (Highly detailed 3D curves)
      // Left and Right Keypoints
      const keyPointsR = [
        { x: 0, y: -50 },
        { x: 26, y: -50 },
        { x: 38, y: -26 },
        { x: 32, y: 15 },
        { x: 0, y: 60 }
      ];

      // Procedural dense path for shield border outline
      const outlinePoints: Point3D[] = [];
      const stepsPerSegment = 12;

      // Draw Right Outline
      for (let k = 0; k < keyPointsR.length - 1; k++) {
        const kp1 = keyPointsR[k];
        const kp2 = keyPointsR[k+1];
        for (let s = 0; s < stepsPerSegment; s++) {
          const t = s / stepsPerSegment;
          const x = kp1.x + (kp2.x - kp1.x) * t;
          const y = kp1.y + (kp2.y - kp1.y) * t;
          outlinePoints.push({ x, y, z: getShieldZ(x) });
        }
      }

      // Add bottom point
      outlinePoints.push({ x: 0, y: 60, z: getShieldZ(0) });

      // Draw Left Outline (Mirrored)
      for (let k = keyPointsR.length - 2; k >= 0; k--) {
        const kp1 = keyPointsR[k+1];
        const kp2 = keyPointsR[k];
        for (let s = 0; s < stepsPerSegment; s++) {
          const t = s / stepsPerSegment;
          const x = -(kp1.x + (kp2.x - kp1.x) * t); // Mirrored X
          const y = kp1.y + (kp2.y - kp1.y) * t;
          outlinePoints.push({ x, y, z: getShieldZ(x) });
        }
      }

      // Project all outline points
      const projectedOutline = outlinePoints.map(p => project(p.x, p.y, p.z, dynamicRotX, dynamicRotY));
      const borderAvgZ = projectedOutline.reduce((acc, curr) => acc + curr.z, 0) / projectedOutline.length;

      drawQueue.push({
        depth: borderAvgZ + 12,
        draw: () => {
          // Draw solid, glassy translucent shield body background
          ctx.fillStyle = 'rgba(8, 20, 52, 0.08)'; // Tech glass
          ctx.beginPath();
          ctx.moveTo(projectedOutline[0].x, projectedOutline[0].y);
          for (let i = 1; i < projectedOutline.length; i++) {
            ctx.lineTo(projectedOutline[i].x, projectedOutline[i].y);
          }
          ctx.closePath();
          ctx.fill();

          // Outer glowing hairline border
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.45)';
          ctx.lineWidth = 1.6 * projectedOutline[0].scale;
          ctx.beginPath();
          ctx.moveTo(projectedOutline[0].x, projectedOutline[0].y);
          for (let i = 1; i < projectedOutline.length; i++) {
            // Apply highlight at scanline intersection
            const yPt = outlinePoints[i].y;
            const scanDist = Math.abs(yPt - scanY);

            ctx.lineTo(projectedOutline[i].x, projectedOutline[i].y);

            if (scanDist < 6) {
              ctx.strokeStyle = '#e0f7fa';
              ctx.lineWidth = 2.8 * projectedOutline[i].scale;
            } else {
              ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
              ctx.lineWidth = 1.5 * projectedOutline[i].scale;
            }
          }
          ctx.closePath();
          ctx.stroke();

          // Dual Outer Shield Outline for digital "nested border radius" styling
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
          ctx.lineWidth = 0.8 * projectedOutline[0].scale;
          ctx.beginPath();
          ctx.moveTo(projectedOutline[0].x, projectedOutline[0].y);
          for (let i = 0; i < projectedOutline.length; i++) {
            // Push outwards slightly for offset outline
            const normalScale = 1.05;
            const p = outlinePoints[i];
            const pOffset = { x: p.x * normalScale, y: p.y * normalScale, z: p.z };
            const projOffset = project(pOffset.x, pOffset.y, pOffset.z, dynamicRotX, dynamicRotY);
            if (i === 0) ctx.moveTo(projOffset.x, projOffset.y);
            else ctx.lineTo(projOffset.x, projOffset.y);
          }
          ctx.closePath();
          ctx.stroke();
        }
      });

      // 2D. Horizontal Sweep Scanline Beam Glow
      const scanWidth = getShieldWidthAtY(scanY);
      if (scanWidth > 0) {
        const pScanL = { x: -scanWidth, y: scanY, z: getShieldZ(-scanWidth) };
        const pScanR = { x: scanWidth, y: scanY, z: getShieldZ(scanWidth) };

        const projL = project(pScanL.x, pScanL.y, pScanL.z, dynamicRotX, dynamicRotY);
        const projR = project(pScanR.x, pScanR.y, pScanR.z, dynamicRotX, dynamicRotY);

        const scanAvgZ = (projL.z + projR.z) / 2;

        drawQueue.push({
          depth: scanAvgZ + 5, // Top-most on shield
          draw: () => {
            if (!Number.isFinite(projL.x) || !Number.isFinite(projL.y) || !Number.isFinite(projR.x) || !Number.isFinite(projR.y)) {
              return;
            }
            // Radial cyan blast sweep gradient
            const beamGrad = ctx.createLinearGradient(projL.x, projL.y, projR.x, projR.y);
            beamGrad.addColorStop(0, 'rgba(34, 211, 238, 0)');
            beamGrad.addColorStop(0.3, 'rgba(34, 211, 238, 0.35)');
            beamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
            beamGrad.addColorStop(0.7, 'rgba(34, 211, 238, 0.35)');
            beamGrad.addColorStop(1, 'rgba(34, 211, 238, 0)');

            ctx.strokeStyle = beamGrad;
            ctx.lineWidth = 2.4 * projL.scale;
            ctx.beginPath();
            ctx.moveTo(projL.x, projL.y);
            ctx.lineTo(projR.x, projR.y);
            ctx.stroke();

            // Flare halo behind sweep bar
            const radiusValue = 45 * projL.scale;
            if (Number.isFinite(radiusValue) && radiusValue > 0) {
              const sweepGlow = ctx.createRadialGradient(
                (projL.x + projR.x) / 2, (projL.y + projR.y) / 2, 2,
                (projL.x + projR.x) / 2, (projL.y + projR.y) / 2, radiusValue
              );
              sweepGlow.addColorStop(0, 'rgba(34, 211, 238, 0.18)');
              sweepGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
              ctx.fillStyle = sweepGlow;
              ctx.beginPath();
              ctx.arc((projL.x + projR.x) / 2, (projL.y + projR.y) / 2, radiusValue, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        });
      }

      // ==========================================
      // 3. PROJECT GLOWING CENTRAL "X" EMBLEM
      // ==========================================
      // Two intersecting diagonal bars representing the XSZO "X" crest inside shield
      const xRadius = 15;
      const xYShift = -5; // Vertically center inside the shield
      const xZOffset = -1; // Sit slightly in front of the shield face mesh

      const logoPoints = [
        // Left-to-right bar
        { p1: { x: -xRadius, y: -xRadius + xYShift, z: getShieldZ(-xRadius) + xZOffset }, p2: { x: xRadius, y: xRadius + xYShift, z: getShieldZ(xRadius) + xZOffset } },
        // Right-to-left bar
        { p1: { x: xRadius, y: -xRadius + xYShift, z: getShieldZ(xRadius) + xZOffset }, p2: { x: -xRadius, y: xRadius + xYShift, z: getShieldZ(-xRadius) + xZOffset } }
      ];

      logoPoints.forEach((bar, bIdx) => {
        const proj1 = project(bar.p1.x, bar.p1.y, bar.p1.z, dynamicRotX, dynamicRotY);
        const proj2 = project(bar.p2.x, bar.p2.y, bar.p2.z, dynamicRotX, dynamicRotY);
        const avgZ = (proj1.z + proj2.z) / 2;

        drawQueue.push({
          depth: avgZ + 3, // Foreground elements
          draw: () => {
            const scaleFactor = proj1.scale;

            // Highlight bar on scanline overlap
            const scanDist1 = Math.abs(bar.p1.y - scanY);
            const scanDist2 = Math.abs(bar.p2.y - scanY);
            const scanAvgDist = (scanDist1 + scanDist2) / 2;

            let glowAlpha = 0.7;
            let barWidth = 3.5 * scaleFactor;
            let glowColor = 'rgba(34, 211, 238, 0.9)';

            if (scanAvgDist < 12) {
              const pulse = 1 - (scanAvgDist / 12);
              glowAlpha = 0.7 + pulse * 0.3;
              barWidth = (3.5 + pulse * 1.5) * scaleFactor;
              glowColor = 'rgba(255, 255, 255, 0.95)';
            }

            // Draw shadow/glow blur behind the bar
            ctx.shadowBlur = 12 * scaleFactor;
            ctx.shadowColor = 'rgba(34, 211, 238, 0.8)';
            ctx.strokeStyle = glowColor;
            ctx.lineWidth = barWidth;
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(proj1.x, proj1.y);
            ctx.lineTo(proj2.x, proj2.y);
            ctx.stroke();

            // Clear shadows
            ctx.shadowBlur = 0;

            // Secondary nested core line (white stripe) for neon luxury look
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1 * scaleFactor;
            ctx.beginPath();
            ctx.moveTo(proj1.x, proj1.y);
            ctx.lineTo(proj2.x, proj2.y);
            ctx.stroke();
          }
        });
      });

      // Central glowing diamond node at center of "X"
      const pCenter = { x: 0, y: xYShift, z: getShieldZ(0) + xZOffset - 0.5 };
      const projCenter = project(pCenter.x, pCenter.y, pCenter.z, dynamicRotX, dynamicRotY);
      drawQueue.push({
        depth: projCenter.z + 1,
        draw: () => {
          const coreSize = 3 * projCenter.scale;
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 15 * projCenter.scale;
          ctx.shadowColor = '#22d3ee';
          ctx.beginPath();
          ctx.arc(projCenter.x, projCenter.y, coreSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // ==========================================
      // 4. PROJECT FLOATING DIGITAL PARTICLES
      // ==========================================
      floatingParticles.forEach((pt) => {
        // Slowly rise upwards
        pt.y -= pt.speed;
        // Reset to platform at bottom if risen too high
        if (pt.y < -90) {
          pt.y = platformY;
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * baseR1;
          pt.x = Math.cos(angle) * radius;
          pt.z = Math.sin(angle) * radius;
        }

        const projPt = project(pt.x, pt.y, pt.z, dynamicRotX, dynamicRotY);

        drawQueue.push({
          depth: projPt.z,
          draw: () => {
            const pulse = Math.sin(Date.now() * 0.005 + pt.seed) * 0.3 + 0.7;
            const size = pt.size * projPt.scale * pulse;
            const finalOpacity = pt.opacity * Math.max(0.1, (120 - projPt.z) / 150);

            // Give them beautiful high-tech shades (mostly cyan, some royal blue)
            ctx.fillStyle = pt.seed > 50 ? `rgba(34, 211, 238, ${finalOpacity})` : `rgba(59, 130, 246, ${finalOpacity})`;
            ctx.beginPath();
            ctx.arc(projPt.x, projPt.y, size, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      });

      // ==========================================
      // 5. PROJECT TILTED ORBITAL RINGS & COMET PARTICLES
      // ==========================================
      // We will draw two overlapping glowing orbits with comets orbiting around the shield
      const orbitConfig = [
        {
          radius: 130,
          roll: 0.35,  // Z rotation
          pitch: 1.25, // X rotation
          color: 'rgba(34, 211, 238, 0.12)', // Cyan orbit line
          particleColor: '#22d3ee',
          speed: 0.015,
          trailLength: 12
        },
        {
          radius: 110,
          roll: -0.55,  // Z rotation
          pitch: 1.05, // X rotation
          color: 'rgba(59, 130, 246, 0.12)', // Blue orbit line
          particleColor: '#60a5fa',
          speed: -0.018, // orbit in opposite direction
          trailLength: 10
        }
      ];

      orbitConfig.forEach((config, oIdx) => {
        // Draw the complete static orbital ellipse rotated in 3D
        const orbitPts: Point3D[] = [];
        const numOrbitSegments = 64;
        for (let i = 0; i <= numOrbitSegments; i++) {
          const theta = (i / numOrbitSegments) * Math.PI * 2;
          const rawPt = { x: Math.cos(theta) * config.radius, y: 0, z: Math.sin(theta) * config.radius };
          const rotatedPt = rotateOrbit(rawPt.x, rawPt.y, rawPt.z, config.roll, config.pitch);
          orbitPts.push(rotatedPt);
        }

        const projOrbit = orbitPts.map(p => project(p.x, p.y, p.z, dynamicRotX, dynamicRotY));
        const orbitAvgZ = projOrbit.reduce((acc, curr) => acc + curr.z, 0) / projOrbit.length;

        // Draw Orbit Ring Outline
        drawQueue.push({
          depth: orbitAvgZ + 40, // Render slightly behind active shield elements
          draw: () => {
            ctx.strokeStyle = config.color;
            ctx.lineWidth = 0.8 * projOrbit[0].scale;
            ctx.beginPath();
            ctx.moveTo(projOrbit[0].x, projOrbit[0].y);
            for (let i = 1; i < projOrbit.length; i++) {
              ctx.lineTo(projOrbit[i].x, projOrbit[i].y);
            }
            ctx.stroke();
          }
        });

        // Calculate Orbit Particle positions (with beautiful smooth fade trail comets)
        const baseTheta = Date.now() * config.speed * 0.1;
        
        // Loop to generate trail points backwards in time
        for (let t = 0; t < config.trailLength; t++) {
          const thetaTrail = baseTheta - (t * 0.04 * (config.speed > 0 ? 1 : -1));
          const rawTrailPt = { x: Math.cos(thetaTrail) * config.radius, y: 0, z: Math.sin(thetaTrail) * config.radius };
          const rotatedTrailPt = rotateOrbit(rawTrailPt.x, rawTrailPt.y, rawTrailPt.z, config.roll, config.pitch);
          const projTrail = project(rotatedTrailPt.x, rotatedTrailPt.y, rotatedTrailPt.z, dynamicRotX, dynamicRotY);

          drawQueue.push({
            depth: projTrail.z - 2, // Force slightly in front of orbits
            draw: () => {
              const opacityPct = 1 - (t / config.trailLength);
              const alpha = opacityPct * opacityPct * 0.8 * Math.max(0.1, (130 - projTrail.z) / 150);
              const size = (t === 0 ? 3.5 : 2.5 * opacityPct) * projTrail.scale;

              if (t === 0) {
                // Main glowing lead comet particle
                ctx.shadowBlur = 10 * projTrail.scale;
                ctx.shadowColor = config.particleColor;
                ctx.fillStyle = '#ffffff';
              } else {
                ctx.shadowBlur = 0;
                ctx.fillStyle = config.particleColor;
              }

              ctx.globalAlpha = alpha;
              ctx.beginPath();
              ctx.arc(projTrail.x, projTrail.y, size, 0, Math.PI * 2);
              ctx.fill();
              ctx.globalAlpha = 1.0;
              ctx.shadowBlur = 0;
            }
          });
        }
      });

      // ==========================================
      // 6. DEPTH-SORTED RENDER DISPATCH
      // ==========================================
      // Sort elements so points with larger depth values (furthest back) render first
      drawQueue.sort((a, b) => b.depth - a.depth);
      drawQueue.forEach((item) => item.draw());

      // ==========================================
      // 7. BACKGROUND HOLO-LIGHT BLOW EFFECT
      // ==========================================
      // Add subtle background radial ambient cyan light directly behind the shield
      const bgRadius = 110 * getSceneScale();
      if (Number.isFinite(width) && Number.isFinite(height) && Number.isFinite(bgRadius) && bgRadius > 0) {
        const centerBackGlow = ctx.createRadialGradient(
          width / 2, height / 2 - 10, 5,
          width / 2, height / 2 - 10, bgRadius
        );
        centerBackGlow.addColorStop(0, 'rgba(8, 47, 73, 0.15)');
        centerBackGlow.addColorStop(0.5, 'rgba(6, 182, 212, 0.03)');
        centerBackGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = centerBackGlow;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2 - 10, bgRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over'; // Reset
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[350px] md:min-h-[450px] flex items-center justify-center relative select-none">
      <canvas ref={canvasRef} className="max-w-full max-h-full drop-shadow-[0_0_35px_rgba(34,211,238,0.2)]" />
    </div>
  );
}
