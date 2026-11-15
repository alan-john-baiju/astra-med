import React from 'react';
import { Shield, Sparkles, Orbit, Radio, PlusCircle, Play, Pause } from 'lucide-react';

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
  const getBadgeStyle = () => {
    if (statusColor === 'crimson') return 'bg-red-500/20 text-red-300 border-red-500/50 glow-crimson';
    if (statusColor === 'amber') return 'bg-amber-500/20 text-amber-300 border-amber-500/50 glow-amber';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 glow-emerald';
  };

  const scenarios = [
    { id: 'NOMINAL_CRUISE', label: 'Nominal Microgravity Cruise' },
    { id: 'SOLAR_PARTICLE_EVENT', label: 'Solar Particle Event (SPE)' },
    { id: 'CARDIO_DECONDITIONING', label: 'Cardio Deconditioning' },
    { id: 'ISOLATION_FATIGUE', label: 'Isolation & Sleep Fatigue' },
  ];

  return (
    <header className="glass-panel border-b border-cyan-500/20 py-3 px-4 sm:px-6 sticky top-0 z-40">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Project Branding & MET */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-400/40 glow-cyan">
            <Orbit className="w-6 h-6 text-cyan-300 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-heading tracking-wider bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                ASTRA-MED
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-600/50">
                NASA SPACE APPS 2026
              </span>
            </div>
            <p className="text-xs text-slate-400 font-telemetry flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>MET: Day {missionDay} (Mars Transit)</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400">Autonomous Deep-Space Flight Surgeon</span>
            </p>
          </div>
        </div>

        {/* Center: Scenario Switcher */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700/80 w-full sm:w-auto overflow-x-auto">
          <div className="flex items-center gap-1.5 px-2 text-xs font-mono text-cyan-400">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">Scenario:</span>
          </div>
          <div className="flex gap-1">
            {scenarios.map((sc) => (
              <button
                key={sc.id}
                onClick={() => onScenarioChange(sc.id)}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  currentScenario === sc.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Gamification XP & Check-in CTA */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end flex-wrap">
          {/* Live / Pause Stream Toggle Button */}
          <button
            onClick={onToggleLive}
            title={isLive ? "Click to Pause live telemetry stream" : "Click to Resume live telemetry stream"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all ${
              isLive
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-amber-950/80 border-amber-500/50 text-amber-300 hover:bg-amber-900/60'
            }`}
          >
            {isLive ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE</span>
                <Pause className="w-3 h-3 text-emerald-400 opacity-60 ml-0.5" />
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-amber-400" />
                <span>PAUSED</span>
              </>
            )}
          </button>

          {/* Streak & XP Badge */}
          <div className="flex items-center gap-3 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700/80">
            <div className="flex items-center gap-1 text-xs font-mono text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{streakDays}d Streak</span>
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <div className="text-xs font-mono">
              <span className="text-slate-400">XP: </span>
              <span className="font-bold text-cyan-300">{readinessXp}</span>
            </div>
          </div>

          {/* Clinical Status Badge */}
          <div className={`px-3 py-1 rounded-xl border font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${getBadgeStyle()}`}>
            <Shield className="w-3.5 h-3.5" />
            <span>{overallStatus.replace(/_/g, ' ')} ({readinessScore}%)</span>
          </div>

          {/* Daily Self-Check-In CTA Button */}
          <button
            onClick={onOpenCheckIn}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Self-Check-In</span>
            <span className="sm:hidden">Log</span>
          </button>
        </div>
      </div>
    </header>
  );
};

