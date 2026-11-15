import React from 'react';
import { RiskScores, VitalsSnapshot } from '../types';
import { Brain, Heart, ShieldAlert, Activity, Crosshair } from 'lucide-react';

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
  const getZoneColor = (score: number) => {
    if (score >= 70) return { hex: '#ef4444', text: 'text-red-400', border: 'border-red-500/40', bg: 'bg-red-500/15', ring: 'ring-red-500', glow: 'glow-crimson' };
    if (score >= 40) return { hex: '#f59e0b', text: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/15', ring: 'ring-amber-500', glow: 'glow-amber' };
    return { hex: '#10b981', text: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/15', ring: 'ring-emerald-500', glow: 'glow-emerald' };
  };

  const neuroColor = getZoneColor(riskScores.behavioral_health);
  const cardioColor = getZoneColor(riskScores.cardiovascular);
  const immuneColor = getZoneColor(riskScores.immune_radiation);
  const musculoColor = getZoneColor(riskScores.bone_musculoskeletal);

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col h-full relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-cyan-400 animate-spin-slow" />
          <div>
            <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-200 font-heading">
              Biometric Anatomical Telemetry Map
            </h2>
            <p className="text-xs text-slate-400 font-telemetry">
              Deep-Space Organ System Stress Distribution
            </p>
          </div>
        </div>
        {selectedZone && (
          <button
            onClick={() => onSelectZone(null)}
            className="text-xs px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition-colors"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Main Body Map Visualization */}
      <div className="relative flex-1 flex items-center justify-center min-h-[360px]">
        {/* SVG Human Figure */}
        <svg
          viewBox="0 0 320 480"
          className="w-full max-w-[280px] h-auto drop-shadow-[0_0_15px_rgba(6,182,212,0.15)]"
        >
          <defs>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
            </linearGradient>
            
            {/* Pulsing glow filters */}
            <filter id="glowNeuro" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glowCardio" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid Scanner Background Lines */}
          <line x1="40" y1="90" x2="280" y2="90" stroke="rgba(56, 189, 248, 0.08)" strokeDasharray="3 3" />
          <line x1="40" y1="180" x2="280" y2="180" stroke="rgba(56, 189, 248, 0.08)" strokeDasharray="3 3" />
          <line x1="40" y1="260" x2="280" y2="260" stroke="rgba(56, 189, 248, 0.08)" strokeDasharray="3 3" />
          <line x1="40" y1="360" x2="280" y2="360" stroke="rgba(56, 189, 248, 0.08)" strokeDasharray="3 3" />
          <line x1="160" y1="20" x2="160" y2="460" stroke="rgba(56, 189, 248, 0.1)" strokeDasharray="4 4" />

          {/* Human Outline (Stylized Microgravity Suit / Silhouette) */}
          {/* Head & Neck Base */}
          <path
            d="M 160 40 C 145 40 135 52 135 68 C 135 84 144 95 152 98 L 152 110 L 168 110 L 168 98 C 176 95 185 84 185 68 C 185 52 175 40 160 40 Z"
            fill="url(#bodyGradient)"
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* Torso & Shoulders Base */}
          <path
            d="M 152 110 L 115 125 C 105 130 102 138 100 155 L 94 220 C 93 232 98 238 106 238 L 115 238 L 122 170 L 126 270 L 140 270 L 145 285 L 175 285 L 180 270 L 194 270 L 198 170 L 205 238 L 214 238 C 222 238 227 232 226 220 L 220 155 C 218 138 215 130 205 125 L 168 110 Z"
            fill="url(#bodyGradient)"
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* Legs Base */}
          <path
            d="M 140 285 L 132 370 L 128 450 C 127 458 134 464 142 464 C 148 464 152 460 153 454 L 156 370 L 158 285 Z"
            fill="url(#bodyGradient)"
            stroke="#334155"
            strokeWidth="1.5"
          />
          <path
            d="M 180 285 L 188 370 L 192 450 C 193 458 186 464 178 464 C 172 464 168 460 167 454 L 164 370 L 162 285 Z"
            fill="url(#bodyGradient)"
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* ================= INTERACTIVE CLICKABLE PHYSIOLOGICAL ZONES ================= */}

          {/* 1. NEUROLOGICAL / BEHAVIORAL ZONE (Head & Cranial Vault) */}
          <g
            className="cursor-pointer transition-all duration-300 group"
            onClick={() => onSelectZone(selectedZone === 'neurological' ? null : 'neurological')}
          >
            {/* Dynamic Pulse Ring */}
            <circle
              cx="160"
              cy="68"
              r={riskScores.behavioral_health >= 70 ? "32" : "26"}
              fill="none"
              stroke={neuroColor.hex}
              strokeWidth="2"
              strokeDasharray={riskScores.behavioral_health >= 70 ? "4 2" : "none"}
              className={riskScores.behavioral_health >= 70 ? "animate-pulse" : ""}
              opacity="0.8"
            />
            {/* Brain/Head highlight */}
            <ellipse
              cx="160"
              cy="68"
              rx="20"
              ry="24"
              fill={selectedZone === 'neurological' ? neuroColor.hex : `${neuroColor.hex}33`}
              stroke={neuroColor.hex}
              strokeWidth="2"
              className="transition-colors duration-200"
            />
            {/* Neural network nodes */}
            <circle cx="154" cy="62" r="2.5" fill="#ffffff" />
            <circle cx="166" cy="64" r="2.5" fill="#ffffff" />
            <circle cx="160" cy="74" r="2" fill="#ffffff" />
            <line x1="154" y1="62" x2="166" y2="64" stroke="#ffffff" strokeWidth="0.8" opacity="0.7" />
            <line x1="166" y1="64" x2="160" y2="74" stroke="#ffffff" strokeWidth="0.8" opacity="0.7" />
          </g>

          {/* 2. CARDIOVASCULAR ZONE (Heart & Thoracic Cavity) */}
          <g
            className="cursor-pointer transition-all duration-300 group"
            onClick={() => onSelectZone(selectedZone === 'cardiovascular' ? null : 'cardiovascular')}
          >
            {/* Pulse Ring */}
            <circle
              cx="165"
              cy="160"
              r={riskScores.cardiovascular >= 70 ? "34" : "28"}
              fill="none"
              stroke={cardioColor.hex}
              strokeWidth="2"
              strokeDasharray={riskScores.cardiovascular >= 70 ? "5 3" : "none"}
              className={riskScores.cardiovascular >= 70 ? "animate-pulse" : ""}
              opacity="0.85"
            />
            {/* Heart shape */}
            <path
              d="M 165 152 C 165 146 157 142 151 148 C 145 154 149 164 165 174 C 181 164 185 154 179 148 C 173 142 165 146 165 152 Z"
              fill={selectedZone === 'cardiovascular' ? cardioColor.hex : `${cardioColor.hex}44`}
              stroke={cardioColor.hex}
              strokeWidth="2"
              className="transition-transform origin-center hover:scale-110"
            />
            {/* Aortic / Great Vessels schematic */}
            <path
              d="M 165 146 L 165 136 M 160 136 L 170 136"
              stroke={cardioColor.hex}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>

          {/* 3. IMMUNE & RADIATION / METABOLIC ZONE (Torso & Lymphatic) */}
          <g
            className="cursor-pointer transition-all duration-300 group"
            onClick={() => onSelectZone(selectedZone === 'immune_radiation' ? null : 'immune_radiation')}
          >
            {/* Abdomen / Lymphatic core shield */}
            <path
              d="M 136 195 Q 160 188 184 195 L 180 250 Q 160 262 140 250 Z"
              fill={selectedZone === 'immune_radiation' ? immuneColor.hex : `${immuneColor.hex}33`}
              stroke={immuneColor.hex}
              strokeWidth="2"
              className="transition-colors"
            />
            {/* Core Temp / Radiation wave rings */}
            <circle cx="160" cy="222" r="14" fill="none" stroke={immuneColor.hex} strokeWidth="1.2" strokeDasharray="3 2" />
            <circle cx="160" cy="222" r="6" fill={immuneColor.hex} opacity="0.6" />
          </g>

          {/* 4. MUSCULOSKELETAL & BONE ZONE (Spine & Femur / Limbs) */}
          <g
            className="cursor-pointer transition-all duration-300 group"
            onClick={() => onSelectZone(selectedZone === 'musculoskeletal' ? null : 'musculoskeletal')}
          >
            {/* Spinal Column Vertebrae */}
            <line x1="160" y1="115" x2="160" y2="280" stroke={musculoColor.hex} strokeWidth="3" strokeDasharray="4 2" />
            
            {/* Left & Right Femur Skeletal Bones */}
            <line x1="147" y1="290" x2="142" y2="380" stroke={musculoColor.hex} strokeWidth="4" strokeLinecap="round" opacity="0.85" />
            <line x1="173" y1="290" x2="178" y2="380" stroke={musculoColor.hex} strokeWidth="4" strokeLinecap="round" opacity="0.85" />
            
            {/* Tibia / Lower leg */}
            <line x1="141" y1="395" x2="137" y2="455" stroke={musculoColor.hex} strokeWidth="3" strokeLinecap="round" opacity="0.75" />
            <line x1="179" y1="395" x2="183" y2="455" stroke={musculoColor.hex} strokeWidth="3" strokeLinecap="round" opacity="0.75" />

            {/* Arm Skeletal Elements */}
            <line x1="112" y1="138" x2="102" y2="225" stroke={musculoColor.hex} strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
            <line x1="208" y1="138" x2="218" y2="225" stroke={musculoColor.hex} strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          </g>

          {/* Caliper Callout Lines */}
          {/* Neuro indicator callout line */}
          <line x1="185" y1="68" x2="255" y2="68" stroke={neuroColor.hex} strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="255" cy="68" r="2.5" fill={neuroColor.hex} />

          {/* Cardio callout line */}
          <line x1="135" y1="160" x2="55" y2="160" stroke={cardioColor.hex} strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="55" cy="160" r="2.5" fill={cardioColor.hex} />

          {/* Immune callout line */}
          <line x1="184" y1="222" x2="255" y2="222" stroke={immuneColor.hex} strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="255" cy="222" r="2.5" fill={immuneColor.hex} />

          {/* Musculoskeletal callout line */}
          <line x1="135" y1="340" x2="55" y2="340" stroke={musculoColor.hex} strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="55" cy="340" r="2.5" fill={musculoColor.hex} />
        </svg>

        {/* Floating Callout Badges */}
        <div className="absolute top-2 right-2 text-right">
          <button
            onClick={() => onSelectZone(selectedZone === 'neurological' ? null : 'neurological')}
            className={`text-xs px-2.5 py-1 rounded-lg border text-left transition-all ${
              selectedZone === 'neurological' ? 'ring-2 ring-cyan-400 bg-slate-800' : 'bg-slate-900/80 hover:bg-slate-800'
            } ${neuroColor.border}`}
          >
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Brain className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cranial / Behavioral</span>
            </div>
            <div className={`font-telemetry text-xs font-bold ${neuroColor.text}`}>
              {riskScores.behavioral_health}% Risk
            </div>
          </button>
        </div>

        <div className="absolute top-[32%] left-2">
          <button
            onClick={() => onSelectZone(selectedZone === 'cardiovascular' ? null : 'cardiovascular')}
            className={`text-xs px-2.5 py-1 rounded-lg border text-left transition-all ${
              selectedZone === 'cardiovascular' ? 'ring-2 ring-cyan-400 bg-slate-800' : 'bg-slate-900/80 hover:bg-slate-800'
            } ${cardioColor.border}`}
          >
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Heart className="w-3.5 h-3.5 text-red-400" />
              <span>Cardiovascular</span>
            </div>
            <div className={`font-telemetry text-xs font-bold ${cardioColor.text}`}>
              {riskScores.cardiovascular}% Risk
            </div>
          </button>
        </div>

        <div className="absolute top-[46%] right-2 text-right">
          <button
            onClick={() => onSelectZone(selectedZone === 'immune_radiation' ? null : 'immune_radiation')}
            className={`text-xs px-2.5 py-1 rounded-lg border text-left transition-all ${
              selectedZone === 'immune_radiation' ? 'ring-2 ring-cyan-400 bg-slate-800' : 'bg-slate-900/80 hover:bg-slate-800'
            } ${immuneColor.border}`}
          >
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Immune & Radiation</span>
            </div>
            <div className={`font-telemetry text-xs font-bold ${immuneColor.text}`}>
              {riskScores.immune_radiation}% Risk
            </div>
          </button>
        </div>

        <div className="absolute bottom-6 left-2">
          <button
            onClick={() => onSelectZone(selectedZone === 'musculoskeletal' ? null : 'musculoskeletal')}
            className={`text-xs px-2.5 py-1 rounded-lg border text-left transition-all ${
              selectedZone === 'musculoskeletal' ? 'ring-2 ring-cyan-400 bg-slate-800' : 'bg-slate-900/80 hover:bg-slate-800'
            } ${musculoColor.border}`}
          >
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Bone & Skeletal</span>
            </div>
            <div className={`font-telemetry text-xs font-bold ${musculoColor.text}`}>
              {riskScores.bone_musculoskeletal}% Risk
            </div>
          </button>
        </div>
      </div>

      {/* Selected Zone Quick Diagnostic Panel */}
      {selectedZone && (
        <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs">
          <div className="flex items-center justify-between font-semibold text-cyan-300 mb-1">
            <span className="capitalize">{selectedZone.replace('_', ' ')} System Drilldown</span>
            <span className="font-telemetry">Telemetry Verified</span>
          </div>
          {selectedZone === 'cardiovascular' && (
            <p className="text-slate-300 leading-relaxed">
              HR: <strong className="text-white">{vitals.heart_rate} bpm</strong> | BP: <strong className="text-white">{vitals.systolic_bp}/{vitals.diastolic_bp} mmHg</strong>. Cephalad fluid shifts induce stroke volume changes and orthostatic intolerance upon repressurization.
            </p>
          )}
          {selectedZone === 'immune_radiation' && (
            <p className="text-slate-300 leading-relaxed">
              Cumulative Dose: <strong className="text-white">{vitals.cumulative_radiation_msv} mSv</strong> | Core Temp: <strong className="text-white">{vitals.core_temp}°C</strong> | WBC Proxy: <strong className="text-white">{vitals.wbc_proxy_marker} k/uL</strong>.
            </p>
          )}
          {selectedZone === 'musculoskeletal' && (
            <p className="text-slate-300 leading-relaxed">
              ARED Resistive Load: <strong className="text-white">{vitals.ared_exercise_mins} min</strong> | Bone Loss Rate: <strong className="text-white">{vitals.bone_density_loss_rate}%/mo</strong>. Microgravity unloading triggers osteoclast resorption.
            </p>
          )}
          {selectedZone === 'neurological' && (
            <p className="text-slate-300 leading-relaxed">
              Sleep: <strong className="text-white">{vitals.sleep_hours}h</strong> | Cognitive Latency: <strong className="text-white">{vitals.cognitive_reaction_latency_ms} ms</strong> | Mood: <strong className="text-white">{vitals.mood_score}/10</strong>.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

