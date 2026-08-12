import React, { useState } from 'react';
import { Bot, FileText, Terminal, Layers, Code, Ban, Copy, Check, Zap, ExternalLink, MessageSquare, Send, RefreshCw } from 'lucide-react';

const TABS = [
  { id:'overview', label:'Overview',    icon:FileText },
  { id:'payload',  label:'Payload',     icon:Terminal },
  { id:'mitre',    label:'MITRE ATT&CK',icon:Layers },
  { id:'rules',    label:'Sigma & YARA',icon:Code },
  { id:'chat',     label:'GOC AI Chat', icon:MessageSquare },
];

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function AnalystDrawer({ selectedLog, onBlockIp }) {
  const [tab, setTab] = useState('overview');
  const [copied, setCopied] = useState(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hello Analyst! I am your GOC AI Agent. Ask me anything about threat mitigation, IP telemetry, or rule generation.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatLoading(true);

    try {
      const ctx = selectedLog ? `Target IP: ${selectedLog.src_ip}, Service: ${selectedLog.service}:${selectedLog.port}, Attack: ${selectedLog.attack_type}, Severity: ${selectedLog.severity}` : '';
      // Backend expects { message: string } for ChatMessageIn — send `message` field.
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { sender: 'bot', text: data.response }]);
      } else {
        setChatMessages(prev => [...prev, { sender: 'bot', text: 'Failed to connect to GOC AI Agent backend service.' }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'bot', text: `GOC AI Agent response error: ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (!selectedLog) return (
    <div className="cyber-glass" style={{
      height:'100%', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      textAlign:'center', padding:32, gap:16
    }}>
      <div style={{
        width:56, height:56, borderRadius:14,
        background:'rgba(6,182,212,0.12)', border:'1px solid rgba(6,182,212,0.3)',
        display:'flex', alignItems:'center', justifyContent:'center'
      }}>
        <Bot size={26} color="#06B6D4" />
      </div>
      <div>
        <div style={{ fontWeight:700, fontSize:14, color:'#E5E7EB', marginBottom:8 }}>Google Gemini AI Threat Analyst</div>
        <div style={{ fontSize:12, color:'#64748B', maxWidth:260, lineHeight:1.6 }}>
          Select any attack event from the Live Data Grid to view AI-generated threat analysis, MITRE ATT&CK tactics, Sigma rules, YARA signatures, and firewall rules.
        </div>
      </div>
    </div>
  );

  const log = selectedLog;
  const ai = log.ai_analysis || {};
  const mitre = log.mitre || { id:'T1046', name:'Network Service Discovery' };
  const conf = log.confidence || ai.confidence_score || 94;
  const sigma = ai.sigma_rule || `title: Detect ${log.attack_type||'Attack'}\nstatus: experimental\nlogsource:\n  category: honeypot\ndetection:\n  selection:\n    DestinationPort: ${log.port||80}\n    SrcIP: '${log.src_ip}'\n  condition: selection`;
  const yara = ai.yara_rule || `rule Detect_Exploit {\n  meta:\n    author = "CYBER-EYE Gemini AI"\n    severity = "${log.severity||'HIGH'}"\n  strings:\n    $s1 = "${log.src_ip}"\n  condition:\n    $s1\n}`;
  const fw = ai.firewall_rule || `iptables -A INPUT -s ${log.src_ip} -j DROP # Gemini AI Rule`;

  return (
    <div className="cyber-glass" style={{ height:'100%', padding:16, display:'flex', flexDirection:'column', overflow:'auto' }}>
      {/* Header */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        borderBottom:'1px solid #1F2937', paddingBottom:12, marginBottom:12
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            padding:'8px 9px', borderRadius:11,
            background:'linear-gradient(135deg,rgba(6,182,212,0.3),rgba(37,99,235,0.3))',
            border:'1px solid rgba(6,182,212,0.4)'
          }}>
            <Bot size={18} color="#38BDF8" />
          </div>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontWeight:700, fontSize:13, color:'#F9FAFB' }}>Google Gemini AI Analyst</span>
              <span style={{ fontSize:10, fontFamily:'Fira Code,monospace', fontWeight:700,
                padding:'1px 7px', borderRadius:4,
                background:'rgba(6,182,212,0.2)', border:'1px solid rgba(6,182,212,0.4)', color:'#38BDF8' }}>
                GEMINI 2.5
              </span>
            </div>
            <div style={{ fontSize:11, color:'#64748B', fontFamily:'Fira Code,monospace', marginTop:1 }}>
              Target: <span style={{color:'#22D3EE', fontWeight:700}}>{log.src_ip}</span>
              {' '}<span style={{color:'#94A3B8'}}>({log.country||'Unknown'})</span>
            </div>
          </div>
        </div>

        {onBlockIp && (
          <button onClick={() => onBlockIp(log.src_ip)} className="btn-danger"
            style={{ display:'flex', alignItems:'center', gap:5, fontSize:11 }}>
            <Ban size={13}/> Block IP
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:14, borderBottom:'1px solid #1F2937', paddingBottom:10 }}>
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display:'flex', alignItems:'center', gap:5,
              padding:'5px 10px', borderRadius:7, fontSize:11,
              fontFamily:'Fira Code,monospace', fontWeight:600, cursor:'pointer',
              background: tab===t.id ? 'rgba(37,99,235,0.25)' : 'transparent',
              border: `1px solid ${tab===t.id ? '#3B82F6' : 'transparent'}`,
              color: tab===t.id ? '#93C5FD' : '#64748B',
              transition:'all 0.2s ease'
            }}>
              <Icon size={12}/>{t.label}
            </button>
          );
        })}
      </div>

      {/* TAB: Overview */}
      {tab==='overview' && (
        <div style={{ display:'flex', flexDirection:'column', gap:12, fontSize:12 }}>
          {/* Gauges */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              { label:'Gemini Confidence', val:`${conf}%`, sub:'HIGH', color:'#22D3EE' },
              { label:'CVSS Severity',    val: log.cvss||'8.4', sub:'v3.1', color:'#FBBF24' },
            ].map((g,i) => (
              <div key={i} style={{ padding:'12px', borderRadius:10, background:'rgba(15,23,42,0.8)',
                border:'1px solid #1F2937', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:10.5, color:'#64748B', fontFamily:'Fira Code,monospace', marginBottom:4 }}>{g.label}</div>
                  <div style={{ fontFamily:'Fira Code,monospace', fontWeight:900, fontSize:24, color:g.color }}>{g.val}</div>
                </div>
                <div style={{
                  width:42, height:42, borderRadius:'50%',
                  border:`2px solid ${g.color}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:9, fontFamily:'Fira Code,monospace', color:g.color, fontWeight:700
                }}>{g.sub}</div>
              </div>
            ))}
          </div>

          {/* Gemini AI Reasoning */}
          <div style={{ padding:'12px 14px', borderRadius:10, background:'rgba(15,23,42,0.7)', border:'1px solid #1F2937' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8, fontWeight:700, color:'#E5E7EB', fontSize:12 }}>
              <Zap size={13} color="#FBBF24"/> Google Gemini Threat Assessment
            </div>
            <p style={{ color:'#CBD5E1', lineHeight:1.7, fontSize:11.5 }}>
              {ai.reasoning || log.ai_summary || 'Gemini AI threat engine classified payload matching automated botnet probe.'}
            </p>
          </div>

          {/* Recommended Action */}
          <div style={{ padding:'10px 14px', borderRadius:10,
            background:'rgba(6,78,59,0.2)', border:'1px solid rgba(16,185,129,0.35)' }}>
            <div style={{ fontWeight:700, color:'#34D399', fontSize:12, marginBottom:6 }}>✓ Recommended Defensive Action</div>
            <p style={{ color:'#A7F3D0', fontSize:11, fontFamily:'Fira Code,monospace', lineHeight:1.65 }}>
              {ai.recommended_action || `Apply iptables DROP rule for ${log.src_ip} on port ${log.port||80}.`}
            </p>
          </div>

          {/* IOC */}
          <div style={{ padding:'12px 14px', borderRadius:10, background:'rgba(15,23,42,0.7)', border:'1px solid #1F2937', fontFamily:'Fira Code,monospace', fontSize:11 }}>
            <div style={{ fontWeight:700, color:'#E5E7EB', marginBottom:8, fontSize:12 }}>Indicators of Compromise (IOC)</div>
            {[
              ['IPv4 Address', log.src_ip, '#22D3EE'],
              ['Target Service', `${log.service} (Port ${log.port})`, '#E5E7EB'],
              ['Attack Category', log.attack_type||'Unknown', '#E5E7EB'],
              ['MITRE Technique', `${mitre.id} — ${mitre.name}`, '#C4B5FD'],
            ].map(([k,v,c],j) => (
              <div key={j} style={{
                display:'flex', justifyContent:'space-between', gap:12,
                padding:'6px 8px', borderRadius:6, marginBottom:4,
                background:'rgba(15,23,42,0.9)'
              }}>
                <span style={{color:'#475569'}}>{k}:</span>
                <span style={{color:c, fontWeight:700, textAlign:'right'}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Payload */}
      {tab==='payload' && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', justifyBetween:'space-between' }}>
            <span style={{ fontWeight:700, color:'#E5E7EB', fontSize:12 }}>Raw Ingress Payload</span>
            <button onClick={() => copy(log.payload||'','payload')}
              style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px',
                borderRadius:6, background:'rgba(30,41,59,0.8)', border:'1px solid #1F2937',
                color:'#94A3B8', fontSize:11, cursor:'pointer', fontFamily:'Fira Code,monospace' }}>
              {copied==='payload' ? <Check size={12} color="#4ADE80"/> : <Copy size={12}/>}
              {copied==='payload' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre style={{
            padding:'14px', borderRadius:10, background:'#000',
            border:'1px solid #1F2937', color:'#4ADE80',
            fontSize:11, fontFamily:'Fira Code,monospace',
            whiteSpace:'pre-wrap', wordBreak:'break-all',
            overflowY:'auto', maxHeight:360
          }}>{log.payload||'No payload captured.'}</pre>
        </div>
      )}

      {/* TAB: MITRE */}
      {tab==='mitre' && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ padding:'14px 16px', borderRadius:10,
            background:'rgba(76,29,149,0.15)', border:'1px solid rgba(139,92,246,0.35)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyBetween:'space-between', marginBottom:10 }}>
              <span style={{
                fontFamily:'Fira Code,monospace', fontWeight:700, fontSize:11,
                padding:'2px 8px', borderRadius:5,
                background:'rgba(76,29,149,0.4)', border:'1px solid rgba(139,92,246,0.4)', color:'#C4B5FD'
              }}>MITRE ATT&CK — {mitre.id}</span>
              <a href={`https://attack.mitre.org/techniques/${mitre.id.replace('.','/').replace('.','/') }`}
                target="_blank" rel="noreferrer"
                style={{ display:'flex', alignItems:'center', gap:4, color:'#A78BFA', fontSize:11, fontFamily:'Fira Code,monospace' }}>
                Matrix View <ExternalLink size={11}/>
              </a>
            </div>
            <div style={{ fontWeight:700, fontSize:14, color:'#F9FAFB', marginBottom:8 }}>{mitre.name}</div>
            <p style={{ color:'#CBD5E1', fontSize:11.5, lineHeight:1.7 }}>
              Adversaries probe network ports to identify active services on the target ESP32 honeypot endpoint.
            </p>
          </div>
        </div>
      )}

      {/* TAB: Rules */}
      {tab==='rules' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14, fontSize:11, fontFamily:'Fira Code,monospace' }}>
          {[
            { label:'Generated Sigma Detection Rule', key:'sigma', color:'#FBBF24', code:sigma },
            { label:'Generated YARA Signature',       key:'yara',  color:'#60A5FA', code:yara },
            { label:'IPTables Firewall DROP Rule',    key:'fw',    color:'#F87171', code:fw },
          ].map(r => (
            <div key={r.key}>
              <div style={{ display:'flex', alignItems:'center', justifyBetween:'space-between', marginBottom:6 }}>
                <span style={{ fontWeight:700, color:r.color }}>{r.label}</span>
                <button onClick={() => copy(r.code, r.key)}
                  style={{ padding:'3px 9px', borderRadius:5, cursor:'pointer',
                    background:'rgba(30,41,59,0.8)', border:'1px solid #1F2937', color:'#94A3B8', fontSize:10 }}>
                  {copied===r.key ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <pre style={{ padding:'10px 12px', borderRadius:8, background:'#000',
                border:`1px solid ${r.color}25`, color:r.color,
                fontSize:10.5, whiteSpace:'pre-wrap', overflowX:'auto' }}>{r.code}</pre>
            </div>
          ))}
        </div>
      )}

      {/* TAB: Gemini AI Chat Assistant */}
      {tab==='chat' && (
        <div style={{ display:'flex', flexDirection:'column', height:'100%', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', justifyBetween:'space-between', borderBottom:'1px solid #1F2937', pb:6 }}>
            <span style={{ fontWeight:700, color:'#38BDF8', fontSize:12, display:'flex', alignItems:'center', gap:6 }}>
              <Bot size={15}/> Gemini Cyber Defense Assistant
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
            <button onClick={() => setChatInput('Collect logs for this attack')} className="btn-ghost" style={{ fontSize: 10, padding: '4px 8px' }}>Collect Logs</button>
            <button onClick={() => setChatInput(`What is the reputation of attacker IP ${log.src_ip}?`)} className="btn-ghost" style={{ fontSize: 10, padding: '4px 8px' }}>Analyze IP</button>
            <button onClick={() => setChatInput('Generate a defensive Python script to block this attacker')} className="btn-primary" style={{ fontSize: 10, padding: '4px 8px' }}>Generate Defense</button>
          </div>

          <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:8, paddingRight:4, maxHeight:260 }}>
            {chatMessages.map((m, idx) => (
              <div key={idx} style={{
                padding:'8px 12px', borderRadius:8,
                background: m.sender === 'user' ? 'rgba(37,99,235,0.2)' : 'rgba(15,23,42,0.9)',
                border: `1px solid ${m.sender === 'user' ? 'rgba(37,99,235,0.4)' : '#1F2937'}`,
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '90%', fontSize: 11.5, color: '#F9FAFB', lineHeight: 1.5
              }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: m.sender === 'user' ? '#93C5FD' : '#38BDF8', marginBottom: 2 }}>
                  {m.sender === 'user' ? 'Analyst' : 'Google Gemini AI'}
                </div>
                <div>{m.text}</div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ display:'flex', alignItems:'center', gap:6, color:'#38BDF8', fontSize:11 }}>
                <RefreshCw size={12} className="animate-spin" /> Gemini AI is analyzing defense rules...
              </div>
            )}
          </div>

          <form onSubmit={handleSendChat} style={{ display:'flex', gap:6, marginTop:'auto' }}>
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask Gemini AI (e.g. How to block IP 187.19.210.4?)..."
              className="soc-input"
              style={{ flex:1 }}
            />
            <button type="submit" className="btn-primary" style={{ display:'flex', alignItems:'center', gap:4 }}>
              <Send size={12}/> Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
