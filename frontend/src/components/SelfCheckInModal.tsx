import React, { useState } from 'react';
import { X, CheckCircle, Moon, Smile, Dumbbell, AlertTriangle, Send } from 'lucide-react';

interface SelfCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  missionDay: number;
}

export const SelfCheckInModal: React.FC<SelfCheckInModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  missionDay,
}) => {
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [moodScore, setMoodScore] = useState<number>(8);
  const [fatigueLevel, setFatigueLevel] = useState<number>(3);
  const [bloodGlucose, setBloodGlucose] = useState<number>(92);
  const [aredExerciseMins, setAredExerciseMins] = useState<number>(50);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const spaceflightSymptoms = [
    'Space Motion Sickness (SMS)',
    'Cephalad Fluid Congestion (Head Fullness)',
    'Orthostatic Dizziness / Pre-Syncope',
    'Lumbar Spine Elongation Ache',
    'SANS Visual Changes (Blurred Vision)',
    'Circadian Insomnia / Fragmented Sleep',
    'Spaceflight Anorexia / Appetite Loss'
  ];

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        mission_day: missionDay,
        sleep_hours: Number(sleepHours),
        mood_score: Number(moodScore),
        fatigue_level: Number(fatigueLevel),
        blood_glucose: Number(bloodGlucose),
        ared_exercise_mins: Number(aredExerciseMins),
        symptoms: selectedSymptoms,
        notes: notes,
      });
      onClose();
    } catch (err) {
      console.error('Check-in error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel border border-cyan-500/30 w-full max-w-xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto relative shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="text-lg font-bold font-heading text-white tracking-wide">
                Daily Astronaut Self-Check-In
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-telemetry">
              Gather Health Indicators — Mission Day {missionDay} (Flight Surgeon Log)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="mt-5 space-y-5">
          {/* Sleep Hours */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-cyan-400" />
                <span>Sleep Architecture (Last Sleep Period)</span>
              </label>
              <span className="text-xs font-mono font-bold text-cyan-300">
                {sleepHours} Hours
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="12.0"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-2"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>Severe Sleep Debt (&lt;4h)</span>
              <span>Nominal (7.5-8.5h)</span>
              <span>Extended (&gt;10h)</span>
            </div>
          </div>

          {/* Mood / Stress Score */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-amber-400" />
                <span>Psychological Mood & Morale Score</span>
              </label>
              <span className="text-xs font-mono font-bold text-amber-300">
                {moodScore} / 10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={moodScore}
              onChange={(e) => setMoodScore(parseInt(e.target.value))}
              className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer h-2"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>1 (Severe Isolation Strain)</span>
              <span>5 (Neutral)</span>
              <span>10 (Peak Morale)</span>
            </div>
          </div>

          {/* Subjective Fatigue & ARED Exercise */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                Subjective Physical Fatigue (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={fatigueLevel}
                onChange={(e) => setFatigueLevel(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />
                <span>ARED Resistive Exercise (min)</span>
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={aredExerciseMins}
                onChange={(e) => setAredExerciseMins(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Symptoms Checklist */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Self-Reported Spaceflight Symptoms (Select All Active)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {spaceflightSymptoms.map((sym) => {
                const active = selectedSymptoms.includes(sym);
                return (
                  <button
                    type="button"
                    key={sym}
                    onClick={() => toggleSymptom(sym)}
                    className={`text-left text-xs p-2.5 rounded-xl border transition-all ${
                      active
                        ? 'bg-rose-500/20 border-rose-500/60 text-rose-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${active ? 'bg-rose-500 border-rose-500' : 'border-slate-600'}`}>
                        {active && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <span className="truncate">{sym}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subjective Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">
              Mission Log / Clinical Observations
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., Mild headache post-exercise, elevated cabin CO2 noticed at 04:00..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-98 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Updating AI Flight Surgeon Models...' : 'Submit Health Check-In & Recalculate Risk (+50 XP)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

