export interface VitalsSnapshot {
  timestamp: number;
  mission_day: number;
  heart_rate: number;
  systolic_bp: number;
  diastolic_bp: number;
  spo2: number;
  core_temp: number;
  blood_glucose: number;
  cumulative_radiation_msv: number;
  sleep_hours: number;
  mood_score: number;
  cognitive_reaction_latency_ms: number;
  ared_exercise_mins: number;
  wbc_proxy_marker: number;
  bone_density_loss_rate: number;
  symptoms: string[];
  scenario: string;
}

export interface RiskScores {
  cardiovascular: number;
  immune_radiation: number;
  bone_musculoskeletal: number;
  behavioral_health: number;
}

export interface DayTrajectory {
  day: string;
  cardiovascular: number;
  immune_radiation: number;
  bone_musculoskeletal: number;
  behavioral_health: number;
}

export interface ExplainabilityDriver {
  feature: string;
  label: string;
  current_value: number;
  baseline_mean: number;
  z_score: number;
  impact_magnitude: number;
  direction: 'ELEVATED' | 'DEPRESSED';
  percentage_delta: number;
  description: string;
}

export interface Countermeasure {
  id: string;
  domain: string;
  title: string;
  urgency: 'CRITICAL' | 'WARNING' | 'ADVISORY' | 'ROUTINE';
  action: string;
  rationale: string;
  steps: string[];
  xp_reward: number;
  target_zone: 'neurological' | 'cardiovascular' | 'immune_radiation' | 'musculoskeletal';
  completed: boolean;
}

export interface HealthStatusResponse {
  vitals: VitalsSnapshot;
  mission_day: number;
  scenario: string;
  overall_status: 'NOMINAL' | 'WATCH_ADVISORY' | 'CRITICAL_ACTION_REQUIRED';
  status_color: 'emerald' | 'amber' | 'crimson';
  readiness_score: number;
  anomaly_score: number;
  risk_scores: RiskScores;
  seven_day_trajectories: DayTrajectory[];
  top_drivers: ExplainabilityDriver[];
  countermeasures: Countermeasure[];
  crew_streak_days: number;
  crew_readiness_xp: number;
}

export interface ScenarioInfo {
  name: string;
  description: string;
  hr_base: number;
  sys_base: number;
  temp_base: number;
  rad_rate: number;
  sleep_base: number;
  mood_base: number;
}

