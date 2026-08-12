import { Target, Shield, Users, Globe, TrendingUp } from 'lucide-react';

export default function KeyMetrics({ stats }) {
  const total = stats?.total_events ?? 0;
  const highRisk = (stats?.severity_breakdown?.critical ?? 0) + (stats?.severity_breakdown?.high ?? 0);
  const uniqueIps = stats?.unique_ips ?? 0;
  
  // Calculate countries targeting from top_countries if available
  const countries = stats?.top_countries?.length ?? 0;

  const cards = [
    {
      title: 'TOTAL ATTACKS',
      value: total.toLocaleString(),
      trend: '+23.6%',
      trendUp: true,
      trendColor: 'text-emerald-400',
      icon: Target,
      iconBg: 'bg-rose-500/10 border border-rose-500/20',
      iconColor: 'text-rose-400',
      sparklineColor: '#EF4444',
      // Red sparkline path
      sparklinePath: 'M0,15 L15,13 L30,17 L45,10 L60,14 L75,19 L90,12 L105,8 L120,15 L135,11 L150,14 L165,10 L180,18 L195,12 L210,8 L225,11 L240,6'
    },
    {
      title: 'HIGH RISK ATTACKS',
      value: highRisk.toLocaleString(),
      trend: '+18.4%',
      trendUp: true,
      trendColor: 'text-rose-400',
      icon: Shield,
      iconBg: 'bg-rose-500/10 border border-rose-500/20',
      iconColor: 'text-rose-400',
      sparklineColor: '#EF4444',
      // Red sparkline path
      sparklinePath: 'M0,18 L15,16 L30,14 L45,18 L60,11 L75,15 L90,19 L105,11 L120,8 L135,14 L150,10 L165,13 L180,9 L195,14 L210,7 L225,12 L240,8'
    },
    {
      title: 'UNIQUE ATTACKERS',
      value: uniqueIps.toLocaleString(),
      trend: '+11.2%',
      trendUp: true,
      trendColor: 'text-purple-400',
      icon: Users,
      iconBg: 'bg-purple-500/10 border border-purple-500/20',
      iconColor: 'text-purple-400',
      sparklineColor: '#A855F7',
      // Purple sparkline path
      sparklinePath: 'M0,15 L15,17 L30,12 L45,15 L60,11 L75,14 L90,9 L105,12 L120,7 L135,10 L150,6 L165,9 L180,5 L195,8 L210,4 L225,6 L240,3'
    },
    {
      title: 'COUNTRIES TARGETING',
      value: countries.toLocaleString(),
      trend: '+5.3%',
      trendUp: true,
      trendColor: 'text-emerald-400',
      icon: Globe,
      iconBg: 'bg-sky-500/10 border border-sky-500/20',
      iconColor: 'text-sky-400',
      sparklineColor: '#10B981',
      // Green sparkline path
      sparklinePath: 'M0,10 L15,12 L30,8 L45,11 L60,9 L75,11 L90,8 L105,9 L120,7 L135,8 L150,6 L165,7 L180,5 L195,6 L210,4 L225,5 L240,3'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="rounded-2xl bg-[#0B1220] border border-white/5 p-5 relative overflow-hidden flex flex-col justify-between"
            style={{ minHeight: '140px' }}
          >
            {/* Top row: Title and Icon */}
            <div className="flex items-center justify-between z-10">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 font-mono">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.iconBg}`}>
                <Icon size={16} className={card.iconColor} />
              </div>
            </div>

            {/* Middle row: Value */}
            <div className="mt-3 z-10">
              <h2 className="text-3xl font-extrabold tracking-tight text-white font-mono leading-none">
                {card.value}
              </h2>
            </div>

            {/* Bottom row: Trend & Sparkline */}
            <div className="mt-2 flex items-center justify-between z-10">
              <div className="flex items-center gap-1">
                <TrendingUp size={12} className={card.trendColor} />
                <span className={`text-[10px] font-bold font-mono ${card.trendColor}`}>
                  {card.trend} <span className="text-slate-500 font-medium">vs yesterday</span>
                </span>
              </div>
            </div>

            {/* Background Sparkline Chart */}
            <div className="absolute inset-x-0 bottom-0 h-11 w-full pointer-events-none opacity-40">
              <svg width="100%" height="100%" viewBox="0 0 240 24" preserveAspectRatio="none">
                <path
                  d={card.sparklinePath}
                  fill="none"
                  stroke={card.sparklineColor}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}
