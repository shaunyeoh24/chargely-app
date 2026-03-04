import { Zap, Wallet, Gauge, Activity } from 'lucide-react';

interface VehicleStatsProps {
  stats: {
    totalKwh: number;
    totalCost: number;
    avgRmPerKwh: number;
    avgWhPerKm: number | null;
    sessionCount: number;
  } | null;
}

export default function VehicleStats({ stats }: VehicleStatsProps) {
  if (!stats) return null;

  const cards = [
    {
      label: 'Total Energy',
      value: stats.totalKwh.toFixed(1),
      unit: 'kWh',
      icon: Zap,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      valueClassName: '',
    },
    {
      label: 'Total Cost',
      value: `RM ${stats.totalCost.toFixed(2)}`,
      unit: '',
      icon: Wallet,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      valueClassName: 'whitespace-nowrap tabular-nums',
    },
    {
      label: 'Avg Rate',
      value: stats.avgRmPerKwh.toFixed(2),
      unit: 'RM/kWh',
      icon: Gauge,
      color: 'text-slate-600',
      bg: 'bg-slate-50',
      valueClassName: '',
    },
    {
      label: 'Avg Efficiency',
      value: stats.avgWhPerKm !== null ? stats.avgWhPerKm.toFixed(0) : '—',
      unit: 'Wh/km',
      icon: Activity,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      valueClassName: '',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${card.bg} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <Icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{card.label}</p>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-3xl font-black text-slate-900 leading-none tracking-tight ${card.valueClassName || ''}`}>{card.value}</span>
                {card.unit && <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">{card.unit}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
