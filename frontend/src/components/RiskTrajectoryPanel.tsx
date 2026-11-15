import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { DayTrajectory, ExplainabilityDriver, RiskScores } from '../types';
import { TrendingUp, AlertCircle, Cpu, ShieldCheck } from 'lucide-react';

interface RiskTrajectoryPanelProps {
  readinessScore: number;
  anomalyScore: number;
  riskScores: RiskScores;
  trajectories: DayTrajectory[];
  topDrivers: ExplainabilityDriver[];
  selectedZone: string | null;
}

export const RiskTrajectoryPanel: React.FC<RiskTrajectoryPanelProps> = ({
  readinessScore,
  anomalyScore,
  riskScores,
  trajectories,
  topDrivers,
  selectedZone,
}) => {
  const getReadinessColor = (score: number) => {
    if (score >= 75) return { text: 'text-emerald-400', stroke: '#10b981', ring: 'ring-emerald-500/30' };
    if (score >= 50) return { text: 'text-amber-400', stroke: '#f59e0b', ring: 'ring-amber-500/30' };
    return { text: 'text-red-400', stroke: '#ef4444', ring: 'ring-red-500/30' };
  };

  const readinessColor = getReadinessColor(readinessScore);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-2.5 rounded-xl border border-cyan-500/30 text-xs shadow-xl font-mono">
          <p className="text-cyan-300 font-bold mb-1">Projection: {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="flex justify-between gap-4">
              <span>{entry.name}:</span>
              <span className="font-bold">{entry.value}%</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-200 font-heading">
              ML Evaluation & Trajectory Forecaster
            </h2>
            <p className="text-xs text-slate-400 font-telemetry">
              Evaluate Health Status — Dual-Model NASA Spaceflight Risk Engine
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Isolation Forest + Random Forest
          </span>
        </div>
      </div>

      {/* Top Gauges: Readiness Score & Anomaly Score */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Overall Readiness Gauge Card */}
        <div className="glass-panel-subtle rounded-xl p-4 flex items-center gap-4 border border-slate-800">
          {/* Radial progress ring */}
          <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 72 72">
              <circle
                cx="36"
                cy="36"
                r="30"
                stroke="#1e293b"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="36"
                cy="36"
                r="30"
                stroke={readinessColor.stroke}
                strokeWidth="6"
                fill="none"
                strokeDasharray="188.4"
                strokeDashoffset={188.4 * (1 - readinessScore / 100)}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-base font-bold font-telemetry ${readinessColor.text}`}>
                {Math.round(readinessScore)}%
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Flight Surgeon Readiness</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Composite physiological resilience index across all 4 spaceflight domains.
            </p>
          </div>
        </div>

        {/* Anomaly Detection Gauge Card */}
        <div className="glass-panel-subtle rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <AlertCircle className={`w-4 h-4 ${anomalyScore > 0.6 ? 'text-red-400' : 'text-cyan-400'}`} />
              <span>Multi-Vital Anomaly Index</span>
            </div>
            <span className={`text-xs font-mono font-bold ${anomalyScore > 0.6 ? 'text-red-400' : anomalyScore > 0.35 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {(anomalyScore * 100).toFixed(1)}% ({anomalyScore > 0.6 ? 'Outlier' : 'Nominal'})
            </span>
          </div>

          {/* Anomaly Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  anomalyScore > 0.6
                    ? 'bg-gradient-to-r from-amber-500 to-red-500 glow-crimson'
                    : anomalyScore > 0.35
                    ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, anomalyScore * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
              <span>0.0 (Nominal Microgravity)</span>
              <span>0.5 (Advisory Threshold)</span>
              <span>1.0 (Critical Anomaly)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Forward Trajectory Chart */}
      <div className="glass-panel-subtle rounded-xl p-4 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>7-Day Predictive Risk Trajectory Forecaster (NASA 4 Pillars)</span>
          </div>
          {selectedZone && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              Filtered: {selectedZone.toUpperCase()}
            </span>
          )}
        </div>

        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trajectories} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="cardiovascular"
                name="Cardiovascular"
                stroke="#ef4444"
                strokeWidth={selectedZone === 'cardiovascular' ? 3.5 : 2}
                strokeOpacity={!selectedZone || selectedZone === 'cardiovascular' ? 1 : 0.3}
                dot={{ r: 3, fill: '#ef4444' }}
              />
              <Line
                type="monotone"
                dataKey="immune_radiation"
                name="Immune & Radiation"
                stroke="#f59e0b"
                strokeWidth={selectedZone === 'immune_radiation' ? 3.5 : 2}
                strokeOpacity={!selectedZone || selectedZone === 'immune_radiation' ? 1 : 0.3}
                dot={{ r: 3, fill: '#f59e0b' }}
              />
              <Line
                type="monotone"
                dataKey="bone_musculoskeletal"
                name="Bone & Musculoskeletal"
                stroke="#06b6d4"
                strokeWidth={selectedZone === 'musculoskeletal' ? 3.5 : 2}
                strokeOpacity={!selectedZone || selectedZone === 'musculoskeletal' ? 1 : 0.3}
                dot={{ r: 3, fill: '#06b6d4' }}
              />
              <Line
                type="monotone"
                dataKey="behavioral_health"
                name="Behavioral Health"
                stroke="#8b5cf6"
                strokeWidth={selectedZone === 'neurological' ? 3.5 : 2}
                strokeOpacity={!selectedZone || selectedZone === 'neurological' ? 1 : 0.3}
                dot={{ r: 3, fill: '#8b5cf6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Explainable AI (XAI) Attribution Badges */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 font-heading tracking-wide uppercase">
            Explainable AI (XAI) Key Risk Drivers
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            SHAP-style Feature Impact
          </span>
        </div>
        {topDrivers.length === 0 ? (
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-400 font-mono">
            Nominal Spaceflight Parameters — All vitals within 1.2σ microgravity baselines.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {topDrivers.map((driver, idx) => (
              <div
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs flex items-center gap-2 hover:border-cyan-500/40 transition-colors"
              >
                <span className={`w-2 h-2 rounded-full ${driver.direction === 'ELEVATED' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                <span className="font-medium text-slate-200">{driver.label}:</span>
                <span className={`font-mono font-bold ${driver.direction === 'ELEVATED' ? 'text-amber-300' : 'text-blue-300'}`}>
                  {driver.description}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  (z={driver.z_score})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

