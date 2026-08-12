import React, { useState } from 'react';
import { ShieldAlert, ExternalLink, Ban } from 'lucide-react';

export default function TopAttackers({ stats, logs, onBlockIp }) {
  const [whoisModal, setWhoisModal] = useState(null);

  const realAttackers = (stats?.top_attacker_ips || []).map((item) => {
    const matchingLog = (logs || []).find((l) => l.ip === item.ip);
    return {
      ip: item.ip,
      country: item.country || matchingLog?.country || 'Unknown',
      flag: matchingLog?.country_code === 'RU' ? '🇷🇺' : matchingLog?.country_code === 'UA' ? '🇺🇦' : matchingLog?.country_code === 'CN' ? '🇨🇳' : matchingLog?.country_code === 'US' ? '🇺🇸' : '🌐',
      isp: matchingLog?.service ? `Service: ${matchingLog.service.toUpperCase()}` : 'Honeypot Target',
      attempts: item.count,
      riskScore: Math.min(99, item.count * 15 + 40),
      lat: 0,
      lng: 0,
    };
  });

  const attackers = realAttackers.length > 0 ? realAttackers : [];

  return (
    <div className="cyber-glass" style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldAlert size={16} color="#FB923C" />
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#F9FAFB' }}>Top Threat Actor IPs</h3>
            <p style={{ fontSize: 10, color: '#64748B' }}>High-volume botnets & adversary clusters</p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowX: 'auto', borderRadius: 8, border: '1px solid #1F2937', background: 'rgba(6,10,20,0.85)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'Fira Code,monospace' }}>
          <thead>
            <tr style={{ background: '#0F172A', color: '#94A3B8', borderBottom: '1px solid #1F2937' }}>
              <th style={{ padding: '8px 10px', textAlign: 'left' }}>Attacker</th>
              <th style={{ padding: '8px 10px', textAlign: 'left' }}>ISP / ASN</th>
              <th style={{ padding: '8px 10px', textAlign: 'left' }}>Attempts</th>
              <th style={{ padding: '8px 10px', textAlign: 'left' }}>Risk</th>
              <th style={{ padding: '8px 10px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {attackers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
                  No attacker telemetry collected yet. Monitoring active honeypot ingress...
                </td>
              </tr>
            ) : (
              attackers.map((actor, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #111827' }} className="soc-row">
                <td style={{ padding: '8px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{actor.flag}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#22D3EE' }}>{actor.ip}</div>
                      <div style={{ fontSize: 9, color: '#64748B' }}>{actor.country}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '8px 10px', color: '#94A3B8', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={actor.isp}>
                  {actor.isp}
                </td>
                <td style={{ padding: '8px 10px', fontWeight: 700, color: '#FBBF24' }}>{actor.attempts}</td>
                <td style={{ padding: '8px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 40, height: 5, background: '#1E293B', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${actor.riskScore}%`, height: '100%', background: 'linear-gradient(90deg,#F59E0B,#EF4444)' }} />
                    </div>
                    <span style={{ fontSize: 10, color: '#F87171', fontWeight: 700 }}>{actor.riskScore}</span>
                  </div>
                </td>
                <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                    <button onClick={() => setWhoisModal(actor)} title="WHOIS Lookup" style={{ padding: '3px 5px', borderRadius: 4, background: '#1E293B', border: '1px solid #334155', color: '#94A3B8', cursor: 'pointer' }}>
                      <ExternalLink size={12} />
                    </button>
                    {onBlockIp && (
                      <button onClick={() => onBlockIp(actor.ip)} title="Block IP" style={{ padding: '3px 5px', borderRadius: 4, background: 'rgba(127,29,29,0.4)', border: '1px solid rgba(239,68,68,0.4)', color: '#F87171', cursor: 'pointer' }}>
                        <Ban size={12} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {whoisModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 99, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 12, padding: 20, maxWidth: 420, width: '100%', fontFamily: 'Fira Code,monospace', fontSize: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1E293B', paddingBottom: 10, marginBottom: 12 }}>
              <span style={{ fontWeight: 700, color: '#22D3EE', fontSize: 13 }}>
                {whoisModal.flag} WHOIS: {whoisModal.ip}
              </span>
              <button onClick={() => setWhoisModal(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, color: '#CBD5E1', marginBottom: 16 }}>
              <div><span style={{ color: '#64748B' }}>Country:</span> {whoisModal.country}</div>
              <div><span style={{ color: '#64748B' }}>ISP / ASN:</span> {whoisModal.isp}</div>
              <div><span style={{ color: '#64748B' }}>Coordinates:</span> Lat {whoisModal.lat}, Lng {whoisModal.lng}</div>
              <div><span style={{ color: '#64748B' }}>Threat Tags:</span> <span style={{ color: '#F87171' }}>Tor-Exit, Mirai-Botnet, Scanner</span></div>
            </div>
            <button onClick={() => setWhoisModal(null)} className="btn-primary" style={{ width: '100%' }}>Close Lookup</button>
          </div>
        </div>
      )}
    </div>
  );
}
