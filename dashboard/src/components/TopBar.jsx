import { useState } from 'react';
import { Search, Bell, Settings as SettingsIcon, Zap, LogOut } from 'lucide-react';
import { sendTestEvent } from '../lib/api';

export default function TopBar({ health, wsConnected, espOnline, onSimulateAttack }) {
  const [simulating, setSimulating] = useState(false);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const result = await sendTestEvent();
      if (result?.ok) {
        if (onSimulateAttack) onSimulateAttack();
      } else {
        alert(`Simulate failed: ${result?.error || 'Backend not reachable.'}`);
      }
    } catch (err) {
      console.error('Simulation failed', err);
    } finally {
      setTimeout(() => setSimulating(false), 600);
    }
  };

  const handleSignOut = async () => {
    // Confirm sign out
    if (confirm('Sign out from CYBER-EYE Dashboard?')) {
      try {
        // Sign out from Supabase (if using Supabase auth)
        // This will be handled by the auth system
        const authSignOut = async () => {
          try {
            await fetch('http://localhost:3000/api/signout', { method: 'POST' });
          } catch (e) {
            console.log('Sign out API not available');
          }
        };
        await authSignOut();
      } catch (e) {
        console.log('Sign out error:', e);
      }
      
      // Clear ALL auth-related data
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Add a flag to prevent auto-redirect
      localStorage.setItem('signed_out', Date.now().toString());
      
      // Force reload to clear any cached state
      window.location.replace('http://localhost:3000');
    }
  };

  return (
    <header className="flex items-center justify-between px-6 border-b shrink-0 bg-[#050811] border-white/5 h-16 z-30 w-full">
      {/* Left: System Status Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/35 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
          <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-emerald shrink-0" />
          <span className="text-[10px] font-extrabold font-mono tracking-wider text-emerald-400 uppercase">
            System Online
          </span>
        </div>

        {/* Dynamic Demo Simulator Control */}
        <button
          onClick={handleSimulate}
          disabled={simulating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-bold cursor-pointer transition-colors shadow-[0_0_10px_rgba(6,182,212,0.05)] disabled:opacity-50"
        >
          <Zap size={11} className={`text-amber-300 ${simulating ? 'animate-spin' : ''}`} />
          <span>{simulating ? 'Ingesting Event...' : 'Simulate Ingress'}</span>
        </button>
      </div>

      {/* Right: Actions, Search, Notifications & Profile */}
      <div className="flex items-center gap-5">
        {/* Search Icon */}
        <button className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1">
          <Search size={16} />
        </button>

        {/* Notifications Icon with Badge */}
        <button className="relative text-slate-400 hover:text-white transition-colors cursor-pointer p-1">
          <Bell size={16} />
          <span className="absolute -top-1 -right-1.5 min-w-[13px] h-[13px] px-0.5 rounded bg-rose-500 text-white font-mono text-[8px] font-extrabold flex items-center justify-center border border-[#050811]">
            12
          </span>
        </button>

        {/* Settings Icon */}
        <button className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1">
          <SettingsIcon size={16} />
        </button>

        {/* Sign Out Button */}
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 font-mono text-[10px] font-bold cursor-pointer transition-all shadow-[0_0_10px_rgba(244,63,94,0.05)] hover:shadow-[0_0_15px_rgba(244,63,94,0.1)]"
          title="Sign Out"
        >
          <LogOut size={12} />
          <span className="hidden sm:inline">SIGN OUT</span>
        </button>

        {/* Divider */}
        <div className="h-6 w-[1px] bg-white/5" />

        {/* Analyst Profile */}
        <div className="flex items-center gap-3">
          {/* Analyst Details */}
          <div className="text-right hidden sm:block font-mono">
            <div className="text-xs font-bold text-white leading-none">Analyst</div>
            <div className="text-[9px] text-slate-500 font-semibold mt-1">SOC Tier 1</div>
          </div>
          {/* Avatar Image */}
          <div className="w-8 h-8 rounded-full border border-white/10 bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80" 
              alt="Analyst Avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to text initials if image fails
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span class="text-xs font-bold text-cyan-400">AN</span>';
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
