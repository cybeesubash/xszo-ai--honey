import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Play, Pause, Copy, Check, Search, ChevronDown, ChevronUp } from 'lucide-react';

export default function LiveTerminal({ logs = [] }) {
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (!isPaused && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isPaused]);

  const handleCopyLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.severity}] ${l.src_ip} -> Port ${l.port}: ${l.attack_type}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs = logs.filter(l => 
    !search || 
    (l.src_ip && l.src_ip.includes(search)) || 
    (l.attack_type && l.attack_type.toLowerCase().includes(search.toLowerCase())) ||
    (l.service && l.service.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ background: '#060A13', borderTop: '1px solid #1F2937', fontFamily: 'Fira Code,monospace' }}>
      {/* Console Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyBetween: 'space-between',
        padding: '6px 16px', background: '#0F172A', borderBottom: '1px solid #1F2937', fontSize: 11
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
          </div>
          <span style={{ fontWeight: 700, color: '#E5E7EB', display: 'flex', alignItems: 'center', gap: 6, marginLeft: 6 }}>
            <Terminal size={14} color="#38BDF8" />
            SOC Live Telemetry Console
          </span>
          <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.4)', color: '#93C5FD' }}>
            {logs.length} Lines
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <div style={{ position: 'relative' }}>
            <Search size={12} color="#475569" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Filter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="soc-input"
              style={{ paddingLeft: 24, width: 120 }}
            />
          </div>

          <button onClick={() => setIsPaused(!isPaused)} className="btn-ghost" style={{ padding: '4px 8px', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
            {isPaused ? <Play size={10} /> : <Pause size={10} />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>

          <button onClick={handleCopyLogs} className="btn-ghost" style={{ padding: '4px 8px', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
            {copied ? <Check size={10} color="#34D399" /> : <Copy size={10} />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button onClick={() => setIsCollapsed(!isCollapsed)} className="btn-ghost" style={{ padding: '4px 6px' }}>
            {isCollapsed ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      {!isCollapsed && (
        <div style={{ padding: 12, height: 140, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, background: '#000' }}>
          {filteredLogs.map((log, idx) => {
            const timeStr = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '--:--:--';
            return (
              <div key={log.id || idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10.5, lineHeight: 1.4 }}>
                <span style={{ color: '#475569' }}>[{timeStr}]</span>
                <span style={{
                  fontWeight: 700,
                  color: log.severity === 'CRITICAL' ? '#F87171' : log.severity === 'HIGH' ? '#FB923C' : '#4ADE80'
                }}>
                  [{log.severity || 'INFO'}]
                </span>
                <span style={{ color: '#22D3EE', fontWeight: 700 }}>{log.src_ip}</span>
                <span style={{ color: '#475569' }}>➔</span>
                <span style={{ color: '#C4B5FD' }}>[{log.service}:{log.port || 80}]</span>
                <span style={{ color: '#E5E7EB', fontWeight: 600 }}>{log.attack_type}</span>
                <span style={{ color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  | payload: {log.payload || 'N/A'}
                </span>
              </div>
            );
          })}
          <div ref={terminalEndRef} />
        </div>
      )}
    </div>
  );
}
