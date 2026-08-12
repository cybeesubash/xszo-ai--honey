import React, { useState } from 'react';
import { 
  ChevronDown, ChevronRight, Copy, Download, 
  ExternalLink, Ban, Search, Filter, Globe, Cpu, Terminal, Layers, Shield
} from 'lucide-react';
import { formatTime } from '../lib/api';

const SERVICE_ICONS = {
  http: Globe,
  telnet: Terminal,
  ssh: Cpu,
  ftp: Layers,
};

export default function LiveFeed({ logs, selectedIp, onSelectIp, onBlockIp, onShowMap }) {
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [copiedIp, setCopiedIp] = useState(null);

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  const copyIp = (ip, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const exportLogJson = (log, e) => {
    e.stopPropagation();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(log, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `event_${log.id}_${log.ip}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredLogs = logs.filter(log => {
    if (severityFilter !== 'ALL' && (log.severity || '').toUpperCase() !== severityFilter) return false;
    if (serviceFilter !== 'ALL' && (log.service || '').toLowerCase() !== serviceFilter.toLowerCase()) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        log.ip?.toLowerCase().includes(q) ||
        log.attack_type?.toLowerCase().includes(q) ||
        log.service?.toLowerCase().includes(q) ||
        log.country?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getRiskClass = (sev) => {
    const s = (sev || 'low').toLowerCase();
    if (s === 'critical' || s === 'high') return 'text-red-400 font-extrabold uppercase';
    if (s === 'medium') return 'text-orange-400 font-extrabold uppercase';
    return 'text-green-400 font-extrabold uppercase';
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0B1220] flex flex-col overflow-hidden shadow-2xl h-full">
      {/* Header & Filter Controls */}
      <div className="p-4 bg-[#0B1220] border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="font-extrabold text-xs tracking-wider uppercase text-white font-mono">
            LIVE ATTACKS FEED
          </h2>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/35">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse pulse-critical" />
            <span className="text-[9px] font-extrabold font-mono text-rose-400 tracking-wider">LIVE</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Search */}
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#050811] border border-white/5 text-slate-200 text-[10px] rounded-lg pl-7 pr-2.5 py-1.5 focus:outline-none focus:border-cyan-500/50 font-mono w-32 placeholder:text-slate-600"
            />
          </div>

          {/* Severity Dropdown */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#050811] border border-white/5 text-slate-300 text-[10px] rounded-lg px-2 py-1.5 focus:outline-none focus:border-cyan-500/50 font-mono"
          >
            <option value="ALL">All Risk</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Service Dropdown */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="bg-[#050811] border border-white/5 text-slate-300 text-[10px] rounded-lg px-2 py-1.5 focus:outline-none focus:border-cyan-500/50 font-mono"
          >
            <option value="ALL">All Services</option>
            <option value="http">HTTP (80)</option>
            <option value="ssh">SSH (22)</option>
            <option value="telnet">Telnet (23)</option>
            <option value="ftp">FTP (21)</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto flex-1 max-h-[350px] overflow-y-auto">
        <table className="w-full text-left border-collapse font-mono">
          <thead>
            <tr className="border-b border-white/5 text-slate-500 text-[9px] font-extrabold uppercase">
              <th className="py-2.5 px-4 w-6"></th>
              <th className="py-2.5 px-2">TIME</th>
              <th className="py-2.5 px-2">ATTACKER IP</th>
              <th className="py-2.5 px-2">COUNTRY</th>
              <th className="py-2.5 px-2">PORT</th>
              <th className="py-2.5 px-2">SERVICE</th>
              <th className="py-2.5 px-2">TYPE</th>
              <th className="py-2.5 px-2">RISK</th>
              <th className="py-2.5 px-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-10 text-slate-600 text-xs font-mono">
                  No threat events matching filter parameters.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const isSelected = selectedIp === log.ip;
                const isExpanded = expandedId === log.id;
                const sev = (log.severity || 'low').toLowerCase();

                return (
                  <React.Fragment key={log.id}>
                    <tr 
                      className={`text-xs transition-colors hover:bg-white/[0.02] cursor-pointer ${
                        isSelected ? 'bg-cyan-500/5' : ''
                      }`}
                      onClick={() => onSelectIp(log.ip)}
                    >
                      <td className="py-2.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className="text-slate-500 hover:text-white p-0.5"
                          onClick={(e) => toggleExpand(log.id, e)}
                        >
                          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        </button>
                      </td>
                      <td className="py-2.5 px-2 text-slate-400 text-[11px]">
                        {formatTime(log.timestamp)}
                      </td>
                      <td className="py-2.5 px-2 text-cyan-400 font-bold text-[11px]">
                        {log.ip}
                      </td>
                      <td className="py-2.5 px-2 text-slate-300 text-[11px]">
                        <span className="mr-1.5">{log.flag || '🌐'}</span>
                        <span>{log.country || 'Unknown'}</span>
                      </td>
                      <td className="py-2.5 px-2 text-slate-400 text-[11px]">
                        {log.port || 80}
                      </td>
                      <td className="py-2.5 px-2 text-slate-200 text-[11px] uppercase font-bold">
                        {log.service || 'HTTP'}
                      </td>
                      <td className="py-2.5 px-2 text-slate-200 text-[11px]">
                        {log.attack_type || 'Probe Activity'}
                      </td>
                      <td className="py-2.5 px-2 text-[10px]">
                        <span className={getRiskClass(sev)}>
                          {sev === 'critical' ? 'critical' : sev === 'high' ? 'high' : sev === 'medium' ? 'medium' : 'low'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            className="p-1 rounded bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 transition-colors"
                            onClick={() => onSelectIp(log.ip)}
                            title="Investigate Attacker"
                          >
                            <ExternalLink size={10} />
                          </button>
                          <button
                            className="p-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                            onClick={() => onBlockIp(log.ip)}
                            title="Block Attacker IP"
                          >
                            <Ban size={10} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Inspection Drawer */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={9} className="p-4 bg-[#050811] border-y border-white/5">
                          <div className="space-y-3 font-mono text-[11px]">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold uppercase tracking-wider text-cyan-400">
                                PACKET INSPECTION & threat INTEL
                              </span>
                              <div className="flex items-center gap-2">
                                <button 
                                  className="px-2 py-0.5 rounded border border-white/10 hover:bg-white/5 text-[10px] text-slate-300"
                                  onClick={(e) => copyIp(log.ip, e)}
                                >
                                  {copiedIp === log.ip ? 'Copied' : 'Copy IP'}
                                </button>
                                <button 
                                  className="px-2 py-0.5 rounded border border-white/10 hover:bg-white/5 text-[10px] text-slate-300"
                                  onClick={(e) => exportLogJson(log, e)}
                                >
                                  Export JSON
                                </button>
                              </div>
                            </div>

                            {log.summary && (
                              <div className="p-2.5 rounded bg-cyan-950/20 border border-cyan-500/20 text-cyan-300">
                                <span className="font-bold text-cyan-400">Summary: </span>
                                {log.summary}
                              </div>
                            )}

                            <div>
                              <span className="text-slate-500 block mb-1 text-[10px]">Raw Network Capture:</span>
                              <pre className="p-2.5 rounded bg-[#0B1220] border border-white/5 text-slate-200 overflow-x-auto max-h-24 text-[10px]">
                                {log.payload || '[TCP handshake probe — no raw HTTP content]'}
                              </pre>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                              <div className="p-2.5 rounded bg-[#0B1220]/50 border border-white/5">
                                <span className="text-slate-500 block mb-1 font-bold text-[10px]">Indicators:</span>
                                <ul className="list-disc pl-4 space-y-0.5 text-slate-300 text-[10px]">
                                  {log.indicators && log.indicators.length > 0 ? (
                                    log.indicators.map((ind, i) => <li key={i}>{ind}</li>)
                                  ) : (
                                    <li>Connection probe attempt on port {log.port}</li>
                                  )}
                                </ul>
                              </div>
                              <div className="p-2.5 rounded bg-[#0B1220]/50 border border-white/5">
                                <span className="text-slate-500 block mb-1 font-bold text-[10px]">Recommended Action:</span>
                                <p className="text-slate-300 text-[10px]">
                                  {log.recommended_action || `Enforce perimeter dropping rule for IP ${log.ip}.`}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
