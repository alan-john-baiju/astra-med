import React from 'react';
import { VitalsSnapshot } from '../types';
import { Heart, Activity, Droplets, Thermometer, ShieldAlert, Moon, Zap, Dumbbell } from 'lucide-react';

interface TelemetryMatrixProps {
  vitals: VitalsSnapshot;
  onFilterZone?: (zone: string | null) => void;
}

export const TelemetryMatrix: React.FC<TelemetryMatrixProps> = ({ vitals, onFilterZone }) => {
  const getCardStatus = (val: number, minNom: number, maxNom: number, isCriticalHigh = true) => {
    if (val < minNom || val > maxNom) {
      const isExtreme = isCriticalHigh ? val > maxNom * 1.25 : val < minNom * 0.75;
      return isExtreme
        ? { status: 'CRITICAL', text: 'text-red-400', border: 'border-red-500/40', badge: 'bg-red-500/20 text-red-300' }
        : { status: 'WARNING', text: 'text-amber-400', border: 'border-amber-500/40', badge: 'bg-amber-500/20 text-amber-300' };
    }
    return { status: 'NOMINAL', text: 'text-emerald-400', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-300' };
  };

  const hrStatus = getCardStatus(vitals.heart_rate, 58, 85);
  const bpStatus = getCardStatus(vitals.systolic_bp, 105, 130);
  const spo2Status = vitals.spo2 < 95
    ? { status: 'WARNING', text: 'text-amber-400', border: 'border-amber-500/40', badge: 'bg-amber-500/20 text-amber-300' }
    : { status: 'NOMINAL', text: 'text-emerald-400', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-300' };
  const tempStatus = vitals.core_temp > 37.8
    ? { status: 'CRITICAL', text: 'text-red-400', border: 'border-red-500/40', badge: 'bg-red-500/20 text-red-300' }
    : vitals.core_temp > 37.3
    ? { status: 'WARNING', text: 'text-amber-400', border: 'border-amber-500/40', badge: 'bg-amber-500/20 text-amber-300' }
    : { status: 'NOMINAL', text: 'text-emerald-400', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-300' };
  const radStatus = vitals.cumulative_radiation_msv > 50
    ? { status: 'CRITICAL', text: 'text-red-400', border: 'border-red-500/40', badge: 'bg-red-500/20 text-red-300' }
    : vitals.cumulative_radiation_msv > 30
    ? { status: 'WARNING', text: 'text-amber-400', border: 'border-amber-500/40', badge: 'bg-amber-500/20 text-amber-300' }
    : { status: 'NOMINAL', text: 'text-emerald-400', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-300' };
  const sleepStatus = vitals.sleep_hours < 5.0
    ? { status: 'CRITICAL', text: 'text-red-400', border: 'border-red-500/40', badge: 'bg-red-500/20 text-red-300' }
    : vitals.sleep_hours < 6.5
    ? { status: 'WARNING', text: 'text-amber-400', border: 'border-amber-500/40', badge: 'bg-amber-500/20 text-amber-300' }
    : { status: 'NOMINAL', text: 'text-emerald-400', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-300' };
  const reactStatus = vitals.cognitive_reaction_latency_ms > 350
    ? { status: 'CRITICAL', text: 'text-red-400', border: 'border-red-500/40', badge: 'bg-red-500/20 text-red-300' }
    : vitals.cognitive_reaction_latency_ms > 270
    ? { status: 'WARNING', text: 'text-amber-400', border: 'border-amber-500/40', badge: 'bg-amber-500/20 text-amber-300' }
    : { status: 'NOMINAL', text: 'text-emerald-400', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-300' };
  const aredStatus = vitals.ared_exercise_mins < 20
    ? { status: 'CRITICAL', text: 'text-red-400', border: 'border-red-500/40', badge: 'bg-red-500/20 text-red-300' }
    : vitals.ared_exercise_mins < 40
    ? { status: 'WARNING', text: 'text-amber-400', border: 'border-amber-500/40', badge: 'bg-amber-500/20 text-amber-300' }
    : { status: 'NOMINAL', text: 'text-emerald-400', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-300' };

  const cards = [
    {
      label: 'Heart Rate',
      value: `${vitals.heart_rate}`,
      unit: 'BPM',
      subtext: 'Target: 60 - 80 BPM',
      icon: Heart,
      status: hrStatus,
      zone: 'cardiovascular',
    },
    {
      label: 'Blood Pressure',
      value: `${Math.round(vitals.systolic_bp)}/${Math.round(vitals.diastolic_bp)}`,
      unit: 'mmHg',
      subtext: 'Target: 118/76 mmHg',
      icon: Activity,
      status: bpStatus,
      zone: 'cardiovascular',
    },
    {
      label: 'Blood Oxygen (SpO2)',
      value: `${vitals.spo2}%`,
      unit: '',
      subtext: 'Target: 97 - 99%',
      icon: Droplets,
      status: spo2Status,
      zone: 'cardiovascular',
    },
    {
      label: 'Core Body Temp',
      value: `${vitals.core_temp}°C`,
      unit: '',
      subtext: 'Target: 36.8 - 37.2°C',
      icon: Thermometer,
      status: tempStatus,
      zone: 'immune_radiation',
    },
    {
      label: 'Cumulative Radiation',
      value: `${vitals.cumulative_radiation_msv}`,
      unit: 'mSv',
      subtext: 'Max Mission Limit: 150 mSv',
      icon: ShieldAlert,
      status: radStatus,
      zone: 'immune_radiation',
    },
    {
      label: 'Sleep Duration',
      value: `${vitals.sleep_hours}h`,
      unit: '',
      subtext: 'Circadian Target: 7.5 - 8.5h',
      icon: Moon,
      status: sleepStatus,
      zone: 'neurological',
    },
    {
      label: 'Cognitive Latency',
      value: `${Math.round(vitals.cognitive_reaction_latency_ms)}`,
      unit: 'ms',
      subtext: 'Target: 210 - 245 ms',
      icon: Zap,
      status: reactStatus,
      zone: 'neurological',
    },
    {
      label: 'ARED Resistive Exercise',
      value: `${Math.round(vitals.ared_exercise_mins)}`,
      unit: 'min',
      subtext: 'Daily Protocol: 45 - 60 min',
      icon: Dumbbell,
      status: aredStatus,
      zone: 'musculoskeletal',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            onClick={() => onFilterZone && onFilterZone(c.zone)}
            className={`glass-panel-subtle rounded-xl p-3 border transition-all duration-200 hover:border-cyan-500/40 cursor-pointer ${c.status.border}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-slate-400 truncate">{c.label}</span>
              <Icon className={`w-3.5 h-3.5 ${c.status.text}`} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-bold font-telemetry tracking-tight ${c.status.text}`}>
                {c.value}
              </span>
              {c.unit && <span className="text-[10px] text-slate-400 font-mono">{c.unit}</span>}
            </div>
            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/60">
              <span className="text-[9px] text-slate-400 truncate font-mono">{c.subtext}</span>
              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${c.status.badge}`}>
                {c.status.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

