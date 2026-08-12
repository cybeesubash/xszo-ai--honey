import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import KeyMetrics from './components/KeyMetrics';
import LiveFeed from './components/LiveFeed';
import AttacksByCountry from './components/AttacksByCountry';
import AIThreatAnalysis from './components/AIThreatAnalysis';
import BottomCharts from './components/BottomCharts';
import RecentAIReports from './components/RecentAIReports';
import DevicesPanel from './components/DevicesPanel';
import ConfigPanel from './components/ConfigPanel';
import CompliancePanel from './components/CompliancePanel';
import AIChatView from './components/AIChatView';
import ConnectionBanner from './components/ConnectionBanner';
import AttackMap from './components/AttackMap';
import AttackMapDrawer from './components/AttackMapDrawer';
import DataGridFeed from './components/DataGridFeed';
import AnalystPanel from './components/AnalystPanel';
import ThreatIntelPanel from './components/ThreatIntelPanel';
import ApiDocsView from './components/ApiDocsView';
import IPIntelligencePanel from './components/IPIntelligencePanel';
import { Bell, FileText, BarChart3, ShieldAlert } from 'lucide-react';
import {
  getWsBase, fetchHealth, fetchStats, fetchLogs, fetchDevices,
} from './lib/api';

export default function App() {
  const [logs, setLogs]           = useState([]);
  const [stats, setStats]         = useState(null);
  const [health, setHealth]       = useState(null);
  const [devices, setDevices]     = useState([]);
  const [selectedIp, setSelectedIp] = useState(null);
  const [modalIp, setModalIp]       = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [toast, setToast]         = useState(null);
  const [backendOk, setBackendOk] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [showMapDrawer, setShowMapDrawer] = useState(false);
  const wsRef = useRef(null);

  /* ── Data polling ── */
  const refresh = useCallback(async () => {
    const [h, s, l, d] = await Promise.all([
      fetchHealth(), fetchStats(), fetchLogs(150), fetchDevices(),
    ]);
    setBackendOk(!!h);
    setHealth(h);
    setStats(s);
    setLogs(l || []);
    setDevices(d || []);
  }, []);

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, 5000);
    return () => clearInterval(iv);
  }, [refresh]);

  /* ── WebSocket ── */
  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(`${getWsBase()}/ws/live`);
      ws.onopen = () => setWsConnected(true);
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.event === 'new_attack' && msg.data) {
            setLogs((prev) => [msg.data, ...prev].slice(0, 300));
            fetchStats().then(setStats);
            fetchDevices().then(setDevices);
            const sev = msg.data.severity?.toLowerCase();
            if (sev === 'high' || sev === 'critical') {
              triggerToast(`⚠ ${sev.toUpperCase()}: ${msg.data.attack_type} from ${msg.data.ip}`, sev);
            }
          }
        } catch { /* noop */ }
      };
      ws.onclose = () => { setWsConnected(false); setTimeout(connect, 4000); };
      wsRef.current = ws;
    };
    connect();
    return () => wsRef.current?.close();
  }, []);

  const triggerToast = (message, severity = 'info') => {
    setToast({ message, severity });
    setTimeout(() => setToast(null), 5000);
  };

  const handleBlockIp = (ip) => {
    triggerToast(`✓ Firewall rule queued: DROP ${ip}`, 'warning');
  };

  const espOnline = devices.some((d) => d.online);

  /* ── View Router ── */
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-5 animate-fade-in">
            {/* Row 1 — KPI Cards */}
            <KeyMetrics stats={stats} />

            {/* Row 2 — Main 3-column grid */}
            <div className="grid grid-cols-12 gap-5" style={{ minHeight: '400px' }}>
              {/* LEFT: Live Feed (5 cols) */}
              <div className="col-span-12 xl:col-span-5 flex flex-col">
                <LiveFeed
                  logs={logs}
                  selectedIp={selectedIp}
                  onSelectIp={setSelectedIp}
                  onBlockIp={handleBlockIp}
                  onShowMap={() => setShowMapDrawer(true)}
                />
              </div>

              {/* CENTER: Attacks by Country (4 cols) */}
              <div className="col-span-12 xl:col-span-4 flex flex-col">
                <AttacksByCountry stats={stats} logs={logs} onExpand={() => setShowMapDrawer(true)} />
              </div>

              {/* RIGHT: AI Threat Analysis (3 cols) */}
              <div className="col-span-12 xl:col-span-3 flex flex-col gap-5">
                <AIThreatAnalysis selectedIp={selectedIp} stats={stats} logs={logs} />
              </div>
            </div>

            {/* Row 3 — Bottom Charts */}
            <BottomCharts stats={stats} logs={logs} />

            {/* Row 4 — Recent AI Reports */}
            <RecentAIReports logs={logs} onViewAll={() => setActiveView('logs')} />
          </div>
        );

      case 'live':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="px-1">
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Live Ingress Stream</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Real-time attack telemetry captured by ESP32 sensors</p>
            </div>
            <LiveFeed logs={logs} selectedIp={selectedIp} onSelectIp={setSelectedIp} onBlockIp={handleBlockIp} onShowMap={() => setActiveView('map')} />
          </div>
        );

      case 'map':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="px-1 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Global Threat Map — 3D Live Globe</h2>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Real attacker locations from live logs · hover dots for detail · auto-rotating sphere</p>
              </div>
              <button
                className="px-4 py-1.5 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-colors text-xs font-bold font-mono"
                onClick={() => setShowMapDrawer(true)}
              >
                ⛶ Fullscreen
              </button>
            </div>
            <div style={{ height: 560, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(56,189,248,0.15)' }}>
              <AttackMap logs={logs} />
            </div>
          </div>
        );

      case 'devices':
        return <div className="animate-fade-in"><DevicesPanel devices={devices} /></div>;

      case 'ai':
        return <div className="animate-fade-in"><AIChatView logs={logs} selectedIp={selectedIp} onSelectIp={setSelectedIp} /></div>;

      case 'alerts':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="px-1">
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <Bell size={16} className="text-rose-400" /> High & Critical Threat Alerts
              </h2>
              <p className="text-xs text-slate-400 mt-1">Filtered real-time high severity threat events requiring immediate SOC attention</p>
            </div>
            <DataGridFeed
              logs={logs.filter((l) => ['high', 'critical'].includes(l.severity?.toLowerCase()))}
              selectedLogId={null}
              onSelectLog={(l) => setSelectedIp(l.src_ip || l.ip)}
              onBlockIp={handleBlockIp}
            />
          </div>
        );

      case 'logs':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="px-1">
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} className="text-cyan-400" /> Complete Attack Telemetry Logs
              </h2>
              <p className="text-xs text-slate-400 mt-1">Full searchable historic telemetry grid with GOC AI enrichment and payload inspection</p>
            </div>
            <DataGridFeed
              logs={logs}
              selectedLogId={null}
              onSelectLog={(l) => setSelectedIp(l.src_ip || l.ip)}
              onBlockIp={handleBlockIp}
            />
          </div>
        );

      case 'reports':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="px-1">
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <BarChart3 size={16} className="text-cyan-400" /> Threat Intelligence & SOC Audit Reports
              </h2>
              <p className="text-xs text-slate-400 mt-1">Automated compliance checks, severity breakdown, and historic AI summaries</p>
            </div>
            <CompliancePanel stats={stats} logs={logs} />
            <RecentAIReports logs={logs} onViewAll={null} />
          </div>
        );

      case 'mitigation':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="px-1">
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert size={16} className="text-cyan-400" /> Perimeter Mitigation & Firewall Rules
              </h2>
              <p className="text-xs text-slate-400 mt-1">Generate iptables/UFW rules, analyze intent, and execute perimeter IP blocks</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" style={{ minHeight: '520px' }}>
              <div className="col-span-12 lg:col-span-7 flex flex-col">
                <AnalystPanel selectedIp={selectedIp} onSelectIp={setSelectedIp} onBlockIp={handleBlockIp} onInspectIp={(ip) => setModalIp(ip)} logs={logs} onSimulateAttack={refresh} />
              </div>
              <div className="col-span-12 lg:col-span-5 flex flex-col">
                <ThreatIntelPanel stats={stats} logs={logs} onSelectIp={setSelectedIp} onInspectIp={(ip) => setModalIp(ip)} />
              </div>
            </div>
          </div>
        );

      case 'config':
        return <div className="animate-fade-in"><ConfigPanel health={health} wsConnected={wsConnected} espOnline={espOnline} backendOk={backendOk} /></div>;

      case 'compliance':
        return <div className="animate-fade-in"><CompliancePanel stats={stats} logs={logs} /></div>;

      case 'api_docs':
        return <div className="animate-fade-in"><ApiDocsView backendOk={backendOk} /></div>;

      default:
        return (
          <div className="py-32 text-center font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            This section is coming soon.
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Fixed Sidebar */}
      <Sidebar activeView={activeView} onNavigate={setActiveView} devices={devices} />

      {/* Scrollable Main Pane */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden' }}>
        {/* Connection Banner */}
        <ConnectionBanner connected={backendOk} onRetry={refresh} />

        {/* Top Bar */}
        <TopBar
          health={health}
          wsConnected={wsConnected}
          espOnline={espOnline}
          onSimulateAttack={refresh}
        />

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px', maxWidth: 1800, width: '100%', alignSelf: 'center' }}>
          {renderView()}
        </main>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="toast"
            style={{
              background: 'rgba(13,21,38,0.97)',
              border: '1px solid rgba(56,189,248,0.3)',
              color: '#7DD3FC',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            }}
            onClick={() => setToast(null)}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Globe Drawer */}
      <AnimatePresence>
        {showMapDrawer && (
          <AttackMapDrawer
            logs={logs}
            stats={stats}
            onClose={() => setShowMapDrawer(false)}
          />
        )}
      </AnimatePresence>

      {/* IP Intelligence & Mitigation Modal */}
      <AnimatePresence>
        {modalIp && (
          <IPIntelligencePanel
            ip={modalIp}
            onClose={() => setModalIp(null)}
            onBlockIp={handleBlockIp}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
