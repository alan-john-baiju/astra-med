"""
ASTRA-MED: Autonomous Deep-Space Astronaut Health Monitoring & AI Flight Surgeon System
Module: Telemetry Engine (NASA Physiological Baselines & Mission Scenario Presets)
"""

import time
import math
import random
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class VitalsSnapshot(BaseModel):
    timestamp: float = Field(default_factory=time.time)
    mission_day: int = 42
    heart_rate: float
    systolic_bp: float
    diastolic_bp: float
    spo2: float
    core_temp: float
    blood_glucose: float
    cumulative_radiation_msv: float
    sleep_hours: float
    mood_score: float  # 1 to 10
    cognitive_reaction_latency_ms: float
    ared_exercise_mins: float
    wbc_proxy_marker: float  # k/uL
    bone_density_loss_rate: float  # % per month proxy
    symptoms: List[str] = Field(default_factory=list)
    scenario: str = "NOMINAL_CRUISE"

class CheckInPayload(BaseModel):
    mission_day: Optional[int] = None
    mood_score: float = Field(..., ge=1.0, le=10.0)
    sleep_hours: float = Field(..., ge=0.0, le=16.0)
    blood_glucose: Optional[float] = None
    fatigue_level: int = Field(default=3, ge=1, le=10)
    symptoms: List[str] = Field(default_factory=list)
    ared_exercise_mins: Optional[float] = None
    notes: Optional[str] = ""

class TelemetryEngine:
    def __init__(self):
        self.current_scenario = "NOMINAL_CRUISE"
        self.mission_day = 42
        self.mission_start_time = time.time()
        self.checkin_overrides: Dict[str, Any] = {}
        self.completed_protocols: List[Dict[str, Any]] = []
        self.health_streak: int = 14
        self.health_xp: int = 1850

        # Scenario Presets
        self.scenarios = {
            "NOMINAL_CRUISE": {
                "name": "Nominal Cruise",
                "description": "Healthy baseline microgravity adaptation during Earth-to-Mars transit.",
                "hr_base": 68.0,
                "hr_noise": 3.0,
                "sys_base": 118.0,
                "dia_base": 76.0,
                "spo2_base": 98.4,
                "temp_base": 36.9,
                "glucose_base": 92.0,
                "rad_rate": 0.48, # mSv/day
                "sleep_base": 7.6,
                "mood_base": 8.2,
                "reaction_base": 225.0, # ms
                "ared_base": 55.0, # min
                "wbc_base": 6.4,
                "bmd_loss_rate": -0.25 # %/mo
            },
            "SOLAR_PARTICLE_EVENT": {
                "name": "Solar Particle Event (SPE)",
                "description": "Coronal mass ejection transit alert: acute radiation surge, cytokine inflammatory cascade, elevated core temperature.",
                "hr_base": 88.0,
                "hr_noise": 5.0,
                "sys_base": 132.0,
                "dia_base": 84.0,
                "spo2_base": 96.8,
                "temp_base": 38.3, # "Space fever" / immune reaction
                "glucose_base": 124.0,
                "rad_rate": 42.5, # massive surge
                "sleep_base": 5.8,
                "mood_base": 5.1,
                "reaction_base": 310.0,
                "ared_base": 20.0,
                "wbc_base": 13.8, # inflammatory spike
                "bmd_loss_rate": -0.5
            },
            "CARDIO_DECONDITIONING": {
                "name": "Cardiovascular Deconditioning",
                "description": "Cephalad fluid shift baroreceptor blunting, orthostatic intolerance, resting tachycardia, missed resistive countermeasures.",
                "hr_base": 108.0,
                "hr_noise": 8.0,
                "sys_base": 94.0, # Orthostatic hypotension risk
                "dia_base": 64.0,
                "spo2_base": 95.2,
                "temp_base": 37.1,
                "glucose_base": 105.0,
                "rad_rate": 0.52,
                "sleep_base": 6.2,
                "mood_base": 6.0,
                "reaction_base": 275.0,
                "ared_base": 10.0, # Severely reduced exercise
                "wbc_base": 7.1,
                "bmd_loss_rate": -1.45 # Accelerated bone decay
            },
            "ISOLATION_FATIGUE": {
                "name": "Isolation & Circadian Fatigue",
                "description": "Deep-space confinement fatigue, severe circadian desynchrony, chronic sleep debt, elevated cognitive latency.",
                "hr_base": 82.0,
                "hr_noise": 6.0,
                "sys_base": 126.0,
                "dia_base": 82.0,
                "spo2_base": 97.0,
                "temp_base": 36.8,
                "glucose_base": 112.0,
                "rad_rate": 0.50,
                "sleep_base": 3.9, # Acute sleep deprivation
                "mood_base": 3.2, # Depressive/anxiety stress
                "reaction_base": 445.0, # High reaction latency
                "ared_base": 25.0,
                "wbc_base": 8.8,
                "bmd_loss_rate": -0.45
            }
        }

    def set_scenario(self, scenario_key: str) -> bool:
        if scenario_key in self.scenarios:
            self.current_scenario = scenario_key
            self.checkin_overrides.clear()
            return True
        return False

    def get_current_vitals(self) -> VitalsSnapshot:
        cfg = self.scenarios[self.current_scenario]
        t = time.time()
        # Very gentle, slow micro-physiological respiration cycle
        hr_jitter = math.sin(t * 0.05) * 0.5
        sys_jitter = math.sin(t * 0.03) * 0.4
        dia_jitter = math.cos(t * 0.03) * 0.3
        temp_jitter = math.sin(t * 0.01) * 0.01
        react_jitter = math.sin(t * 0.02) * 1.0

        # Baseline accumulated radiation up to mission day
        base_rad = (self.mission_day * 0.48)
        if self.current_scenario == "SOLAR_PARTICLE_EVENT":
            base_rad += 68.4  # Acute SPE dosage addition

        # Incorporate checkin overrides if astronaut manually logged indicators (100% stable)
        sleep = self.checkin_overrides.get("sleep_hours", cfg["sleep_base"])
        mood = self.checkin_overrides.get("mood_score", cfg["mood_base"])
        glucose = self.checkin_overrides.get("blood_glucose", cfg["glucose_base"])
        ared = self.checkin_overrides.get("ared_exercise_mins", cfg["ared_base"])
        symptoms = self.checkin_overrides.get("symptoms", [])

        # If user reported high fatigue in checkin, adjust reaction latency
        fatigue = self.checkin_overrides.get("fatigue_level", 3)
        extra_latency = (fatigue - 3) * 25.0

        return VitalsSnapshot(
            timestamp=t,
            mission_day=self.mission_day,
            heart_rate=round(max(45.0, cfg["hr_base"] + hr_jitter), 1),
            systolic_bp=round(max(70.0, cfg["sys_base"] + sys_jitter), 1),
            diastolic_bp=round(max(45.0, cfg["dia_base"] + dia_jitter), 1),
            spo2=round(min(100.0, max(88.0, cfg["spo2_base"])), 1),
            core_temp=round(max(35.5, cfg["temp_base"] + temp_jitter), 2),
            blood_glucose=round(max(60.0, glucose), 1),
            cumulative_radiation_msv=round(base_rad, 2),
            sleep_hours=round(max(1.0, sleep), 1),
            mood_score=round(max(1.0, min(10.0, mood)), 1),
            cognitive_reaction_latency_ms=round(max(180.0, cfg["reaction_base"] + react_jitter + extra_latency), 1),
            ared_exercise_mins=round(max(0.0, ared), 1),
            wbc_proxy_marker=round(cfg["wbc_base"], 2),
            bone_density_loss_rate=round(cfg["bmd_loss_rate"], 2),
            symptoms=symptoms,
            scenario=self.current_scenario
        )

    def log_checkin(self, payload: CheckInPayload) -> VitalsSnapshot:
        if payload.mission_day:
            self.mission_day = payload.mission_day
        self.checkin_overrides["mood_score"] = payload.mood_score
        self.checkin_overrides["sleep_hours"] = payload.sleep_hours
        self.checkin_overrides["fatigue_level"] = payload.fatigue_level
        if payload.blood_glucose is not None:
            self.checkin_overrides["blood_glucose"] = payload.blood_glucose
        if payload.ared_exercise_mins is not None:
            self.checkin_overrides["ared_exercise_mins"] = payload.ared_exercise_mins
        if payload.symptoms:
            self.checkin_overrides["symptoms"] = payload.symptoms
        
        # Award XP for logging health indicator
        self.health_xp += 50
        return self.get_current_vitals()

    def get_longitudinal_history(self, days: int = 30) -> List[Dict[str, Any]]:
        history = []
        end_day = self.mission_day
        start_day = max(1, end_day - days + 1)
        cfg = self.scenarios[self.current_scenario]

        for d in range(start_day, end_day + 1):
            # Gradual shift towards the active scenario state over the last 10 days
            ratio = min(1.0, max(0.1, (d - start_day) / float(days)))
            
            # Baseline nominal values
            nom = self.scenarios["NOMINAL_CRUISE"]
            hr = nom["hr_base"] + (cfg["hr_base"] - nom["hr_base"]) * ratio + random.uniform(-3, 3)
            sys = nom["sys_base"] + (cfg["sys_base"] - nom["sys_base"]) * ratio + random.uniform(-4, 4)
            temp = nom["temp_base"] + (cfg["temp_base"] - nom["temp_base"]) * ratio + random.uniform(-0.15, 0.15)
            sleep = nom["sleep_base"] + (cfg["sleep_base"] - nom["sleep_base"]) * ratio + random.uniform(-0.4, 0.4)
            mood = nom["mood_base"] + (cfg["mood_base"] - nom["mood_base"]) * ratio + random.uniform(-0.3, 0.3)
            rad = d * 0.48 + (68.4 * ratio if self.current_scenario == "SOLAR_PARTICLE_EVENT" else 0.0)
            react = nom["reaction_base"] + (cfg["reaction_base"] - nom["reaction_base"]) * ratio + random.uniform(-10, 10)
            ared = nom["ared_base"] + (cfg["ared_base"] - nom["ared_base"]) * ratio + random.uniform(-4, 4)
            bmd = nom["bmd_loss_rate"] + (cfg["bmd_loss_rate"] - nom["bmd_loss_rate"]) * ratio

            history.append({
                "mission_day": d,
                "heart_rate": round(hr, 1),
                "systolic_bp": round(sys, 1),
                "core_temp": round(temp, 2),
                "sleep_hours": round(max(2.0, sleep), 1),
                "mood_score": round(max(1.0, min(10.0, mood)), 1),
                "cumulative_radiation_msv": round(rad, 2),
                "reaction_latency_ms": round(react, 1),
                "ared_exercise_mins": round(max(0.0, ared), 1),
                "bone_loss_rate": round(bmd, 2)
            })

        return history

telemetry_engine = TelemetryEngine()

