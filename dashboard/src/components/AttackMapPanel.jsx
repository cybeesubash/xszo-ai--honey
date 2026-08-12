/**
 * AttackMapPanel.jsx — Inline mini 3D globe shown on main dashboard.
 * Uses the same <AttackMap> canvas component in mini mode.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import AttackMap from './AttackMap';

export default function AttackMapPanel({ visible, logs = [], topCountries }) {
  if (!visible) return null;
  return (
    <motion.div
      className="panel p-0 overflow-hidden"
      style={{ borderRadius: 16 }}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-white/[0.05] bg-slate-900/40">
        <Globe size={14} className="text-cyan-400" />
        <span className="text-xs font-bold font-mono text-slate-200">Live Threat Globe</span>
        <span className="ml-auto text-[9px] font-mono text-slate-500">{logs.length} events</span>
      </div>
      {/* Globe */}
      <div style={{ height: 260 }}>
        <AttackMap logs={logs} mini />
      </div>
    </motion.div>
  );
}
