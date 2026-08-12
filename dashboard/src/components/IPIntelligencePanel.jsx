/**
 * IPIntelligencePanel.jsx - Comprehensive Attacker IP Intelligence & Mitigation Panel
 * Full WHOIS-style details + Threat assessment + Mitigation recommendations
 */
import React, { useState, useEffect } from 'react';
import { 
  Globe, MapPin, Server, Shield, Ban, Copy, ExternalLink, 
  AlertTriangle, Clock, Activity, Network, Database, Zap, CheckCircle, XCircle
} from 'lucide-react';

export default function IPIntelligencePanel({ ip, onClose }) {
  const [intel, setIntel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!ip) return;
    
    setLoading(true);
    setError(null);
    
    fetch(`/api/ip/${ip}`)
      .then(res => res.json())
      .then(data => {
        setIntel(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [ip]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!ip) return null;

  const getThreatColor = (level) => {
    switch (level) {
      case 'critical': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-b border-cyan-500/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40">
              <Globe className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-mono">IP INTELLIGENCE REPORT</h2>
              <p className="text-xs text-cyan-400 font-mono">{ip}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading && (
            <div className="p-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-500"></div>
              <span className="ml-3 text-cyan-400 font-mono">Loading intelligence...</span>
            </div>
          )}

          {error && (
            <div className="p-8">
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 text-rose-400">
                <AlertTriangle className="w-5 h-5 inline mr-2" />
                Error: {error}
              </div>
            </div>
          )}

          {intel && (
            <div className="p-6 space-y-6">
              {/* Threat Level Banner */}
              <div className={`p-4 rounded-lg border ${getThreatColor(intel.intelligence?.threat_level)} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6" />
                  <div>
                    <div className="text-xs uppercase tracking-wider opacity-70">Threat Assessment</div>
                    <div className="text-lg font-bold uppercase">{intel.intelligence?.threat_level || 'UNKNOWN'}</div>
                  </div>
                </div>
                {intel.intelligence?.is_proxy && (
                  <div className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold">
                    🚨 PROXY DETECTED
                  </div>
                )}
                {intel.intelligence?.is_hosting && (
                  <div className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-bold">
                    🏢 HOSTING PROVIDER
                  </div>
                )}
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Geolocation */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white uppercase">Geolocation</h3>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Country:</span>
                      <span className="text-white font-bold">{intel.intelligence?.country || 'Unknown'} {intel.intelligence?.country_code && `(${intel.intelligence.country_code})`}</span>
                    </div>
                    {intel.intelligence?.region && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Region:</span>
                        <span className="text-white">{intel.intelligence.region}</span>
                      </div>
                    )}
                    {intel.intelligence?.city && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">City:</span>
                        <span className="text-white">{intel.intelligence.city}</span>
                      </div>
                    )}
                    {intel.intelligence?.latitude && intel.intelligence?.longitude && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Coordinates:</span>
                        <span className="text-cyan-400">{intel.intelligence.latitude.toFixed(4)}, {intel.intelligence.longitude.toFixed(4)}</span>
                      </div>
                    )}
                    {intel.intelligence?.timezone && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Timezone:</span>
                        <span className="text-white">{intel.intelligence.timezone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Network Information */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700">
                    <Network className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white uppercase">Network Info</h3>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">ISP:</span>
                      <span className="text-white font-bold">{intel.intelligence?.isp || 'Unknown'}</span>
                    </div>
                    {intel.intelligence?.org && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Organization:</span>
                        <span className="text-white">{intel.intelligence.org}</span>
                      </div>
                    )}
                    {intel.intelligence?.asn && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">ASN:</span>
                        <span className="text-cyan-400">AS{intel.intelligence.asn}</span>
                      </div>
                    )}
                    {intel.intelligence?.as_name && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">AS Name:</span>
                        <span className="text-white">{intel.intelligence.as_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Attack History */}
              {intel.attack_history && intel.attack_history.total_attacks > 0 && (
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-rose-500/20">
                    <Activity className="w-4 h-4 text-rose-400" />
                    <h3 className="text-sm font-bold text-white uppercase">Attack History</h3>
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold">
                      {intel.attack_history.total_attacks} Total Attacks
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {intel.attack_history.recent_attacks.map((attack, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-800/50 rounded p-2">
                        <div className="flex items-center gap-3">
                          <div className={`px-2 py-1 rounded text-[10px] font-bold ${getThreatColor(attack.severity)}`}>
                            {attack.severity.toUpperCase()}
                          </div>
                          <span className="text-white font-mono text-xs">{attack.attack_type}</span>
                          <span className="text-slate-400 text-xs">{attack.service}</span>
                        </div>
                        <span className="text-slate-500 text-xs">{new Date(attack.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mitigation Recommendations */}
              <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-cyan-500/20">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white uppercase">Mitigation Recommendations</h3>
                </div>

                <div className="space-y-3">
                  {/* Firewall Rules */}
                  <div>
                    <h4 className="text-xs font-bold text-cyan-400 mb-2 uppercase">Firewall Block Rules</h4>
                    <div className="space-y-2">
                      <div className="bg-slate-900/50 border border-slate-700 rounded p-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">iptables (Linux)</span>
                          <button
                            onClick={() => copyToClipboard(`iptables -A INPUT -s ${ip} -j DROP`)}
                            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                          >
                            {copied ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
                          </button>
                        </div>
                        <code className="text-xs text-cyan-300 font-mono">iptables -A INPUT -s {ip} -j DROP</code>
                      </div>

                      <div className="bg-slate-900/50 border border-slate-700 rounded p-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">UFW (Ubuntu)</span>
                          <button
                            onClick={() => copyToClipboard(`ufw deny from ${ip}`)}
                            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                          >
                            {copied ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
                          </button>
                        </div>
                        <code className="text-xs text-cyan-300 font-mono">ufw deny from {ip}</code>
                      </div>

                      <div className="bg-slate-900/50 border border-slate-700 rounded p-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Windows Firewall</span>
                          <button
                            onClick={() => copyToClipboard(`netsh advfirewall firewall add rule name="Block ${ip}" dir=in action=block remoteip=${ip}`)}
                            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                          >
                            {copied ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
                          </button>
                        </div>
                        <code className="text-xs text-cyan-300 font-mono break-all">netsh advfirewall firewall add rule name="Block {ip}" dir=in action=block remoteip={ip}</code>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Actions */}
                  <div>
                    <h4 className="text-xs font-bold text-cyan-400 mb-2 uppercase">Recommended Actions</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">Block IP address at perimeter firewall</span>
                      </div>
                      {intel.intelligence?.is_proxy && (
                        <div className="flex items-start gap-2">
                          <CheckCircle size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-300">Enable proxy/VPN detection rules</span>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <CheckCircle size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">Add to threat intelligence watchlist</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">Implement rate limiting for source IP</span>
                      </div>
                      {intel.attack_history?.total_attacks > 5 && (
                        <div className="flex items-start gap-2">
                          <CheckCircle size={14} className="text-rose-400 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-300">Escalate to SOC team for investigation</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* External Links */}
              <div className="flex gap-2 flex-wrap">
                <a
                  href={`https://www.virustotal.com/gui/ip-address/${ip}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs text-white transition-colors"
                >
                  <ExternalLink size={12} />
                  VirusTotal
                </a>
                <a
                  href={`https://www.abuseipdb.com/check/${ip}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs text-white transition-colors"
                >
                  <ExternalLink size={12} />
                  AbuseIPDB
                </a>
                <a
                  href={`https://www.shodan.io/host/${ip}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs text-white transition-colors"
                >
                  <ExternalLink size={12} />
                  Shodan
                </a>
                <a
                  href={`https://ipinfo.io/${ip}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs text-white transition-colors"
                >
                  <ExternalLink size={12} />
                  IPInfo
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
