import React from 'react';
import { formatTime } from '../lib/api';

export default function RecentAIReports({ logs = [], onViewAll }) {
  const getDisplayReports = () => {
    if (logs && logs.length > 0) {
      return logs.slice(0, 4).map((log) => {
        const score = log.cvss_score 
          ? Math.round(log.cvss_score * 10) 
          : (log.severity?.toLowerCase() === 'critical' ? 95 : log.severity?.toLowerCase() === 'high' ? 85 : 60);
          
        return {
          id: log.id,
          time: formatTime(log.timestamp),
          summary: log.summary || `AI classified threat activity from ${log.ip} targeting ${log.service}.`,
          score,
          type: log.attack_type || 'Unknown Activity',
          recommendation: log.recommended_action || 'Block IP at firewall'
        };
      });
    }

    return [
      {
        id: '1',
        time: '10:24:31',
        summary: 'Multiple SSH brute force attempts from 103.27.145.12',
        score: 95,
        type: 'Brute Force',
        recommendation: 'Block IP + Enable Fail2Ban'
      },
      {
        id: '2',
        time: '10:24:21',
        summary: 'SMB exploit attempt detected from 45.77.232.11',
        score: 90,
        type: 'Exploit Attempt',
        recommendation: 'Update SMB + Block IP'
      },
      {
        id: '3',
        time: '10:24:15',
        summary: 'RDP brute force attack from 203.0.113.45',
        score: 85,
        type: 'Brute Force',
        recommendation: 'Enable Account Lockout'
      },
      {
        id: '4',
        time: '10:24:01',
        summary: 'Web scanning activity from multiple IPs',
        score: 60,
        type: 'Web Probe',
        recommendation: 'Monitor & Rate Limit'
      }
    ];
  };

  const reports = getDisplayReports();

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-red-500 font-extrabold';
    if (score >= 75) return 'text-amber-500 font-bold';
    return 'text-orange-400 font-bold';
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0B1220] p-5 shadow-2xl w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-extrabold text-xs tracking-wider uppercase text-white font-mono">
          RECENT AI ANALYSIS REPORTS
        </h2>
        <button 
          onClick={onViewAll}
          className="px-2.5 py-1 text-[10px] font-bold font-mono border border-white/5 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          VIEW ALL
        </button>
      </div>

      {/* Table grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono">
          <thead>
            <tr className="border-b border-white/5 text-[9px] font-extrabold text-slate-500 uppercase">
              <th className="py-2.5 px-3 w-20">TIME</th>
              <th className="py-2.5 px-3">ATTACK SUMMARY</th>
              <th className="py-2.5 px-3 w-32">AI RISK SCORE</th>
              <th className="py-2.5 px-3 w-36">THREAT TYPE</th>
              <th className="py-2.5 px-3">RECOMMENDATION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02] text-xs">
            {reports.map((rep) => (
              <tr key={rep.id} className="hover:bg-white/[0.01] transition-colors">
                <td className="py-2.5 px-3 text-slate-400">{rep.time}</td>
                <td className="py-2.5 px-3 text-slate-200 font-bold max-w-[400px] truncate" title={rep.summary}>
                  {rep.summary}
                </td>
                <td className="py-2.5 px-3">
                  <span className={getScoreColor(rep.score)}>
                    {rep.score}/100
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-300 font-semibold">{rep.type}</td>
                <td className="py-2.5 px-3 text-slate-400">{rep.recommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
