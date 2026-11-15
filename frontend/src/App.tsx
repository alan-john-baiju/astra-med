import React, { useState, useEffect, useCallback } from 'react';
import { HealthStatusResponse } from './types';
import { Header } from './components/Header';
import { BodyMap } from './components/BodyMap';
import { TelemetryMatrix } from './components/TelemetryMatrix';
import { RiskTrajectoryPanel } from './components/RiskTrajectoryPanel';
import { CountermeasuresList } from './components/CountermeasuresList';
import { SelfCheckInModal } from './components/SelfCheckInModal';
import { Loader2, AlertCircle } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export const App: React.FC = () => {
  const [data, setData] = useState<HealthStatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState<boolean>(false);
  const [isLive, setIsLive] = useState<boolean>(true);

  // Fetch telemetry status
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/telemetry/live`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: HealthStatusResponse = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      console.warn('API fetch warning:', err);
      setError('Connecting to ASTRA-MED Flight Surgeon Core...');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array prevents re-render loop

  // Initial load and periodic polling when live
  useEffect(() => {
    fetchStatus();
    if (!isLive) return;
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [fetchStatus, isLive]);

  // Scenario Switcher
  const handleScenarioChange = async (scenario: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/scenario/set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      });
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed to change scenario:', err);
    }
  };

  // Check-In Submit
  const handleCheckInSubmit = async (payload: any) => {
    try {
      const res = await fetch(`${API_BASE}/api/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed to submit check-in:', err);
    }
  };

  // Complete Countermeasure
  const handleCompleteCountermeasure = async (protocolId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/countermeasures/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocol_id: protocolId }),
      });
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed to complete protocol:', err);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center text-cyan-400 gap-3">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="font-telemetry text-sm tracking-wider">
          INITIALIZING ASTRA-MED FLIGHT SURGEON TELEMETRY STREAM...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] bg-grid-hud text-slate-100 flex flex-col font-sans">
      {/* Top Console Navigation & Header */}
      <Header
        currentScenario={data?.scenario || 'NOMINAL_CRUISE'}
        onScenarioChange={handleScenarioChange}
        overallStatus={data?.overall_status || 'NOMINAL'}
        statusColor={data?.status_color || 'emerald'}
        readinessScore={data?.readiness_score || 92}
        missionDay={data?.mission_day || 42}
        streakDays={data?.crew_streak_days || 14}
        readinessXp={data?.crew_readiness_xp || 1850}
        onOpenCheckIn={() => setIsCheckInOpen(true)}
        isLive={isLive}
        onToggleLive={() => setIsLive((prev) => !prev)}
      />

      {/* Connection notice if offline */}
      {error && !data && (
        <div className="bg-amber-950/80 border-b border-amber-500/50 p-2 text-center text-xs text-amber-300 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Row 1: Vital Indicators Matrix ("Gather Health Indicators") */}
        {data && (
          <TelemetryMatrix
            vitals={data.vitals}
            onFilterZone={setSelectedZone}
          />
        )}

        {/* Row 2: Interactive Anatomical Map + ML Evaluation & Countermeasures */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Interactive SVG Human Body Map (5 Cols on LG) */}
          <div className="lg:col-span-5 h-full">
            {data && (
              <BodyMap
                riskScores={data.risk_scores}
                vitals={data.vitals}
                selectedZone={selectedZone}
                onSelectZone={setSelectedZone}
              />
            )}
          </div>

          {/* Right Column: ML Trajectory Forecaster + Prioritized Countermeasures (7 Cols on LG) */}
          <div className="lg:col-span-7 space-y-5">
            {data && (
              <>
                {/* Panel 1: ML Trajectory & Explainability ("Evaluate Health Status") */}
                <RiskTrajectoryPanel
                  readinessScore={data.readiness_score}
                  anomalyScore={data.anomaly_score}
                  riskScores={data.risk_scores}
                  trajectories={data.seven_day_trajectories}
                  topDrivers={data.top_drivers}
                  selectedZone={selectedZone}
                />

                {/* Panel 2: Prioritized Clinical Countermeasures ("Act on Health Status") */}
                <CountermeasuresList
                  countermeasures={data.countermeasures}
                  onComplete={handleCompleteCountermeasure}
                  selectedZone={selectedZone}
                />
              </>
            )}
          </div>
        </div>
      </main>

      {/* Daily Astronaut Self-Check-In Modal */}
      <SelfCheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSubmit={handleCheckInSubmit}
        missionDay={data?.mission_day || 42}
      />

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-800/80 py-3 px-6 mt-6 text-center text-xs text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>ASTRA-MED Flight Surgeon Core v1.0.0 — Autonomous Microgravity Bio-Telemetric Architecture</span>
        </div>
        <div>
          <span>NASA Space Apps Challenge 2026 | Health Monitoring for Astronauts</span>
        </div>
      </footer>
    </div>
  );
};

export default App;

