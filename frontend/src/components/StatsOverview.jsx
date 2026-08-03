import React from 'react';
import { Package, Search, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';

export default function StatsOverview({ stats }) {
  const cards = [
    {
      title: 'Reported Lost',
      value: stats.total_lost || 0,
      icon: Package,
      gradient: 'from-rose-500/20 via-rose-500/10 to-transparent',
      borderColor: 'border-rose-500/30',
      iconColor: 'text-rose-400',
      description: 'Lost item tickets active'
    },
    {
      title: 'Found Submissions',
      value: stats.total_found || 0,
      icon: Search,
      gradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
      description: 'Items reported found'
    },
    {
      title: 'AI Matches Found',
      value: stats.total_matches || 0,
      icon: Sparkles,
      gradient: 'from-amber-500/20 via-amber-500/10 to-transparent',
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-400',
      description: 'FAISS similarity matches'
    },
    {
      title: 'Recovery Success',
      value: `${stats.recovery_rate || 0}%`,
      icon: CheckCircle2,
      gradient: 'from-indigo-500/20 via-indigo-500/10 to-transparent',
      borderColor: 'border-indigo-500/30',
      iconColor: 'text-indigo-400',
      description: `${stats.total_claimed || 0} items recovered`
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`glass-panel p-6 rounded-2xl border ${c.borderColor} relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {c.title}
                </p>
                <h3 className="text-3xl font-extrabold text-white mt-1 font-outfit">
                  {c.value}
                </h3>
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  {c.description}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-slate-900/80 border border-slate-800 ${c.iconColor} shadow-md`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
