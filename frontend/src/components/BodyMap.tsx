import React from 'react';
import { RiskScores, VitalsSnapshot } from '../types';
import { Crosshair, Sparkles } from 'lucide-react';
import { HologramViewer3D } from './HologramViewer3D';

interface BodyMapProps {
  riskScores: RiskScores;
  vitals: VitalsSnapshot;
  selectedZone: string | null;
  onSelectZone: (zone: string | null) => void;
}

export const BodyMap: React.FC<BodyMapProps> = ({
  riskScores,
  vitals,
  selectedZone,
  onSelectZone,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col h-full relative overflow-hidden">
      {/* Background radial ambient glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3 z-10">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Crosshair className="w-5 h-5 text-cyan-400 animate-spin-slow" />
            <Sparkles className="w-2.5 h-2.5 text-cyan-300 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-200 font-heading flex items-center gap-2">
              <span>Biometric Anatomical Hologram</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                3D HUD
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-telemetry">
              Deep-Space Organ System Stress Distribution & Microgravity Telemetry
            </p>
          </div>
        </div>
        {selectedZone && (
          <button
            onClick={() => onSelectZone(null)}
            className="text-xs px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Main 3D Holographic Model Visualization */}
      <div className="relative flex-1 flex flex-col items-center justify-center min-h-[500px] rounded-xl overflow-hidden bg-gradient-to-b from-slate-950/80 to-[#070b14]/90 border border-cyan-950/40">
        <HologramViewer3D
          riskScores={riskScores}
          vitals={vitals}
          selectedZone={selectedZone}
          onSelectZone={onSelectZone}
        />
      </div>

      {/* Selected Zone Quick Diagnostic Panel */}
      {selectedZone && (
        <div className="mt-3 p-3.5 rounded-xl bg-slate-900/95 border border-cyan-500/40 text-xs shadow-xl animate-fade-in z-10">
          <div className="flex items-center justify-between font-semibold text-cyan-300 mb-1.5">
            <span className="capitalize flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              {selectedZone.replace('_', ' ')} System Telemetry Drilldown
            </span>
            <span className="font-telemetry text-[11px] text-emerald-400">
              Sensor Array Verified
            </span>
          </div>

          {selectedZone === 'cardiovascular' && (
            <p className="text-slate-300 leading-relaxed">
              HR: <strong className="text-white">{vitals.heart_rate} bpm</strong> | BP:{' '}
              <strong className="text-white">
                {vitals.systolic_bp}/{vitals.diastolic_bp} mmHg
              </strong>
              . Cephalad fluid shifts induce stroke volume changes, vascular remodeling, and orthostatic
              intolerance upon gravity transition.
            </p>
          )}

          {selectedZone === 'immune_radiation' && (
            <p className="text-slate-300 leading-relaxed">
              Cumulative Radiation:{' '}
              <strong className="text-white">{vitals.cumulative_radiation_msv} mSv</strong> | Core Temp:{' '}
              <strong className="text-white">{vitals.core_temp}°C</strong> | WBC Biomarker:{' '}
              <strong className="text-white">{vitals.wbc_proxy_marker} k/uL</strong>. Cosmic particle
              flux elevates cellular oxidative stress.
            </p>
          )}

          {selectedZone === 'musculoskeletal' && (
            <p className="text-slate-300 leading-relaxed">
              ARED Resistive Session:{' '}
              <strong className="text-white">{vitals.ared_exercise_mins} min</strong> | Bone Resorption Rate:{' '}
              <strong className="text-white">{vitals.bone_density_loss_rate}%/mo</strong>. Microgravity unloading
              triggers bone calcium loss and lumbar postural elongation.
            </p>
          )}

          {selectedZone === 'neurological' && (
            <p className="text-slate-300 leading-relaxed">
              Sleep Duration: <strong className="text-white">{vitals.sleep_hours}h</strong> | Cognitive
              Latency:{' '}
              <strong className="text-white">{vitals.cognitive_reaction_latency_ms} ms</strong> | Mood
              Index: <strong className="text-white">{vitals.mood_score}/10</strong>. Circadian misalignment
              and sensory monotony impact response latency.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
