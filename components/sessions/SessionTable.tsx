'use client';

import { SessionWithCalculations } from '@/lib/types/session';
import { Fuel, Zap, Gauge, Calendar, TrendingDown, TrendingUp, Edit2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SessionTableProps {
  sessions: SessionWithCalculations[];
  onEditSession: (session: SessionWithCalculations) => void;
}

export default function SessionTable({ sessions, onEditSession }: SessionTableProps) {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center">
        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Zap className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">No sessions logged</h3>
        <p className="text-slate-500 max-w-xs mx-auto mt-1">
          Start logging your charging sessions to see efficiency trends and cost analytics.
        </p>
      </div>
    );
  }

  // Simple logic to determine if efficiency is "good" (below 200 Wh/km as a baseline)
  const getEfficiencyColor = (whPerKm: number) => {
    if (whPerKm < 150) return "text-emerald-700 bg-emerald-100/50 border-emerald-200";
    if (whPerKm < 200) return "text-blue-700 bg-blue-100/50 border-blue-200";
    return "text-amber-700 bg-amber-100/50 border-amber-200";
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/60">
              <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
              <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Energy</th>
              <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Cost</th>
              <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Rate</th>
              <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Efficiency</th>
              <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Cost/100km</th>
              <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sessions.map((session) => (
              <tr key={session.id} className="group hover:bg-slate-50 transition-colors">
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white transition-colors">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      {new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right whitespace-nowrap">
                  <span className="text-sm font-black text-slate-900">{session.kwh.toFixed(1)}</span>
                  <span className="text-[10px] font-black text-slate-400 ml-1.5 uppercase tracking-tighter">kWh</span>
                </td>
                <td className="px-6 py-5 text-right whitespace-nowrap">
                  <span className="text-sm font-black text-blue-600">RM {session.cost_rm.toFixed(2)}</span>
                </td>
                <td className="px-6 py-5 text-right whitespace-nowrap">
                  <span className="text-xs font-bold text-slate-600">{session.rm_per_kwh.toFixed(2)}</span>
                  <span className="text-[10px] font-black text-slate-400 ml-1 uppercase">/kWh</span>
                </td>
                <td className="px-6 py-5 text-right whitespace-nowrap">
                  {session.wh_per_km !== null ? (
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all",
                      getEfficiencyColor(session.wh_per_km)
                    )}>
                      <Zap className="w-3 h-3 opacity-70" />
                      <span className="text-sm font-black">
                        {session.wh_per_km.toFixed(0)}
                      </span>
                      <span className="text-[10px] font-black opacity-60 uppercase tracking-tighter">Wh/km</span>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-slate-300 px-2.5">—</span>
                  )}
                </td>
                <td className="px-6 py-5 text-right whitespace-nowrap">
                  {session.cost_per_100km !== null ? (
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-black text-slate-900">RM {session.cost_per_100km.toFixed(2)}</span>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-slate-300">—</span>
                  )}
                </td>
                <td className="px-6 py-5 text-right whitespace-nowrap">
                  <button
                    onClick={() => onEditSession(session)}
                    className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-90"
                    title="Edit session"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
