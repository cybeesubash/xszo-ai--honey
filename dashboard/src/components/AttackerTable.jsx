import React from 'react';

export default function AttackerTable({ stats }) {
  const topIps = stats?.top_attacker_ips || [];
  const maxCount = topIps.length > 0 ? Math.max(...topIps.map(item => item.count)) : 1;

  return (
    <div className="soc-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px' }}>
        Top Attacker IPs
      </h2>

      {topIps.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          No attacker IPs recorded yet.
        </div>
      ) : (
        <div style={{ overflowY: 'auto', flex: 1, maxHeight: '240px' }}>
          {topIps.map((item, idx) => {
            const percentage = Math.round((item.count / maxCount) * 100);
            return (
              <div
                key={item.ip || idx}
                style={{
                  marginBottom: '10px',
                  padding: '8px 10px',
                  background: 'var(--bg-dark)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                  <span className="font-mono" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                    #{idx + 1} {item.ip}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {item.count} attacks
                  </span>
                </div>
                <div style={{ width: '100%', background: '#1f293d', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${percentage}%`,
                      background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-cyan))',
                      height: '100%',
                      borderRadius: '3px',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
