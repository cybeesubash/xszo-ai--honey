import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { AttackEvent } from '../types';
import { Clock, Info } from 'lucide-react';

interface TemporalHeatmapProps {
  attacks: AttackEvent[];
}

interface HoveredCellState {
  day: number;
  hour: number;
  count: number;
  x: number;
  y: number;
}

export default function TemporalHeatmap({ attacks }: TemporalHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredCell, setHoveredCell] = useState<HoveredCellState | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 260 });

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Set up resize observer for fluid responsiveness
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        setDimensions({
          width: Math.max(width, 320),
          height: 250
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // 1. Prepare temporal mapping matrix at render level for dynamic scale access
  const { gridData, maxCount } = React.useMemo<{ gridData: Array<{ day: number; hour: number; count: number }>; maxCount: number }>(() => {
    const data: Array<{ day: number; hour: number; count: number }> = [];
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        data.push({ day: d, hour: h, count: 0 });
      }
    }

    // Populate data from real-time attacks stream
    attacks.forEach(atk => {
      const date = new Date(atk.timestamp);
      const d = date.getDay(); // 0-6
      const h = date.getHours(); // 0-23
      const cell = data.find(c => c.day === d && c.hour === h);
      if (cell) {
        cell.count += 1;
      }
    });

    const maxVal = d3.max(data, d => d.count) || 1;
    return { gridData: data, maxCount: maxVal };
  }, [attacks]);

  useEffect(() => {
    if (!svgRef.current) return;

    // 2. Clear old contents for fresh draw
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    const margin = { top: 20, right: 10, bottom: 35, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Append primary chart container
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // 3. Create discrete scales
    const xScale = d3.scaleBand()
      .domain(d3.range(24).map(String))
      .range([0, innerWidth])
      .padding(0.12);

    const yScale = d3.scaleBand()
      .domain(d3.range(7).map(String))
      .range([0, innerHeight])
      .padding(0.12);

    // Color ramp (Deep navy -> tech indigo -> vibrant cyan -> high-threat pink/red)
    // Dynamically scaled using a mathematically balanced 4-point linear scale division
    const step = maxCount / 3;
    const colorScale = d3.scaleLinear<string>()
      .domain([0, step, step * 2, maxCount])
      .range(["#090b20", "#1e3a8a", "#06b6d4", "#f43f5e"]);

    // 4. Render heatmap grid cells with entrance scale transition
    g.selectAll<SVGRectElement, { day: number; hour: number; count: number }>(".heat-cell")
      .data<{ day: number; hour: number; count: number }>(gridData)
      .enter()
      .append("rect")
      .attr("class", "heat-cell")
      .attr("rx", 3)
      .attr("ry", 3)
      .attr("stroke", "#040612")
      .attr("stroke-width", 1)
      .attr("fill", d => colorScale(d.count))
      .style("cursor", "crosshair")
      // Entrance Animation: Cells expand from center
      .attr("width", 0)
      .attr("height", 0)
      .attr("x", d => (xScale(String(d.hour)) || 0) + xScale.bandwidth() / 2)
      .attr("y", d => (yScale(String(d.day)) || 0) + yScale.bandwidth() / 2)
      .transition()
      .duration(400)
      .delay(d => (d.hour * 10) + (d.day * 20))
      .attr("x", d => xScale(String(d.hour)) || 0)
      .attr("y", d => yScale(String(d.day)) || 0)
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth());

    // Re-select cells to register event handlers (so transitions don't block interactivity)
    g.selectAll<SVGRectElement, { day: number; hour: number; count: number }>(".heat-cell")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("stroke", "#3b82f6")
          .attr("stroke-width", 1.5)
          .raise(); // Pull hovered element to front for border render
        
        // Setup tooltip state
        const [mx, my] = d3.pointer(event, containerRef.current);
        setHoveredCell({
          day: d.day,
          hour: d.hour,
          count: d.count,
          x: mx,
          y: my
        });
      })
      .on("mousemove", function(event) {
        const [mx, my] = d3.pointer(event, containerRef.current);
        setHoveredCell(prev => prev ? { ...prev, x: mx, y: my } : null);
      })
      .on("mouseleave", function() {
        d3.select(this)
          .attr("stroke", "#040612")
          .attr("stroke-width", 1);
        setHoveredCell(null);
      });

    // 5. Render X-Axis (Hour marks)
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => `${d.padStart(2, '0')}:00`);

    // Show only every 2nd or 3rd tick on small screens, or custom filter
    const xTicksCount = width < 500 ? 6 : 12;
    const tickFilter = (d: string) => {
      const val = parseInt(d);
      return xTicksCount === 6 ? val % 4 === 0 : val % 2 === 0;
    };

    const xAxisGroup = g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(xAxis);

    xAxisGroup.selectAll(".tick")
      .style("display", (d: any) => tickFilter(String(d)) ? "block" : "none");

    xAxisGroup.selectAll("text")
      .style("fill", "#64748b")
      .style("font-family", "monospace")
      .style("font-size", "9px")
      .attr("dy", "10px");

    // 6. Render Y-Axis (Days labels)
    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => daysShort[Number(d)]);

    const yAxisGroup = g.append("g")
      .call(yAxis);

    yAxisGroup.selectAll("text")
      .style("fill", "#94a3b8")
      .style("font-family", "monospace")
      .style("font-size", "10px")
      .style("font-weight", "bold");

    // Remove axis ticks lines and outline domains
    g.selectAll(".domain").remove();
    g.selectAll(".tick line").remove();

  }, [dimensions, gridData, maxCount]);

  // Aggregate stats
  const totalCaptured = attacks.length;

  // Generate intelligent dynamic legend thresholds based on actual maxCount
  const legendItems = React.useMemo(() => {
    if (maxCount === 0) {
      return [
        { color: "#090b20", label: "0 hits" }
      ];
    }
    if (maxCount === 1) {
      return [
        { color: "#090b20", label: "0 hits" },
        { color: "#f43f5e", label: "1 hit" }
      ];
    }
    if (maxCount === 2) {
      return [
        { color: "#090b20", label: "0 hits" },
        { color: "#1e3a8a", label: "1 hit" },
        { color: "#f43f5e", label: "2 hits" }
      ];
    }
    const lowMax = Math.floor(maxCount / 3);
    const medMin = lowMax + 1;
    const medMax = Math.floor((2 * maxCount) / 3);
    const peakMin = medMax + 1;

    return [
      { color: "#090b20", label: "0 hits" },
      { color: "#1e3a8a", label: `Low (1-${lowMax})` },
      { color: "#06b6d4", label: `Medium (${medMin}-${medMax})` },
      { color: "#f43f5e", label: `Peak (${peakMin}-${maxCount})` }
    ];
  }, [maxCount]);

  return (
    <div className="w-full flex flex-col justify-between" id="heatmap-panel-root" ref={containerRef}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-400 font-mono mb-2 gap-2">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Intrusion Temporal Heatmap: Weekday vs Hour of Day</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-500">
          <Info className="w-3 h-3" />
          <span>Hover cells for event logs</span>
        </div>
      </div>

      {/* SVG Canvas Holder */}
      <div className="relative w-full bg-[#050611] border border-blue-950/40 rounded-xl p-2 overflow-hidden">
        <svg 
          ref={svgRef} 
          width={dimensions.width} 
          height={dimensions.height}
          className="overflow-visible block mx-auto"
        />

        {/* Custom Rich Overlay Tooltip (Relative to container) */}
        {hoveredCell && (
          <div 
            className="absolute z-10 p-3 bg-slate-950/95 border border-blue-500/50 rounded-lg shadow-xl text-xs font-mono text-gray-200 pointer-events-none backdrop-blur-md transition-all duration-75 space-y-1"
            style={{ 
              left: `${hoveredCell.x + 15}px`, 
              top: `${hoveredCell.y - 10}px`,
              transform: hoveredCell.x > dimensions.width - 150 ? 'translateX(-110%)' : 'none'
            }}
          >
            <div className="text-blue-400 font-bold border-b border-blue-900/40 pb-1 mb-1 flex items-center justify-between gap-4">
              <span>{daysOfWeek[hoveredCell.day]}</span>
              <span>{String(hoveredCell.hour).padStart(2, '0')}:00 hrs</span>
            </div>
            <div className="flex justify-between items-center gap-6">
              <span className="text-gray-500 text-[10px] uppercase">ATTACK INTENSITY:</span>
              <span className="text-white font-black text-sm">{hoveredCell.count} <span className="text-[10px] text-gray-400 font-normal">hits</span></span>
            </div>
            {hoveredCell.count > 0 && (
              <div className="text-[9px] text-gray-400">
                {Math.round((hoveredCell.count / totalCaptured) * 100)}% of total SOC telemetry
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grid Legend Scale */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 text-[10px] font-mono text-gray-500 px-1 border-t border-blue-950/20 pt-2 gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span>Scale:</span>
          {legendItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: item.color, border: item.color === "#090b20" ? "1px solid rgba(30, 58, 138, 0.4)" : "none" }}></span>
              <span className="text-[9px]">{item.label}</span>
            </div>
          ))}
        </div>

        <span>Dynamic scale based on actual attacks (Max: {maxCount})</span>
      </div>
    </div>
  );
}
