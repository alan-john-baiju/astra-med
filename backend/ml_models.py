"""
ASTRA-MED: Dual-Model AI/ML Evaluation Engine
Model 1: Unsupervised Multi-Vital Anomaly Detection (Isolation Forest)
Model 2: Multi-Domain Risk Forecaster (7-Day Forward Trajectories for NASA Spaceflight Pillars)
Feature Attribution / Explainable AI (XAI)
"""

import math
import numpy as np
from typing import Dict, Any, List, Tuple
from telemetry_engine import VitalsSnapshot

# Check if scikit-learn is available
try:
    from sklearn.ensemble import IsolationForest, RandomForestRegressor
    from sklearn.preprocessing import StandardScaler
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


class MLFlightSurgeonEngine:
    def __init__(self):
        self.feature_names = [
            "heart_rate",
            "systolic_bp",
            "diastolic_bp",
            "spo2",
            "core_temp",
            "blood_glucose",
            "cumulative_radiation_msv",
            "sleep_hours",
            "mood_score",
            "cognitive_reaction_latency_ms",
            "ared_exercise_mins",
            "wbc_proxy_marker",
            "bone_density_loss_rate"
        ]
        
        # NASA Nominal Baselines and standard deviations for z-score scaling
        self.nominal_baselines = {
            "heart_rate": (68.0, 6.0),
            "systolic_bp": (118.0, 7.0),
            "diastolic_bp": (76.0, 5.0),
            "spo2": (98.5, 0.8),
            "core_temp": (36.9, 0.2),
            "blood_glucose": (92.0, 8.0),
            "cumulative_radiation_msv": (25.0, 15.0),
            "sleep_hours": (7.6, 0.7),
            "mood_score": (8.2, 0.8),
            "cognitive_reaction_latency_ms": (225.0, 18.0),
            "ared_exercise_mins": (55.0, 8.0),
            "wbc_proxy_marker": (6.4, 0.9),
            "bone_density_loss_rate": (-0.25, 0.15)
        }

        self.iso_model = None
        self.rf_models = {}
        self.scaler = None
        self.is_trained = False
        
        self._init_models()

    def _generate_synthetic_training_data(self, n_samples: int = 1500) -> Tuple[np.ndarray, Dict[str, np.ndarray]]:
        """Synthesizes high-fidelity spaceflight baseline data for model calibration."""
        np.random.seed(42)
        X = []
        cardio_risk = []
        immune_risk = []
        bone_risk = []
        behavior_risk = []

        for _ in range(n_samples):
            # 80% nominal, 20% mixed spaceflight stressors
            is_anomaly = np.random.rand() > 0.8
            
            hr = np.random.normal(68.0, 6.0)
            sys = np.random.normal(118.0, 7.0)
            dia = np.random.normal(76.0, 5.0)
            spo2 = np.clip(np.random.normal(98.5, 0.8), 92.0, 100.0)
            temp = np.random.normal(36.9, 0.2)
            glucose = np.random.normal(92.0, 8.0)
            rad = np.random.uniform(5.0, 35.0)
            sleep = np.clip(np.random.normal(7.6, 0.7), 3.0, 9.5)
            mood = np.clip(np.random.normal(8.2, 0.8), 1.0, 10.0)
            react = np.random.normal(225.0, 18.0)
            ared = np.clip(np.random.normal(55.0, 8.0), 0.0, 90.0)
            wbc = np.random.normal(6.4, 0.9)
            bmd = np.random.normal(-0.25, 0.15)

            if is_anomaly:
                stress_type = np.random.choice(["spe", "cardio", "fatigue", "bone"])
                if stress_type == "spe":
                    rad += np.random.uniform(30.0, 80.0)
                    temp += np.random.uniform(0.8, 2.2)
                    wbc += np.random.uniform(4.0, 9.0)
                elif stress_type == "cardio":
                    hr += np.random.uniform(25.0, 55.0)
                    sys -= np.random.uniform(15.0, 30.0)
                    ared = np.random.uniform(0.0, 15.0)
                elif stress_type == "fatigue":
                    sleep = np.random.uniform(2.5, 4.5)
                    mood = np.random.uniform(1.5, 4.0)
                    react += np.random.uniform(120.0, 260.0)
                elif stress_type == "bone":
                    ared = np.random.uniform(0.0, 10.0)
                    bmd = np.random.uniform(-1.2, -2.5)

            row = [hr, sys, dia, spo2, temp, glucose, rad, sleep, mood, react, ared, wbc, bmd]
            X.append(row)

            # Ground truth risk formulas (0 to 100)
            # 1. Cardiovascular Risk
            c_r = max(5.0, min(98.0, 
                (max(0, hr - 75) * 1.3) + 
                (max(0, 110 - sys) * 1.8 if sys < 100 else max(0, sys - 130) * 1.2) +
                (max(0, 45 - ared) * 0.8) +
                (max(0, 96 - spo2) * 6.0)
            ))
            cardio_risk.append(c_r)

            # 2. Immune & Radiation Risk
            i_r = max(5.0, min(98.0,
                (max(0, rad - 20) * 1.1) +
                (max(0, temp - 37.2) * 35.0) +
                (max(0, wbc - 8.5) * 6.5) +
                (max(0, glucose - 110) * 0.4)
            ))
            immune_risk.append(i_r)

            # 3. Bone & Musculoskeletal Risk
            b_r = max(5.0, min(98.0,
                (abs(bmd) * 45.0) +
                (max(0, 50 - ared) * 1.1) +
                (max(0, 6.5 - sleep) * 3.0)
            ))
            bone_risk.append(b_r)

            # 4. Behavioral Health Risk
            beh_r = max(5.0, min(98.0,
                (max(0, 7.0 - sleep) * 12.0) +
                (max(0, 7.5 - mood) * 10.0) +
                (max(0, react - 260) * 0.35)
            ))
            behavior_risk.append(beh_r)

        return np.array(X), {
            "cardiovascular": np.array(cardio_risk),
            "immune_radiation": np.array(immune_risk),
            "bone_musculoskeletal": np.array(bone_risk),
            "behavioral_health": np.array(behavior_risk)
        }

    def _init_models(self):
        """Train or initialize Scikit-Learn models or mathematical fallback engine."""
        X, Y_targets = self._generate_synthetic_training_data()
        
        if SKLEARN_AVAILABLE:
            try:
                self.iso_model = IsolationForest(
                    n_estimators=100, 
                    contamination=0.15, 
                    random_state=42
                )
                self.iso_model.fit(X)

                for domain, y in Y_targets.items():
                    rf = RandomForestRegressor(n_estimators=60, max_depth=8, random_state=42)
                    rf.fit(X, y)
                    self.rf_models[domain] = rf

                self.is_trained = True
                print("[ASTRA-MED ML] Scikit-Learn IsolationForest & RandomForestRegressor successfully calibrated.")
                return
            except Exception as e:
                print(f"[ASTRA-MED ML] Scikit-Learn fit failed, falling back to analytic engine: {e}")
                self.is_trained = False
        else:
            print("[ASTRA-MED ML] Scikit-learn not imported. Using high-performance vectorized mathematical inference engine.")
            self.is_trained = False

    def _extract_feature_vector(self, vitals: VitalsSnapshot) -> np.ndarray:
        return np.array([
            vitals.heart_rate,
            vitals.systolic_bp,
            vitals.diastolic_bp,
            vitals.spo2,
            vitals.core_temp,
            vitals.blood_glucose,
            vitals.cumulative_radiation_msv,
            vitals.sleep_hours,
            vitals.mood_score,
            vitals.cognitive_reaction_latency_ms,
            vitals.ared_exercise_mins,
            vitals.wbc_proxy_marker,
            vitals.bone_density_loss_rate
        ])

    def calculate_anomaly_score(self, vitals: VitalsSnapshot) -> float:
        """
        Computes real-time anomaly score (0.0 to 1.0).
        0.0 = nominal spaceflight baseline.
        1.0 = severe multi-vital departure.
        """
        vec = self._extract_feature_vector(vitals)

        if SKLEARN_AVAILABLE and self.is_trained and self.iso_model:
            # sklearn score_samples returns opposite of anomaly score
            raw_score = self.iso_model.score_samples(vec.reshape(1, -1))[0]
            # Normal range approx [-0.8, -0.3] -> map to [0.0, 1.0]
            normalized = np.clip((-(raw_score) - 0.35) / 0.45, 0.05, 0.99)
            return round(float(normalized), 3)
        else:
            # Vectorized multi-dimensional Mahalanobis-like z-score aggregation
            z_sum = 0.0
            for name, val in zip(self.feature_names, vec):
                mean, std = self.nominal_baselines[name]
                z = abs(val - mean) / std
                # Emphasize severe deviations
                z_sum += (z ** 1.8)
            norm = z_sum / (len(self.feature_names) * 3.5)
            anomaly_score = 1.0 / (1.0 + math.exp(-3.5 * (norm - 0.75)))
            return round(float(np.clip(anomaly_score, 0.04, 0.98)), 3)

    def forecast_risk_trajectories(self, vitals: VitalsSnapshot) -> Dict[str, Any]:
        """
        Forecasts current and 7-day projected risk probabilities across the 4 spaceflight domains:
        1. Cardiovascular
        2. Immune & Radiation
        3. Bone & Musculoskeletal
        4. Behavioral Health
        """
        vec = self._extract_feature_vector(vitals)
        current_scores = {}

        if SKLEARN_AVAILABLE and self.is_trained and self.rf_models:
            for domain, model in self.rf_models.items():
                pred = model.predict(vec.reshape(1, -1))[0]
                current_scores[domain] = float(np.clip(pred, 5.0, 99.0))
        else:
            # Analytic Domain Scoring
            # 1. Cardiovascular
            hr_pen = max(0, vitals.heart_rate - 75) * 1.25
            bp_pen = max(0, 105 - vitals.systolic_bp) * 1.7 if vitals.systolic_bp < 100 else max(0, vitals.systolic_bp - 130) * 1.1
            spo2_pen = max(0, 97.0 - vitals.spo2) * 8.0
            ared_pen = max(0, 45.0 - vitals.ared_exercise_mins) * 0.75
            cardio_val = min(99.0, max(6.0, 8.0 + hr_pen + bp_pen + spo2_pen + ared_pen))
            current_scores["cardiovascular"] = round(cardio_val, 1)

            # 2. Immune & Radiation
            rad_pen = max(0, vitals.cumulative_radiation_msv - 22.0) * 1.15
            temp_pen = max(0, vitals.core_temp - 37.2) * 38.0
            wbc_pen = max(0, vitals.wbc_proxy_marker - 8.0) * 6.0
            immune_val = min(99.0, max(5.0, 7.0 + rad_pen + temp_pen + wbc_pen))
            current_scores["immune_radiation"] = round(immune_val, 1)

            # 3. Bone & Musculoskeletal
            bmd_pen = abs(vitals.bone_density_loss_rate) * 44.0
            ex_pen = max(0, 50.0 - vitals.ared_exercise_mins) * 1.05
            bone_val = min(99.0, max(8.0, 10.0 + bmd_pen + ex_pen))
            current_scores["bone_musculoskeletal"] = round(bone_val, 1)

            # 4. Behavioral Health
            sleep_pen = max(0, 7.2 - vitals.sleep_hours) * 13.0
            mood_pen = max(0, 7.5 - vitals.mood_score) * 11.0
            react_pen = max(0, vitals.cognitive_reaction_latency_ms - 250) * 0.32
            beh_val = min(99.0, max(6.0, 8.0 + sleep_pen + mood_pen + react_pen))
            current_scores["behavioral_health"] = round(beh_val, 1)

        # Generate 7-day forward trajectory projections
        projections = []
        for day in range(1, 8):
            day_entry = {"day": f"+{day}d"}
            for domain, cur in current_scores.items():
                # Trend trajectory dynamics based on scenario context
                if vitals.scenario == "SOLAR_PARTICLE_EVENT" and domain == "immune_radiation":
                    delta = math.sin(day * 0.5) * 4.0 - (day * 1.5)  # Peak followed by gradual medical stabilization
                elif vitals.scenario == "CARDIO_DECONDITIONING" and domain == "cardiovascular":
                    delta = day * 1.8  # Unmitigated deconditioning slope
                elif vitals.scenario == "ISOLATION_FATIGUE" and domain == "behavioral_health":
                    delta = day * 2.2  # Accumulating sleep debt slope
                else:
                    delta = math.sin(day * 0.8) * 2.0
                
                projected_val = np.clip(cur + delta, 4.0, 99.0)
                day_entry[domain] = round(float(projected_val), 1)
            projections.append(day_entry)

        # Compute Overall Astronaut Mission Health Readiness Score (0 to 100%)
        # 100 = Peak Astronaut Readiness, lower scores = higher risk
        avg_risk = sum(current_scores.values()) / 4.0
        readiness_score = round(max(5.0, 100.0 - avg_risk), 1)

        return {
            "current_scores": current_scores,
            "readiness_score": readiness_score,
            "seven_day_trajectories": projections
        }

    def compute_explainability(self, vitals: VitalsSnapshot) -> List[Dict[str, Any]]:
        """
        Explainable AI (XAI) feature attribution breakdown:
        Identifies top vital drivers contributing to anomaly/risk deviations.
        """
        vec = self._extract_feature_vector(vitals)
        drivers = []

        for name, val in zip(self.feature_names, vec):
            mean, std = self.nominal_baselines[name]
            deviation = (val - mean) / std
            abs_dev = abs(deviation)

            if abs_dev >= 1.2:
                direction = "ELEVATED" if val > mean else "DEPRESSED"
                pct_diff = round(((val - mean) / mean) * 100.0, 1) if mean != 0 else 0.0
                
                # Clinical impact descriptor
                label_map = {
                    "heart_rate": "Resting Heart Rate",
                    "systolic_bp": "Systolic Blood Pressure",
                    "diastolic_bp": "Diastolic Blood Pressure",
                    "spo2": "Blood Oxygen Saturation (SpO2)",
                    "core_temp": "Core Body Temperature",
                    "blood_glucose": "Fasting Blood Glucose",
                    "cumulative_radiation_msv": "Cumulative Radiation Exposure",
                    "sleep_hours": "Sleep Duration",
                    "mood_score": "Behavioral Mood / Stress Score",
                    "cognitive_reaction_latency_ms": "Cognitive Psychomotor Vigilance",
                    "ared_exercise_mins": "ARED Resistive Exercise Compliance",
                    "wbc_proxy_marker": "Leukocyte / Inflammatory Proxy",
                    "bone_density_loss_rate": "Bone Mineral Density Decay Rate"
                }

                drivers.append({
                    "feature": name,
                    "label": label_map.get(name, name),
                    "current_value": val,
                    "baseline_mean": mean,
                    "z_score": round(deviation, 2),
                    "impact_magnitude": round(abs_dev, 2),
                    "direction": direction,
                    "percentage_delta": pct_diff,
                    "description": f"{direction.capitalize()} by {abs(pct_diff)}% relative to microgravity baseline"
                })

        # Sort by highest impact magnitude
        drivers.sort(key=lambda x: x["impact_magnitude"], reverse=True)
        return drivers[:5]

ml_engine = MLFlightSurgeonEngine()

