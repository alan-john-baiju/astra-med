"""
ASTRA-MED: Autonomous Action & Countermeasure Recommender
Translates multi-domain ML risk scores and feature attributions into prioritized NASA clinical countermeasures.
"""

from typing import List, Dict, Any
from telemetry_engine import VitalsSnapshot

class CountermeasureProtocol:
    def __init__(
        self,
        id: str,
        domain: str,
        title: str,
        urgency: str, # CRITICAL, WARNING, ADVISORY, ROUTINE
        action: str,
        rationale: str,
        steps: List[str],
        xp_reward: int,
        target_zone: str, # neurological, cardiovascular, immune_radiation, musculoskeletal
    ):
        self.id = id
        self.domain = domain
        self.title = title
        self.urgency = urgency
        self.action = action
        self.rationale = rationale
        self.steps = steps
        self.xp_reward = xp_reward
        self.target_zone = target_zone

    def to_dict(self, completed: bool = False) -> Dict[str, Any]:
        return {
            "id": self.id,
            "domain": self.domain,
            "title": self.title,
            "urgency": self.urgency,
            "action": self.action,
            "rationale": self.rationale,
            "steps": self.steps,
            "xp_reward": self.xp_reward,
            "target_zone": self.target_zone,
            "completed": completed
        }


class CountermeasureEngine:
    def __init__(self):
        self.completed_protocol_ids = set()

    def mark_completed(self, protocol_id: str) -> bool:
        self.completed_protocol_ids.add(protocol_id)
        return True

    def reset_completed(self):
        self.completed_protocol_ids.clear()

    def generate_countermeasures(
        self, 
        vitals: VitalsSnapshot, 
        risk_scores: Dict[str, float], 
        top_drivers: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        protocols: List[CountermeasureProtocol] = []

        cardio_risk = risk_scores.get("cardiovascular", 10.0)
        immune_risk = risk_scores.get("immune_radiation", 10.0)
        bone_risk = risk_scores.get("bone_musculoskeletal", 10.0)
        behavior_risk = risk_scores.get("behavioral_health", 10.0)

        # 1. Cardiovascular Protocols
        if cardio_risk >= 70.0 or vitals.systolic_bp < 95.0 or vitals.heart_rate > 100.0:
            protocols.append(CountermeasureProtocol(
                id="CM-CARDIO-01",
                domain="Cardiovascular",
                title="Acute Orthostatic Fluid-Loading Protocol",
                urgency="CRITICAL",
                action="Initiate 500mL electrolyte fluid-loading protocol with oral isotonic saline.",
                rationale="Counteract cephalad fluid shift, blunted baroreceptor sensitivity, and acute orthostatic hypotension.",
                steps=[
                    "Consume 500 mL water infused with 2 oral electrolyte-sodium tablets over 20 minutes.",
                    "Don Lower-Body Compression Garment (Class II medical grade: 30-40 mmHg).",
                    "Conduct 20-minute Lower Body Negative Pressure (LBNP) chamber pre-test at -35 mmHg.",
                    "Re-measure resting and standing BP after 30 minutes."
                ],
                xp_reward=150,
                target_zone="cardiovascular"
            ))
        elif cardio_risk >= 40.0:
            protocols.append(CountermeasureProtocol(
                id="CM-CARDIO-02",
                domain="Cardiovascular",
                title="Cardiac Conditioning Interval Session",
                urgency="WARNING",
                action="Perform 30-min high-intensity cycle ergometer interval training (CEVIS).",
                rationale="Elevate stroke volume and maintain myocardial wall compliance against microgravity remodeling.",
                steps=[
                    "Warm up for 5 minutes at 100W.",
                    "Complete 6 intervals of 2 minutes at 85% VO2 max / 2 minutes recovery.",
                    "Log peak heart rate and post-exercise recovery cadence."
                ],
                xp_reward=100,
                target_zone="cardiovascular"
            ))

        # 2. Immune Changes & Radiation Exposure Protocols
        if immune_risk >= 70.0 or vitals.cumulative_radiation_msv > 40.0 or vitals.core_temp > 38.0:
            protocols.append(CountermeasureProtocol(
                id="CM-IMMUNE-01",
                domain="Immune & Radiation",
                title="Deep-Space Storm Shelter Relocation & Shielding Protocol",
                urgency="CRITICAL",
                action="Relocate crew immediately to radiation-hardened storm shelter module & deploy supplementary water-wall shielding.",
                rationale="Mitigate acute biological dose during high-energy solar particle event (SPE) and suppress cytokine storm.",
                steps=[
                    "Muster all crew members inside the Deep-Space Storm Shelter Module (Module 4).",
                    "Deploy active polyethylene polymer shielding tiles around sleeping berths.",
                    "Administer antioxidant/antiviral prophylaxis (N-acetylcysteine 600mg + Ascorbic Acid 1000mg).",
                    "Monitor core body temperature every 90 minutes via ingestible telemetry sensor pill."
                ],
                xp_reward=200,
                target_zone="immune_radiation"
            ))
        elif immune_risk >= 40.0:
            protocols.append(CountermeasureProtocol(
                id="CM-IMMUNE-02",
                domain="Immune & Radiation",
                title="Immunological Modulation & Cytokine Surveillance",
                urgency="WARNING",
                action="Administer oral immunomodulator packet and verify cabin particulate filtration.",
                rationale="Address mild space fever and immune dysregulation caused by closed-loop environmental stressors.",
                steps=[
                    "Inspect HEPA and photocatalytic oxidation air filters in living quarters.",
                    "Consume oral multi-strain probiotic and zinc supplement.",
                    "Perform saliva biomarker test strip for latent herpesvirus (EBV/VZV) reactivation."
                ],
                xp_reward=100,
                target_zone="immune_radiation"
            ))

        # 3. Bone Loss & Musculoskeletal Deconditioning Protocols
        if bone_risk >= 70.0 or vitals.ared_exercise_mins < 20.0 or vitals.bone_density_loss_rate < -1.0:
            protocols.append(CountermeasureProtocol(
                id="CM-BONE-01",
                domain="Bone & Musculoskeletal",
                title="Intensive ARED Resistive Loading & Axial Compression",
                urgency="CRITICAL" if vitals.ared_exercise_mins < 15.0 else "WARNING",
                action="Execute 45-minute ARED lower-body eccentric loading session with axial spine compression.",
                rationale="Halt microgravity osteoclastic bone resorption in proximal femur and lumbar vertebrae.",
                steps=[
                    "Calibrate Advanced Resistive Exercise Device (ARED) piston load to 240 lbs.",
                    "Perform 4 sets of 8 repetitions: Deep Squats with full eccentric control.",
                    "Perform 4 sets of 10 repetitions: Heel-Raise Calf Presses.",
                    "Ingest 1000mg Calcium Citrate with 2000 IU Vitamin D3 post-exercise."
                ],
                xp_reward=120,
                target_zone="musculoskeletal"
            ))
        else:
            protocols.append(CountermeasureProtocol(
                id="CM-BONE-02",
                domain="Bone & Musculoskeletal",
                title="Daily Skeletal Maintenance Loading",
                urgency="ROUTINE",
                action="Complete scheduled 45-minute ARED multi-joint loading session.",
                rationale="Maintain baseline musculoskeletal integrity and tendon stiffness in microgravity.",
                steps=[
                    "Conduct standard ARED deadlift and bench press sequence.",
                    "Verify daily compliance log in Mission Health Database."
                ],
                xp_reward=80,
                target_zone="musculoskeletal"
            ))

        # 4. Behavioral Health Protocols
        if behavior_risk >= 70.0 or vitals.sleep_hours < 4.5 or vitals.cognitive_reaction_latency_ms > 350.0:
            protocols.append(CountermeasureProtocol(
                id="CM-BEHAVIOR-01",
                domain="Behavioral Health",
                title="Circadian Reset & Dynamic 480nm Spectrum Lighting Shift",
                urgency="CRITICAL",
                action="Switch crew quarters solid-state lighting to 480nm cyan-enriched circadian spectrum & enforce 45-min sensory rest.",
                rationale="Reverse acute sleep debt accumulation, circadian phase delay, and restore psychomotor vigilance.",
                steps=[
                    "Command habitat Solid-State Lighting Assemblies (SSLA) to Dynamic Phase Reset Mode.",
                    "Initiate mandatory 45-minute neuro-cognitive rest protocol with noise-canceling auditory dampening.",
                    "Complete 10-minute automated Psychomotor Vigilance Task (PVT) on crew tablet.",
                    "Review audio message packet received from ground family relay."
                ],
                xp_reward=140,
                target_zone="neurological"
            ))
        elif behavior_risk >= 40.0:
            protocols.append(CountermeasureProtocol(
                id="CM-BEHAVIOR-02",
                domain="Behavioral Health",
                title="Confinement Stress Relief & Virtual Earth Environment",
                urgency="WARNING",
                action="Initiate 25-minute immersive Virtual Reality (VR) natural biophilic environment session.",
                rationale="Alleviate sensory monotony and isolation-induced autonomic hyper-arousal.",
                steps=[
                    "Don habitat VR headset and select 'Terrestrial Redwood Forest' audio-visual immersion.",
                    "Follow guided diaphragmatic pacing (4-7-8 respiration pattern).",
                    "Log subjective stress rating delta post-immersion."
                ],
                xp_reward=90,
                target_zone="neurological"
            ))

        # Format and annotate with completion status
        result = []
        for p in protocols:
            is_done = p.id in self.completed_protocol_ids
            result.append(p.to_dict(completed=is_done))

        # Sort by urgency: CRITICAL > WARNING > ADVISORY > ROUTINE
        urgency_rank = {"CRITICAL": 0, "WARNING": 1, "ADVISORY": 2, "ROUTINE": 3}
        result.sort(key=lambda x: urgency_rank.get(x["urgency"], 4))
        return result

countermeasure_engine = CountermeasureEngine()

