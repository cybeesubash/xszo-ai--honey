import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Globe, MapPin, Server, Building, Lock, Smartphone, Wifi,
  AlertTriangle, Search, Copy, Check, X, Send, Download, Ban, Cpu, Activity, Clock
} from 'lucide-react';
import { fetchIpInfo, blockIpAddress, sendTelegramIpReport } from '../lib/api';

export default function IpIntelligenceModal({ ip, onClose, onBlockIp }) {
  const [intel, setIntel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedRule, setCopiedRule] = useState('');
  const [blockStatus, setBlockStatus] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState('');

  useEffect(() => {
    if (!ip) return;
    async function loadData() {
      setLoading(true);
      const data = await fetchIpInfo(ip);
      setIntel(data);
      setLoading(false);
    }
    loadData();
  }, [ip]);

  if (!ip) return null;

  const copyRule = (type, ruleText) => {
    navigator.clipboard.writeText(ruleText);
    setCopiedRule(type);
    setTimeout(() => setCopiedRule(''), 2000);
  };

  const handleBlock = async () => {
    setBlockStatus(true);
    await blockIpAddress(ip);
    if (onBlockIp) onBlockIp(ip);
    setTimeout(() => setBlockStatus(false), 3000);
  };

  const handleTelegram = async () => {
    setTelegramStatus('sending');
    const res = await sendTelegramIpReport(ip);
    if (res?.status === 'sent') {
      setTelegramStatus('sent');
    } else {
      setTelegramStatus('failed');
    }
    setTimeout(() => setTelegramStatus(''), 4000);
  };

  const exportIocReport = () => {
    if (!intel) return;
    const reportText = JSON.stringify(intel, null, 2);
    const blob = new Blob([reportText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IOC_Report_${ip}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-mono">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/10 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/90 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Globe className="text-cyan-400 animate-spin-slow" size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-wider">{ip}</h2>
                {intel && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    intel.risk_score >= 80 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                    intel.risk_score >= 60 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}>
                    {intel.risk_level} (SCORE {intel.risk_score}/100)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">HoneyBot IP Intelligence & Threat Assessment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 bg-slate-950/50 border-b border-white/5 overflow-x-auto">
          {[
            { id: 'overview', label: '🌐 Overview', icon: Globe },
            { id: 'geo', label: '📍 Location & Geo', icon: MapPin },
            { id: 'network', label: '🏢 Network & ISP', icon: Server },
            { id: 'privacy', label: '🕵️ Privacy & Threat', icon: Lock },
            { id: 'honeybot', label: '🤖 HoneyBot Telemetry', icon: Cpu },
            { id: 'mitigation', label: '🛡️ Perimeter Mitigation', icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-t-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 mx-auto border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400">Enriching IP Intelligence datasets...</p>
            </div>
          ) : !intel ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Failed to load IP Intelligence for {ip}
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* High Level Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Threat Risk Score</span>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className={`text-2xl font-black ${
                          intel.risk_score >= 80 ? 'text-rose-400' :
                          intel.risk_score >= 60 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>{intel.risk_score}</span>
                        <span className="text-xs text-slate-400">/ 100</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div
                          className={`h-full ${
                            intel.risk_score >= 80 ? 'bg-rose-500' :
                            intel.risk_score >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${intel.risk_score}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Location</span>
                      <div className="mt-1 text-sm font-bold text-slate-200">
                        {intel.location.city}, {intel.location.country} ({intel.location.country_code})
                      </div>
                      <span className="text-[10px] text-cyan-400 mt-1 block font-mono">
                        {intel.location.latitude}, {intel.location.longitude}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">ASN / Network</span>
                      <div className="mt-1 text-sm font-bold text-cyan-300 truncate">
                        {intel.network.asn}
                      </div>
                      <span className="text-[10px] text-slate-400 truncate block">
                        {intel.network.asn_name}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Privacy / Proxy</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {intel.privacy.tor && <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">TOR</span>}
                        {intel.privacy.vpn && <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">VPN</span>}
                        {intel.privacy.proxy && <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">PROXY</span>}
                        {!intel.privacy.tor && !intel.privacy.vpn && !intel.privacy.proxy && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">CLEAN IP</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {intel.network.network_type}
                      </span>
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Building size={14} className="text-cyan-400" /> Organization & Company Info
                      </h4>
                      <div className="text-xs space-y-2 font-mono">
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-slate-500">Organization:</span>
                          <span className="text-slate-200 font-bold">{intel.company.organization}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-slate-500">ISP:</span>
                          <span className="text-slate-200">{intel.company.isp}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-slate-500">Company Type:</span>
                          <span className="text-slate-300">{intel.company.company_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Domain:</span>
                          <span className="text-cyan-400">{intel.company.domain}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Activity size={14} className="text-cyan-400" /> Reverse DNS & Hostname
                      </h4>
                      <div className="text-xs space-y-2 font-mono">
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-slate-500">PTR Record:</span>
                          <span className="text-cyan-300 font-bold truncate max-w-[240px]">{intel.dns.reverse_dns}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-slate-500">BGP Route:</span>
                          <span className="text-slate-200">{intel.network.bgp_route}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-slate-500">RIR Registry:</span>
                          <span className="text-slate-300">{intel.whois.rir}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Abuse Email:</span>
                          <span className="text-amber-400">{intel.abuse.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LOCATION & GEO */}
              {activeTab === 'geo' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-xl bg-slate-950/60 border border-white/10 space-y-4">
                    <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                      <MapPin size={16} /> Detailed Geolocation Data
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Country:</span>
                        <span className="text-white font-bold">{intel.location.country} ({intel.location.country_code})</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">State / Region:</span>
                        <span className="text-slate-200">{intel.location.region}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">City:</span>
                        <span className="text-slate-200">{intel.location.city}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Postal Code:</span>
                        <span className="text-slate-200">{intel.location.postal}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Timezone:</span>
                        <span className="text-slate-200">{intel.location.timezone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Coordinates:</span>
                        <span className="text-cyan-400 font-bold">{intel.location.latitude}, {intel.location.longitude}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-950/60 border border-white/10 space-y-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Globe size={16} className="text-cyan-400" /> Geographic Map Reference
                      </h3>
                      <p className="text-xs text-slate-400 mt-2">
                        Exact geolocation lookup centered at lat <strong>{intel.location.latitude}</strong>, lon <strong>{intel.location.longitude}</strong>.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/20 text-center space-y-3">
                      <div className="text-2xl">🗺️</div>
                      <div className="text-xs text-slate-300 font-bold">
                        {intel.location.city}, {intel.location.country}
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${intel.location.latitude},${intel.location.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block px-4 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/40 transition-colors"
                      >
                        Open in Google Maps ↗
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: NETWORK & ISP */}
              {activeTab === 'network' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 rounded-xl bg-slate-950/60 border border-white/10 space-y-3">
                      <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                        <Server size={16} /> Autonomous System (ASN)
                      </h3>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-400">ASN Number:</span>
                          <span className="text-cyan-300 font-bold">{intel.network.asn}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-400">ASN Name:</span>
                          <span className="text-slate-200">{intel.network.asn_name}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-400">BGP Prefix / Route:</span>
                          <span className="text-slate-200">{intel.network.bgp_route}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Network Type:</span>
                          <span className="text-slate-200">{intel.network.network_type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 rounded-xl bg-slate-950/60 border border-white/10 space-y-3">
                      <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                        <Building size={16} /> ISP & Organization
                      </h3>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-400">Organization:</span>
                          <span className="text-slate-100 font-bold">{intel.company.organization}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-400">ISP Name:</span>
                          <span className="text-slate-200">{intel.company.isp}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-400">Company Type:</span>
                          <span className="text-slate-300">{intel.company.company_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Carrier:</span>
                          <span className="text-slate-300">{intel.carrier.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-950/60 border border-white/10 space-y-3">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle size={16} /> Abuse Contacts & WHOIS Registry
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="p-3 rounded-lg bg-slate-900 border border-white/5">
                        <span className="text-[10px] text-slate-500 uppercase">Abuse Email</span>
                        <div className="text-amber-300 font-bold mt-1 truncate">{intel.abuse.email}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900 border border-white/5">
                        <span className="text-[10px] text-slate-500 uppercase">Abuse Phone</span>
                        <div className="text-slate-200 font-bold mt-1">{intel.abuse.phone}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900 border border-white/5">
                        <span className="text-[10px] text-slate-500 uppercase">RIR Registry</span>
                        <div className="text-cyan-300 font-bold mt-1">{intel.whois.rir}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PRIVACY & THREAT */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { label: 'VPN Status', val: intel.privacy.vpn, color: 'amber' },
                      { label: 'Proxy Server', val: intel.privacy.proxy, color: 'amber' },
                      { label: 'Tor Exit Node', val: intel.privacy.tor, color: 'rose' },
                      { label: 'Public Relay', val: intel.privacy.relay, color: 'cyan' },
                      { label: 'Residential Proxy', val: intel.privacy.residential_proxy, color: 'rose' },
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-white/10 text-center space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">{item.label}</span>
                        <div className={`text-sm font-black ${item.val ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {item.val ? 'DETECTED' : 'CLEAN'}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-5 rounded-xl bg-slate-950/60 border border-white/10 space-y-4">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Infrastructure Breakdown</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Hosting / Cloud:</span>
                        <span className="font-bold text-white">{intel.infrastructure.hosting ? 'YES' : 'NO'}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Mobile Network:</span>
                        <span className="font-bold text-white">{intel.infrastructure.mobile ? 'YES' : 'NO'}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Satellite Link:</span>
                        <span className="font-bold text-white">{intel.infrastructure.satellite ? 'YES' : 'NO'}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Anycast Network:</span>
                        <span className="font-bold text-white">{intel.infrastructure.anycast ? 'YES' : 'NO'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: HONEYBOT TELEMETRY */}
              {activeTab === 'honeybot' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Total Attempts</span>
                      <div className="text-2xl font-black text-cyan-300 mt-1">{intel.honeybot.total_attempts}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">First Seen</span>
                      <div className="text-xs text-slate-300 font-bold mt-2">{new Date(intel.honeybot.first_seen).toLocaleString()}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Last Seen</span>
                      <div className="text-xs text-slate-300 font-bold mt-2">{new Date(intel.honeybot.last_seen).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-950/60 border border-white/10 space-y-3">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Targeted Ports & Services</h3>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {intel.honeybot.targeted_services.map((svc) => (
                        <span key={svc} className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
                          Service: {svc.toUpperCase()}
                        </span>
                      ))}
                      {intel.honeybot.targeted_ports.map((port) => (
                        <span key={port} className="px-3 py-1 rounded-lg bg-slate-900 border border-white/10 text-slate-300 font-bold">
                          Port: {port}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-950/60 border border-white/10 space-y-3">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Captured Payloads & Commands</h3>
                    <div className="space-y-2">
                      {intel.honeybot.recent_payloads.map((payload, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-rose-300 border border-rose-500/20 overflow-x-auto">
                          {payload}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: PERIMETER MITIGATION */}
              {activeTab === 'mitigation' && (
                <div className="space-y-6">
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleBlock}
                      className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-lg shadow-rose-500/20"
                    >
                      <Ban size={14} /> {blockStatus ? '✓ IP BLOCKED IN FIREWALL' : 'EXECUTE IMMEDIATE IP BLOCK'}
                    </button>
                    <button
                      onClick={handleTelegram}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                    >
                      <Send size={14} /> {telegramStatus === 'sent' ? '✓ REPORT DISPATCHED TO TELEGRAM' : 'DISPATCH TELEGRAM SOC REPORT'}
                    </button>
                    <button
                      onClick={exportIocReport}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-2 border border-white/10"
                    >
                      <Download size={14} /> EXPORT IOC REPORT (JSON)
                    </button>
                  </div>

                  {/* Firewall Rules Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: 'Linux iptables Rule', key: 'iptables', code: intel.mitigation.iptables },
                      { title: 'Linux UFW Rule', key: 'ufw', code: intel.mitigation.ufw },
                      { title: 'Windows Firewall Rule (netsh)', key: 'netsh', code: intel.mitigation.netsh },
                      { title: 'Cloudflare WAF Expression', key: 'cloudflare', code: intel.mitigation.cloudflare },
                    ].map((item) => (
                      <div key={item.key} className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-300">{item.title}</span>
                          <button
                            onClick={() => copyRule(item.key, item.code)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-300 flex items-center gap-1 font-bold transition-colors border border-white/10"
                          >
                            {copiedRule === item.key ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                            {copiedRule === item.key ? 'COPIED' : 'COPY'}
                          </button>
                        </div>
                        <pre className="p-3 rounded-lg bg-slate-950 text-cyan-400 text-[11px] font-mono overflow-x-auto border border-cyan-500/20">
                          {item.code}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
