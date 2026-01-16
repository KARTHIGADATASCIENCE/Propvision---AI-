from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from collections import defaultdict

from services.image_predict import predict_issue
from services.severity_rules import determine_severity
from services.cost_rules import estimate_cost
from services.translation_service import translate_response
from services.llm_service import generate_structured_diagnosis

app = FastAPI(title="AI Property Issue Diagnosis System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/diagnose")
async def diagnose_issue(
    images: List[UploadFile] = File(...),
    description: str = Form(...),
    language: str = Form("en")
):
    """
    STEP-3:
    Vision + Text fusion + Severity + Cost + LLM + Multilingual
    """

    # --------------------------------------------------
    # STEP 1: Image predictions
    # --------------------------------------------------
    issue_conf_map = defaultdict(list)

    for img in images:
        issue, confidence = predict_issue(img.file)
        issue_conf_map[issue].append(confidence)

    # --------------------------------------------------
    # STEP 2: Safe aggregation (count → confidence)
    # --------------------------------------------------
    max_count = max(len(v) for v in issue_conf_map.values())

    candidates = [
        issue for issue, confs in issue_conf_map.items()
        if len(confs) == max_count
    ]

    if len(candidates) == 1:
        final_issue = candidates[0]
    else:
        final_issue = max(
            candidates,
            key=lambda x: sum(issue_conf_map[x]) / len(issue_conf_map[x])
        )

    final_confidence = round(
        sum(issue_conf_map[final_issue]) / len(issue_conf_map[final_issue]),
        2
    )

    # --------------------------------------------------
    # STEP 2.5: Text–Image Fusion (CRITICAL FIX)
    # --------------------------------------------------
    desc = description.lower()

    TEXT_HINTS = {
        "Crack": ["crack", "fracture", "split", "gap"],
        "Leakage": ["leak", "leakage", "water", "drip", "seep"],
        "Electrical": ["electric", "wire", "spark", "shock", "short"],
        "Mould": ["mould", "fungus", "black spots", "damp"],
        "Algai": ["algai", "algae", "green layer"],
        "Tiles": ["tile", "tiles", "broken tile"]
    }

    for issue, keywords in TEXT_HINTS.items():
        if any(word in desc for word in keywords):
            if issue != final_issue:
                final_issue = issue
                final_confidence = max(final_confidence, 0.85)
            break

    # --------------------------------------------------
    # STEP 3: Severity
    # --------------------------------------------------
    severity = determine_severity(final_issue, description)

    # --------------------------------------------------
    # STEP 4: Cost estimation
    # --------------------------------------------------
    estimated_cost = estimate_cost(final_issue, severity)

    # --------------------------------------------------
    # STEP 5: Human review logic
    # --------------------------------------------------
    human_review = (
        severity == "Immediate"
        or final_confidence < 0.6
        or len(issue_conf_map.keys()) > 1
    )

    # --------------------------------------------------
    # STEP 6: LLM Structured Diagnosis
    # --------------------------------------------------
    llm_data = generate_structured_diagnosis(
        final_issue, severity, description
    )

    response = {
        "issue": final_issue,
        "severity": severity,
        "confidence": final_confidence,

        "technical_reasoning": llm_data["technical_reasoning"],
        "repair_steps": llm_data["repair_steps"],
        "urgency_note": llm_data["urgency_note"],
        "preventive_measures": llm_data["preventive_measures"],

        # "estimated_cost": estimated_cost,
        "human_review": human_review,
        "language": "en"
    }

    # --------------------------------------------------
    # STEP 7: Multilingual wrapper (OUTPUT ONLY)
    # --------------------------------------------------
    response = translate_response(response, language)

    return response
