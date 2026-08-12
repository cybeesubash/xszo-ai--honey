import React, { useState, useMemo } from 'react';
import { ShieldAlert, Search, Download, ChevronDown, ChevronUp, Sparkles, Ban, Clock, ArrowUpDown, Terminal, Cpu, Radio } from 'lucide-react';

const SeverityBadge = ({ sev }) => {
  const map = {
    CRITICAL: 'badge-critical',
    HIGH:     'badge-high',
    MEDIUM:   'badge-medium',
    LOW:      'badge-low',
  };
  return <span className={`badge ${map[sev] || 'badge-low'}`}>{sev}</span>;
};

export default function DataGridFeed({ logs = [], selectedLogId, onSelectLog, onBlockIp }) {
  const [search,      setSearch]      = useState('');
  const [sevFilter,   setSevFilter]   = useState('ALL');
  const [svcFilter,   setSvcFilter]   = useState('ALL');
  const [typeFilter,  setTypeFilter]  = useState('ALL');
  const [sortField,   setSortField]   = useState('timestamp');
  const [sortAsc,     setSortAsc]     = useState(false);
  const [expandedId,  setExpandedId]  = useState(null);
  const [page,        setPage]        = useState(1);
  const PER_PAGE = 10;

  const filtered = useMemo(() => {
    return logs
      .filter(l => {
        const q = search.toLowerCase();
        const matchSearch = !q || (l.src_ip||'').includes(q)
          || (l.country||'').toLowerCase().includes(q)
          || (l.attack_type||'').toLowerCase().includes(q)
          || (l.service||'').toLowerCase().includes(q);
        
        const isReal = l.is_real === true;
        const matchType = typeFilter === 'ALL' || (typeFilter === 'REAL' && isReal) || (typeFilter === 'SIM' && !isReal);

        return matchSearch
          && matchType
          && (sevFilter==='ALL' || l.severity===sevFilter)
          && (svcFilter==='ALL' || l.service===svcFilter);
      })
      .sort((a,b) => {
        let va = a[sortField], vb = b[sortField];
        if (sortField==='timestamp') { va=new Date(va||0).getTime(); vb=new Date(vb||0).getTime(); }
        return sortAsc ? (va<vb?-1:1) : (va>vb?-1:1);
      });
  }, [logs, search, sevFilter, svcFilter, typeFilter, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const rows = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const sort = (f) => { if (sortField===f) setSortAsc(v=>!v); else { setSortField(f); setSortAsc(false); } };

  const exportCSV = () => {
    const h = ['Time','Source','IP','Country','Service','Port','Attack','Severity','CVSS','Confidence'];
    const r = filtered.map(l => [l.timestamp, l.is_real ? 'REAL_ESP32' : 'SIMULATED', l.src_ip, l.country, l.service, l.port, l.attack_type, l.severity, l.cvss, l.confidence].join(','));
    const blob = new Blob([[h.join(','),...r].join('\n')], {type:'text/csv'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download=`soc_export_${Date.now()}.csv`; a.click();
  };

  const TH = ({label, field, w}) => (
    <th onClick={() => field&&sort(field)} style={{
      padding:'10px 12px', fontSize:11, fontFamily:'Fira Code,monospace',
      color:'#94A3B8', fontWeight:600, textAlign:'left', whiteSpace:'nowrap',
      background:'rgba(15,23,42,0.9)', cursor: field?'pointer':'default',
      width:w, userSelect:'none', borderBottom:'1px solid #1F2937'
    }}>
      <div style={{display:'flex',alignItems:'center',gap:4}}>
        {label}
        {field && <ArrowUpDown size={10} color="#475569"/>}
      </div>
    </th>
  );

  return (
    <div className="cyber-glass" style={{ padding:16, display:'flex', flexDirection:'column', minHeight:400 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyBetween:'space-between', marginBottom:14, gap:12, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <ShieldAlert size={16} color="#60A5FA" />
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontWeight:700, fontSize:13, color:'#F9FAFB' }}>Live Threat Stream</span>
              <span style={{
                fontSize:10, fontFamily:'Fira Code,monospace', fontWeight:700,
                background:'rgba(37,99,235,0.2)', border:'1px solid rgba(37,99,235,0.4)',
                borderRadius:5, padding:'1px 7px', color:'#93C5FD'
              }}>{filtered.length} Events</span>
            </div>
            <div style={{ fontSize:11, color:'#64748B', marginTop:1 }}>Real ESP32 Captures & Simulated Botnet Telemetry</div>
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          {/* Search */}
          <div style={{ position:'relative' }}>
            <Search size={12} color="#475569" style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)' }}/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Filter IP, Type..." className="soc-input" style={{ paddingLeft:26, width:150 }}/>
          </div>

          {/* Telemetry Source Filter */}
          <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} className="soc-input">
            <option value="ALL">All Telemetry Sources</option>
            <option value="REAL">🟢 ESP32 Real Hardware</option>
            <option value="SIM">🔵 Simulated Feed</option>
          </select>

          {/* Severity select */}
          <select value={sevFilter} onChange={e=>setSevFilter(e.target.value)} className="soc-input">
            <option value="ALL">All Severities</option>
            {['CRITICAL','HIGH','MEDIUM','LOW'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Service select */}
          <select value={svcFilter} onChange={e=>setSvcFilter(e.target.value)} className="soc-input">
            <option value="ALL">All Services</option>
            {['SSH','HTTP','Telnet','FTP','MQTT','NETWORK'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <button onClick={exportCSV} className="btn-ghost" style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 11px', fontSize:11 }}>
            <Download size={13}/> Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ flex:1, borderRadius:9, border:'1px solid #1F2937', overflow:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11, fontFamily:'Fira Code,monospace' }}>
          <thead>
            <tr>
              <TH label="#"           w={36}/>
              <TH label="Source"      w={110}/>
              <TH label="Time"        field="timestamp"   w={100}/>
              <TH label="Attacker IP" field="src_ip"      w={130}/>
              <TH label="Country"     w={130}/>
              <TH label="Service"     w={90}/>
              <TH label="Attack Type" w={190}/>
              <TH label="Severity"    field="severity"    w={90}/>
              <TH label="CVSS"        field="cvss"        w={60}/>
              <TH label="AI Intelligence (Gemini)" w={220}/>
              <TH label="Actions"     w={90}/>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={11} style={{ padding:40, textAlign:'center', color:'#475569', fontFamily:'Inter,sans-serif' }}>
                No events match your filters.
              </td></tr>
            ) : rows.map((log, i) => {
              const sel = selectedLogId === log.id;
              const exp = expandedId === log.id;
              const time = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '—';
              const rowNum = i + 1 + (page-1)*PER_PAGE;
              const isReal = log.is_real === true;

              return (
                <React.Fragment key={log.id||i}>
                  <tr
                    onClick={() => onSelectLog && onSelectLog(log)}
                    className={`soc-row${sel?' soc-row-selected':''}`}
                    style={{ cursor:'pointer', borderBottom:'1px solid #111827' }}
                  >
                    <td style={{ padding:'9px 12px', color:'#475569' }}>{rowNum}</td>
                    <td style={{ padding:'9px 12px' }}>
                      {isReal ? (
                        <span style={{
                          padding:'2px 7px', borderRadius:4,
                          background:'rgba(16,185,129,0.18)', border:'1px solid rgba(16,185,129,0.4)',
                          color:'#34D399', fontSize:9.5, fontWeight:700, display:'inline-flex', alignItems:'center', gap:4
                        }}>
                          <Cpu size={10} /> ESP32 REAL
                        </span>
                      ) : (
                        <span style={{
                          padding:'2px 7px', borderRadius:4,
                          background:'rgba(59,130,246,0.18)', border:'1px solid rgba(59,130,246,0.4)',
                          color:'#93C5FD', fontSize:9.5, fontWeight:700, display:'inline-flex', alignItems:'center', gap:4
                        }}>
                          <Radio size={10} /> SIMULATED
                        </span>
                      )}
                    </td>
                    <td style={{ padding:'9px 12px', color:'#94A3B8', whiteSpace:'nowrap' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                        <Clock size={11} color="#475569" />{time}
                      </div>
                    </td>
                    <td style={{ padding:'9px 12px', color:'#22D3EE', fontWeight:700 }}>{log.src_ip||'—'}</td>
                    <td style={{ padding:'9px 12px', color:'#E5E7EB' }}>
                      <span style={{ marginRight:5 }}>{log.flag||'🌐'}</span>{log.country||'Unknown'}
                    </td>
                    <td style={{ padding:'9px 12px' }}>
                      <span style={{ padding:'2px 8px', borderRadius:5, background:'rgba(30,41,59,0.8)',
                        border:'1px solid #1F2937', color:'#CBD5E1', fontSize:10 }}>
                        {log.service}:{log.port||80}
                      </span>
                    </td>
                    <td style={{ padding:'9px 12px', color:'#E5E7EB', fontWeight:600 }}>{log.attack_type||'Scan'}</td>
                    <td style={{ padding:'9px 12px' }}><SeverityBadge sev={log.severity}/></td>
                    <td style={{ padding:'9px 12px', color:'#FBBF24', fontWeight:700 }}>{log.cvss||'—'}</td>
                    <td style={{ padding:'9px 12px', color:'#64748B', maxWidth:220 }}>
                      <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {log.ai_summary||'GOC AI Agent threat assessment completed.'}
                      </div>
                    </td>
                    <td style={{ padding:'9px 12px' }} onClick={e=>e.stopPropagation()}>
                      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                        <button title="GOC AI Agent Analyze" onClick={() => onSelectLog && onSelectLog(log)}
                          style={{ padding:'4px 6px', borderRadius:5, cursor:'pointer',
                            background:'rgba(37,99,235,0.2)', border:'1px solid rgba(37,99,235,0.4)', color:'#93C5FD' }}>
                          <Sparkles size={12}/>
                        </button>
                        <button title="Expand Payload"
                          onClick={() => setExpandedId(exp?null:log.id)}
                          style={{ padding:'4px 6px', borderRadius:5, cursor:'pointer',
                            background:'rgba(30,41,59,0.8)', border:'1px solid #1F2937', color:'#94A3B8' }}>
                          {exp ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                        </button>
                        {onBlockIp && (
                          <button title="Block IP" onClick={() => onBlockIp(log.src_ip)}
                            style={{ padding:'4px 6px', borderRadius:5, cursor:'pointer',
                              background:'rgba(127,29,29,0.3)', border:'1px solid rgba(239,68,68,0.4)', color:'#F87171' }}>
                            <Ban size={12}/>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {exp && (
                    <tr style={{ background:'rgba(6,10,20,0.95)', borderBottom:'1px solid #1F2937' }}>
                      <td colSpan={11} style={{ padding:'10px 16px' }}>
                        <div style={{ background:'#000', borderRadius:8, border:'1px solid #1F2937', padding:'10px 14px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8, color:'#22D3EE', fontSize:11 }}>
                            <Terminal size={13}/> <strong>Raw Ingress Payload ({isReal ? 'Real ESP32 Hardware Capture' : 'Simulated Telemetry'})</strong>
                            <span style={{ color:'#475569', marginLeft:'auto' }}>{log.src_ip} → Port {log.port}</span>
                          </div>
                          <pre style={{ color:'#4ADE80', fontSize:11, whiteSpace:'pre-wrap', wordBreak:'break-all', fontFamily:'Fira Code,monospace' }}>
                            {log.payload||'No payload captured.'}
                          </pre>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display:'flex', alignItems:'center', justifyBetween:'space-between', marginTop:12,
        fontSize:11, fontFamily:'Fira Code,monospace', color:'#64748B' }}>
        <span>Page <strong style={{color:'#E5E7EB'}}>{page}</strong> of <strong style={{color:'#E5E7EB'}}>{totalPages}</strong></span>
        <div style={{ display:'flex', gap:6 }}>
          <button disabled={page===1} onClick={() => setPage(p=>p-1)} className="btn-ghost"
            style={{ padding:'4px 12px', opacity:page===1?0.4:1, cursor:page===1?'not-allowed':'pointer', fontSize:11 }}>← Prev</button>
          <button disabled={page===totalPages} onClick={() => setPage(p=>p+1)} className="btn-ghost"
            style={{ padding:'4px 12px', opacity:page===totalPages?0.4:1, cursor:page===totalPages?'not-allowed':'pointer', fontSize:11 }}>Next →</button>
        </div>
      </div>
    </div>
  );
}
