import sys
sys.path.append("backend")
from telemetry_engine import telemetry_engine
from main import get_live_health_status

scenarios = ['NOMINAL_CRUISE', 'SOLAR_PARTICLE_EVENT', 'CARDIO_DECONDITIONING', 'ISOLATION_FATIGUE']
for sc in scenarios:
    telemetry_engine.set_scenario(sc)
    s = get_live_health_status()
    print(f"Scenario: {sc} -> Readiness: {s['readiness_score']}%, Anomaly: {s['anomaly_score']}, Alert: {s['overall_status']}, Countermeasures: {len(s['countermeasures'])}")
    print(f"  Risk scores: {s['risk_scores']}")
    print(f"  Top driver: {s['top_drivers'][0]['description'] if s['top_drivers'] else 'None'}")

