import React, { useState } from 'react';
import { Countermeasure } from '../types';
import { ShieldCheck, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, Award } from 'lucide-react';

interface CountermeasuresListProps {
  countermeasures: Countermeasure[];
  onComplete: (id: string) => Promise<void>;
  selectedZone: string | null;
}

export const CountermeasuresList: React.FC<CountermeasuresListProps> = ({
  countermeasures,
  onComplete,
  selectedZone,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleComplete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLoadingId(id);
    try {
      await onComplete(id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-300 border-red-500/50 glow-crimson';
      case 'WARNING':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'ADVISORY':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/50';
    }
  };

  const filtered = selectedZone
    ? countermeasures.filter((cm) => cm.target_zone === selectedZone)
    : countermeasures;

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-200 font-heading">
              Autonomous Clinical Countermeasures
            </h2>
            <p className="text-xs text-slate-400 font-telemetry">
              Act on Health Status — NASA Flight Surgeon Protocol Queue
            </p>
          </div>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800">
          {filtered.filter((c) => c.completed).length} / {filtered.length} Completed
        </span>
      </div>

      {/* List */}
      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              No active countermeasures required for this selected system. All parameters nominal.
            </p>
          </div>
        ) : (
          filtered.map((cm) => {
            const isExpanded = expandedId === cm.id;
            return (
              <div
                key={cm.id}
                onClick={() => toggleExpand(cm.id)}
                className={`rounded-xl border transition-all cursor-pointer ${
                  cm.completed
                    ? 'bg-slate-900/40 border-emerald-500/30 opacity-75'
                    : cm.urgency === 'CRITICAL'
                    ? 'bg-red-950/15 border-red-500/40 hover:border-red-400'
                    : 'bg-slate-900/70 border-slate-700/80 hover:border-cyan-500/40'
                }`}
              >
                {/* Main Card Summary */}
                <div className="p-3.5 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${getUrgencyBadge(cm.urgency)}`}>
                        {cm.urgency}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        [{cm.domain}]
                      </span>
                      <span className="text-xs font-bold text-white font-heading">
                        {cm.title}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-snug mt-1">
                      {cm.action}
                    </p>
                  </div>

                  {/* Actions & Rewards */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-1 rounded-lg border border-cyan-800/60">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>+{cm.xp_reward} XP</span>
                    </div>

                    {cm.completed ? (
                      <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Executed</span>
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleComplete(e, cm.id)}
                        disabled={loadingId === cm.id}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {loadingId === cm.id ? 'Logging...' : 'Execute'}
                      </button>
                    )}

                    <button className="text-slate-500 hover:text-slate-300 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expandable Clinical Protocol Steps */}
                {isExpanded && (
                  <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-800/80 text-xs space-y-2 bg-slate-950/40">
                    <div>
                      <span className="text-slate-400 font-mono text-[10px] uppercase tracking-wider block mb-0.5">
                        Clinical Rationale:
                      </span>
                      <p className="text-slate-300 italic">{cm.rationale}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 font-mono text-[10px] uppercase tracking-wider block mb-1">
                        NASA Protocol Checklist Steps:
                      </span>
                      <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1">
                        {cm.steps.map((st, i) => (
                          <li key={i} className="leading-relaxed">
                            {st}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

