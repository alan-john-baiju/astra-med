import React from 'react';
import { Shield, Sparkles, Orbit, Radio, PlusCircle, Play, Pause, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  currentScenario: string;
  onScenarioChange: (scenario: string) => void;
  overallStatus: string;
  statusColor: 'emerald' | 'amber' | 'crimson';
  readinessScore: number;
  missionDay: number;
  streakDays: number;
  readinessXp: number;
  onOpenCheckIn: () => void;
  isLive: boolean;
  onToggleLive: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScenario,
  onScenarioChange,
  overallStatus,
  statusColor,
  readinessScore,
  missionDay,
  streakDays,
  readinessXp,
  onOpenCheckIn,
  isLive,
  onToggleLive,
}) => {
  const getBadgeConfig = () => {
    if (statusColor === 'crimson') {
      return {
        bg: 'bg-red-500/15 border-red-500/70 text-red-300 animate-alarm-breathe',
        icon: AlertTriangle,
        iconColor: 'text-red-400',
        label: 'CRITICAL ACTION REQUIRED',
      };
    }
    if (statusColor === 'amber') {
      return {
        bg: 'bg-amber-500/15 border-amber-500/60 text-amber-300 glow-amber',
        icon: AlertTriangle,
        iconColor: 'text-amber-400',
        label: 'WATCH / ADVISORY',
      };
    }
    return {
      bg: 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 glow-emerald',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      label: 'NOMINAL MICROGRAVITY',
    };
  };

  const badge = getBadgeConfig();
  const StatusIcon = badge.icon;

  const scenarios = [
    { id: 'NOMINAL_CRUISE', label: 'Nominal Cruise', badge: 'BASELINE' },
    { id: 'SOLAR_PARTICLE_EVENT', label: 'Solar Particle Event (SPE)', badge: 'RADIATION ALERT' },
    { id: 'CARDIO_DECONDITIONING', label: 'Cardio Deconditioning', badge: 'ORTHOSTATIC' },
    { id: 'ISOLATION_FATIGUE', label: 'Isolation & Sleep Fatigue', badge: 'BEHAVIORAL' },
  ];

  return (
    <header className="glass-panel border-b border-cyan-500/20 py-2.5 px-4 sm:px-6 sticky top-0 z-40 shadow-xl backdrop-blur-xl">
      {/* Top Row: Mission Identity & Flight Surgeon Status Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-2.5 border-b border-slate-800/80">
        {/* Left: Mission Emblem & Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center p-2 rounded-xl bg-gradient-to-br from-cyan-950/80 via-slate-900 to-blue-950/80 border border-cyan-400/40 glow-cyan">
            <Orbit className="w-5 h-5 text-cyan-300 animate-spin-slow" />
            <div className="absolute inset-0 rounded-xl bg-cyan-400/10 animate-radar-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-heading tracking-wider bg-gradient-to-r from-cyan-300 via-blue-200 to-indigo-200 bg-clip-text text-transparent">
                ASTRA-MED
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-600/50 font-semibold tracking-wide">
                NASA SPACE APPS 2026
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-telemetry mt-0.5">
              <span className="inline-flex items-center gap-1.5 text-cyan-300 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                MET: Day {missionDay} (Mars Transit)
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400 hidden sm:inline">Autonomous Deep-Space Flight Surgeon</span>
            </div>
          </div>
        </div>

        {/* Right: Telemetry Controls & Clinical Status */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-start md:justify-end w-full md:w-auto">
          {/* Live / Pause Stream Toggle */}
          <button
            onClick={onToggleLive}
            title={isLive ? "Click to Pause live telemetry feed" : "Click to Resume live telemetry feed"}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-mono font-bold transition-all duration-200 active:scale-95 ${
              isLive
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-amber-950/80 border-amber-500/60 text-amber-300 hover:bg-amber-900/60'
            }`}
          >
            {isLive ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE</span>
                <Pause className="w-3 h-3 text-emerald-400 opacity-70 ml-0.5" />
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-amber-400" />
                <span>PAUSED</span>
              </>
            )}
          </button>

          {/* Gamified Adherence: Streak & XP Badge */}
          <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1 rounded-xl border border-slate-700/80 text-xs font-mono">
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{streakDays}d Streak</span>
            </div>
            <div className="h-3.5 w-px bg-slate-700" />
            <div>
              <span className="text-slate-400">XP: </span>
              <span className="font-bold text-cyan-300 font-telemetry">{readinessXp}</span>
            </div>
          </div>

          {/* Clinical Readiness Alarm Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 ${badge.bg}`}>
            <StatusIcon className={`w-3.5 h-3.5 ${badge.iconColor}`} />
            <span>{badge.label} ({Math.round(readinessScore)}%)</span>
          </div>

          {/* Daily Astronaut Self-Check-In CTA Button */}
          <button
            onClick={onOpenCheckIn}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all duration-200 shadow-lg shadow-cyan-500/25 active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Self-Check-In</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Mission Scenario Simulator Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 font-semibold uppercase tracking-wider flex-shrink-0">
          <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          <span>Mission Scenario Simulator:</span>
        </div>

        {/* Scenario Pill Buttons (Zero ugly scrollbars, fully responsive) */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar py-0.5">
          {scenarios.map((sc) => {
            const isActive = currentScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => onScenarioChange(sc.id)}
                className={`relative group flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap border ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-bold border-cyan-300 shadow-md shadow-cyan-500/30'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/60'
                }`}
              >
                <span>{sc.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
