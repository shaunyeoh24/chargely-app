'use client';

import { useMemo, useState } from 'react';
import { SessionWithCalculations } from '@/lib/types/session';
import { Zap, Calendar, Edit2, Trash2, ArrowUpDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SessionTableProps {
  sessions: SessionWithCalculations[];
  onEditSession: (session: SessionWithCalculations) => void;
  onDeleteSession: (id: string) => Promise<void>;
}

const formatDateLabel = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return dateString;

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
};

type SortKey = 'date' | 'odometer' | 'energy' | 'cost' | 'rate' | 'efficiency' | 'cost100km';
type SortDirection = 'asc' | 'desc';

export default function SessionTable({ sessions, onEditSession, onDeleteSession }: SessionTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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
    if (whPerKm < 200) return "text-teal-700 bg-teal-100/50 border-teal-200";
    return "text-amber-700 bg-amber-100/50 border-amber-200";
  };

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDirection('asc');
  };

  const sortableValue = (session: SessionWithCalculations, key: SortKey) => {
    switch (key) {
      case 'date':
        return new Date(session.date).getTime();
      case 'odometer':
        return session.odometer_km;
      case 'energy':
        return session.kwh;
      case 'cost':
        return session.cost_rm;
      case 'rate':
        return session.rm_per_kwh;
      case 'efficiency':
        return session.wh_per_km;
      case 'cost100km':
        return session.cost_per_100km;
      default:
        return null;
    }
  };

  const sortedSessions = useMemo(() => {
    const sorted = [...sessions].sort((a, b) => {
      const aValue = sortableValue(a, sortKey);
      const bValue = sortableValue(b, sortKey);

      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue === null) return sortDirection === 'asc' ? -1 : 1;
      if (aValue === bValue) return 0;

      return sortDirection === 'asc'
        ? (aValue < bValue ? -1 : 1)
        : (aValue > bValue ? -1 : 1);
    });

    return sorted;
  }, [sessions, sortKey, sortDirection]);

  const SortHeader = ({ label, keyName, align = 'left' }: { label: string; keyName: SortKey; align?: 'left' | 'right' }) => (
    <th className={`px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest ${align === 'right' ? 'text-right' : ''}`}>
      <button
        type="button"
        onClick={() => handleSort(keyName)}
        className={`inline-flex items-center gap-1.5 hover:text-slate-700 transition-colors ${align === 'right' ? 'justify-end w-full' : ''}`}
      >
        <span>{label}</span>
        {sortKey === keyName ? (
          <span className="text-[10px]">{sortDirection === 'asc' ? '▲' : '▼'}</span>
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-60" />
        )}
      </button>
    </th>
  );

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/60">
              <SortHeader label="Date" keyName="date" />
              <SortHeader label="Odometer" keyName="odometer" align="right" />
              <SortHeader label="Energy" keyName="energy" align="right" />
              <SortHeader label="Cost" keyName="cost" align="right" />
              <SortHeader label="Rate" keyName="rate" align="right" />
              <SortHeader label="Efficiency" keyName="efficiency" align="right" />
              <SortHeader label="Cost/100km" keyName="cost100km" align="right" />
              <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedSessions.map((session) => (
              <tr key={session.id} className="group hover:bg-slate-50 transition-colors">
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white transition-colors">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      {formatDateLabel(session.date)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right whitespace-nowrap">
                  <span className="text-sm font-black text-slate-900">{session.odometer_km.toFixed(0)}</span>
                  <span className="text-[10px] font-black text-slate-400 ml-1 uppercase">km</span>
                </td>
                <td className="px-6 py-5 text-right whitespace-nowrap">
                  <span className="text-sm font-black text-slate-900">{session.kwh.toFixed(1)}</span>
                  <span className="text-[10px] font-black text-slate-400 ml-1.5 uppercase tracking-tighter">kWh</span>
                </td>
                <td className="px-6 py-5 text-right whitespace-nowrap">
                  <span className="text-sm font-black text-teal-600">RM {session.cost_rm.toFixed(2)}</span>
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
                    <span className="text-[11px] font-bold text-slate-400 px-2.5">
                      {session.efficiency_note || 'Not available'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-5 text-right whitespace-nowrap">
                  {session.cost_per_100km !== null ? (
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-black text-slate-900">RM {session.cost_per_100km.toFixed(2)}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400">
                      {session.efficiency_note || 'Not available'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-5 text-right whitespace-nowrap">
                  <div className="inline-flex flex-col sm:flex-row gap-2 justify-end">
                    <button
                      onClick={() => onEditSession(session)}
                      className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-teal-50 hover:text-teal-600 transition-all active:scale-90"
                      title="Edit session"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm('Delete this charging log? This action cannot be undone.')) {
                          await onDeleteSession(session.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all active:scale-90"
                      title="Delete session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
