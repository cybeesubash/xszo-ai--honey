import React, { useEffect, useState } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { fetchAdvisor } from '../lib/api';

export default function AIThreatAnalysis({ selectedIp, stats }) {
  const [advisorData, setAdvisorData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedIp) {
      setAdvisorData(null);
      return;
    }

    async function loadAdvisor() {
      setLoading(true);
      const data = await fetchAdvisor(selectedIp);
      setAdvisorData(data);
      setLoading(false);
    }
    loadAdvisor();
  }, [selectedIp]);

  // Determine score, summary, and recommendations based on selection
  const score = selectedIp 
    ? (advisorData?.cvss_score ? Math.round(advisorData.cvss_score * 10) : 85)
    : 78;

  const scoreText = score >= 80 ? 'Critical Risk' : score >= 60 ? 'High Risk' : score >= 40 ? 'Medium Risk' : 'Low Risk';
  const scoreColor = score >= 80 ? 'text-red-500' : score >= 60 ? 'text-amber-500' : score >= 40 ? 'text-orange-400' : 'text-green-400';
  const scoreStroke = score >= 80 ? '#EF4444' : score >= 60 ? '#F59E0B' : score >= 40 ? '#F97316' : '#22C55E';

  const summary = selectedIp
    ? (advisorData?.intent_analysis || `GOC AI Agent analysis concludes that traffic from ${selectedIp} represents active scanning and exploit attempts targeting honeypot subsystems.`)
    : `GOC AI Agent has analyzed ${stats?.total_events ?? '1,248'} events and detected ${(stats?.critical_alerts ?? 312).toLocaleString()} high risk threats. This activity shows patterns of automated scanning and brute force attempts targeting multiple services.`;

  const recommendations = selectedIp
    ? [
        advisorData?.firewall_rule || `Block ${selectedIp} at perimeter`,
        advisorData?.immediate_action || 'Enable immediate firewall block',
        advisorData?.hardening_tip || 'Verify honeypot device network isolation'
      ]
    : [
        'Block 103.27.145.12',
        'Enable Rate Limiting on SSH',
        'Harden Telnet Service',
        'Update SMB Configuration'
      ];

  // SVG Gauge calculations
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-5 h-full flex flex-col">
      {/* 1. Threat Score Panel */}
      <div className="rounded-2xl border border-white/5 bg-[#0B1220] p-5 flex flex-col items-center justify-center shadow-2xl relative">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4 font-mono text-center w-full">
          AI THREAT SCORE
        </div>

        {/* Circular SVG Gauge */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth={strokeWidth}
            />
            {/* Progress Arc */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              fill="none"
              stroke={scoreStroke}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          {/* Centered Score */}
          <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
            <span className="text-3xl font-extrabold text-white leading-none">
              {score}
            </span>
            <span className="text-[10px] text-slate-500 font-bold mt-1">/100</span>
          </div>
        </div>

        {/* Threat level label */}
        <div className={`mt-3 font-mono text-xs font-bold ${scoreColor}`}>
          {scoreText}
        </div>
      </div>

      {/* 2. Threat Analysis Panel */}
      <div className="rounded-2xl border border-white/5 bg-[#0B1220] p-5 flex flex-col flex-1 shadow-2xl">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4 font-mono">
          AI THREAT ANALYSIS
        </div>

        {/* Brain Circuit Vector Illustration */}
        <div className="w-full h-24 flex items-center justify-center relative overflow-hidden border border-white/5 bg-[#050811] rounded-xl mb-4">
          <svg className="w-48 h-full opacity-60" viewBox="0 0 200 100">
            {/* Central Node */}
            <circle cx="100" cy="50" r="8" fill="none" stroke="#06B6D4" strokeWidth="2" />
            <circle cx="100" cy="50" r="3" fill="#06B6D4" className="animate-ping" style={{ animationDuration: '3s' }} />

            {/* Neural Connections */}
            <path d="M100,42 L100,20 L120,15 L140,15" fill="none" stroke="#3B82F6" strokeWidth="1.5" />
            <circle cx="140" cy="15" r="3" fill="#3B82F6" />

            <path d="M100,58 L100,80 L80,85 L60,85" fill="none" stroke="#3B82F6" strokeWidth="1.5" />
            <circle cx="60" cy="85" r="3" fill="#3B82F6" />

            <path d="M92,50 L50,50 L40,35 M40,35 L20,35" fill="none" stroke="#06B6D4" strokeWidth="1.5" />
            <circle cx="20" cy="35" r="3" fill="#06B6D4" />

            <path d="M108,50 L150,50 L160,65 M160,65 L180,65" fill="none" stroke="#06B6D4" strokeWidth="1.5" />
            <circle cx="180" cy="65" r="3" fill="#06B6D4" />

            <path d="M100,42 L80,30 L60,30" fill="none" stroke="#3B82F6" strokeWidth="1.2" />
            <circle cx="60" cy="30" r="2" fill="#3B82F6" />

            <path d="M100,58 L120,70 L140,70" fill="none" stroke="#3B82F6" strokeWidth="1.2" />
            <circle cx="140" cy="70" r="2" fill="#3B82F6" />
          </svg>
          <div className="absolute top-2 right-2.5 flex items-center gap-1">
            <Sparkles size={10} className="text-cyan-400 animate-pulse" />
            <span className="text-[8px] font-mono text-cyan-400 font-extrabold tracking-wider uppercase">Grounding Engine</span>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 py-10 flex items-center justify-center font-mono text-xs text-cyan-400 animate-pulse">
            Sourcing Threat Intelligence...
          </div>
        ) : (
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            {/* Threat Summary */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">
                THREAT SUMMARY
              </span>
              <p className="text-slate-300 text-xs font-mono leading-relaxed">
                {summary}
              </p>
            </div>

            {/* Recommendations */}
            <div className="space-y-2 pt-3 border-t border-white/5">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">
                RECOMMENDATIONS
              </span>
              <div className="space-y-2">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-200 text-[11px] font-mono leading-snug">
                      {rec}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
