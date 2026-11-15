"""
ASTRA-MED: FastAPI Flight Surgeon Backend Server
Autonomous Deep-Space Astronaut Health Monitoring & AI Flight Surgeon System
"""

import os
import sys

# Ensure current backend directory is in sys.path regardless of execution CWD
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

import json
import asyncio
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from telemetry_engine import telemetry_engine, CheckInPayload
from ml_models import ml_engine
from countermeasures import countermeasure_engine

app = FastAPI(
    title="ASTRA-MED: AI Flight Surgeon API",
    description="Autonomous Deep-Space Astronaut Health Monitoring & Multi-Domain Risk Forecaster",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server and browser clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScenarioRequest(BaseModel):
    scenario: str

class ProtocolCompletionRequest(BaseModel):
    protocol_id: str

@app.get("/")
def root():
    return {
        "system": "ASTRA-MED Autonomous AI Flight Surgeon",
        "challenge": "NASA Space Apps 2026",
        "status": "ONLINE",
        "mission_day": telemetry_engine.mission_day,
        "active_scenario": telemetry_engine.current_scenario
    }

@app.get("/api/health")
def health():
    return {"status": "ok", "ml_engine_ready": True}

@app.get("/api/scenarios")
def get_scenarios():
    return {
        "active_scenario": telemetry_engine.current_scenario,
        "scenarios": telemetry_engine.scenarios
    }

@app.post("/api/scenario/set")
def set_scenario(req: ScenarioRequest):
    success = telemetry_engine.set_scenario(req.scenario)
    if not success:
        raise HTTPException(status_code=400, detail=f"Invalid scenario key: {req.scenario}")
    countermeasure_engine.reset_completed()
    return {
        "message": f"Scenario changed to {req.scenario}",
        "active_scenario": telemetry_engine.current_scenario,
        "data": get_live_health_status()
    }

def get_live_health_status() -> Dict[str, Any]:
    """Core aggregation pipeline uniting telemetry, dual ML models, XAI, and countermeasures."""
    vitals = telemetry_engine.get_current_vitals()
    anomaly_score = ml_engine.calculate_anomaly_score(vitals)
    risk_data = ml_engine.forecast_risk_trajectories(vitals)
    top_drivers = ml_engine.compute_explainability(vitals)
    countermeasures = countermeasure_engine.generate_countermeasures(
        vitals, 
        risk_data["current_scores"], 
        top_drivers
    )

    # Classify overall clinical alert status
    readiness = risk_data["readiness_score"]
    if readiness < 50.0 or anomaly_score > 0.75:
        overall_status = "CRITICAL_ACTION_REQUIRED"
        status_color = "crimson"
    elif readiness < 75.0 or anomaly_score > 0.45:
        overall_status = "WATCH_ADVISORY"
        status_color = "amber"
    else:
        overall_status = "NOMINAL"
        status_color = "emerald"

    return {
        "vitals": vitals.model_dump(),
        "mission_day": telemetry_engine.mission_day,
        "scenario": telemetry_engine.current_scenario,
        "overall_status": overall_status,
        "status_color": status_color,
        "readiness_score": readiness,
        "anomaly_score": anomaly_score,
        "risk_scores": risk_data["current_scores"],
        "seven_day_trajectories": risk_data["seven_day_trajectories"],
        "top_drivers": top_drivers,
        "countermeasures": countermeasures,
        "crew_streak_days": telemetry_engine.health_streak,
        "crew_readiness_xp": telemetry_engine.health_xp
    }

@app.get("/api/telemetry/live")
def live_telemetry():
    return get_live_health_status()

@app.get("/api/telemetry/stream")
async def stream_telemetry():
    """Server-Sent Events (SSE) endpoint providing streaming live telemetry updates."""
    async def event_generator():
        while True:
            data = get_live_health_status()
            yield f"data: {json.dumps(data)}\n\n"
            await asyncio.sleep(2.0)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.post("/api/checkin")
def astronaut_checkin(payload: CheckInPayload):
    telemetry_engine.log_checkin(payload)
    # Recalculate full ML status immediately
    return {
        "status": "CHECKIN_LOGGED",
        "message": "Daily astronaut health indicators ingested. Real-time ML risk vectors updated.",
        "data": get_live_health_status()
    }

@app.get("/api/history")
def get_history(days: int = Query(default=30, ge=5, le=180)):
    return {
        "days": days,
        "history": telemetry_engine.get_longitudinal_history(days=days)
    }

@app.post("/api/countermeasures/complete")
def complete_countermeasure(req: ProtocolCompletionRequest):
    countermeasure_engine.mark_completed(req.protocol_id)
    telemetry_engine.health_xp += 100
    telemetry_engine.health_streak += 1
    return {
        "status": "PROTOCOL_COMPLETED",
        "protocol_id": req.protocol_id,
        "new_xp": telemetry_engine.health_xp,
        "new_streak": telemetry_engine.health_streak,
        "data": get_live_health_status()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True, app_dir=CURRENT_DIR)

