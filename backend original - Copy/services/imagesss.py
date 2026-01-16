import numpy as np
from tensorflow.keras.models import load_model

from utils.preprocess import preprocess_image

# Load model once
MODEL_PATH = "model/keras_model.h5"
LABELS_PATH = "model/labels.txt"

model = load_model(MODEL_PATH)

# Load labels
with open(LABELS_PATH, "r") as f:
    class_names = [line.strip() for line in f.readlines()]


def predict_issue(image_file):
    """
    Predict issue type and confidence from image
    """
    image_array = preprocess_image(image_file)
    predictions = model.predict(image_array)

    class_index = np.argmax(predictions)
    confidence = float(predictions[0][class_index])
    issue = class_names[class_index]

    return issue, confidence
print(model.summary())

### severity
def determine_severity(issue: str, description: str) -> str:
    desc = description.lower()

    # 🔴 Water Leakage rules
    if issue == "Water Leakage":
        if "ceiling" in desc or "roof" in desc or "terrace" in desc:
            return "High"
        if "wall" in desc or "bathroom" in desc:
            return "Medium"
        return "Medium"

    # 🔴 Wall Crack rules
    if issue == "Wall Crack":
        if "large" in desc or "deep" in desc or "structural" in desc:
            return "High"
        return "Medium"

    # 🟡 Dampness / Mold rules
    if issue == "Dampness":
        if "spread" in desc or "large area" in desc:
            return "Medium"
        return "Low"

    # 🟡 Electrical Issue rules
    if issue == "Electrical Issue":
        if "spark" in desc or "burn" in desc or "short circuit" in desc:
            return "High"
        return "Medium"

    # 🟢 Plumbing Issue rules
    if issue == "Plumbing Issue":
        if "burst" in desc or "major leak" in desc:
            return "High"
        return "Low"

    # Default fallback
    return "Medium"


#main.py
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from collections import defaultdict

from services.image_predict import predict_issue
from services.severity_rules import determine_severity
from services.llm_service import generate_root_cause_and_solution

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
    description: str = Form(...)
):
    """
    Diagnose property issue using multiple images + text description
    """

    # --- STEP 1: Collect predictions ---
    issue_confidence_map = defaultdict(list)

    for img in images:
        issue, confidence = predict_issue(img.file)
        issue_confidence_map[issue].append(confidence)

    # --- STEP 2: Confidence-weighted aggregation ---
    issue_scores = {}
    for issue, confs in issue_confidence_map.items():
        issue_scores[issue] = sum(confs) / len(confs)

    # Pick issue with highest average confidence
    final_issue = max(issue_scores, key=issue_scores.get)
    final_confidence = round(issue_scores[final_issue], 2)

    # --- STEP 3: TEXT OVERRIDE (VERY IMPORTANT) ---
    desc = description.lower()

    if "crack" in desc:
        final_issue = "Crack"
        final_confidence = max(final_confidence, 0.85)

    elif "leak" in desc or "leakage" in desc or "water" in desc:
        final_issue = "Leakage"
        final_confidence = max(final_confidence, 0.85)

    elif "electrical" in desc or "wire" in desc or "spark" in desc:
        final_issue = "Electrical"
        final_confidence = max(final_confidence, 0.85)

    # --- STEP 4: Severity logic ---
    severity = determine_severity(final_issue, description)

    # --- STEP 5: LLM reasoning ---
    root_cause, solution = generate_root_cause_and_solution(
        final_issue, description, severity
    )

    # --- STEP 6: Human review logic ---
    # Trigger review if:
    # - Low confidence
    # - Conflicting predictions
    human_review = (
        final_confidence < 0.6
        or len(issue_confidence_map) > 1
    )

    return {
        "issue": final_issue,
        "severity": severity,
        "confidence": final_confidence,
        "root_cause": root_cause,
        "solution": solution,
        "human_review": human_review
    }
#llm_service.py
import os
from dotenv import load_dotenv
from google import genai

# Load environment variables from .env
load_dotenv()

# Create Gemini client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def generate_root_cause_and_solution(issue: str, description: str, severity: str):
    """
    Uses Gemini LLM to generate root cause and solution.
    Includes robust parsing and safe fallbacks.
    """

    prompt = f"""
You are a property maintenance expert.

Issue Type: {issue}
User Description: {description}
Severity Level: {severity}

Respond clearly using headings.

Root Cause:
Solution:
Safety Note:
"""

    try:
        # 🔹 Call Gemini (working free-tier friendly model)
        response = client.models.generate_content(
            model="models/gemini-2.5-flash",
            contents=prompt
        )

        text = response.text.strip()

        # 🔹 Robust parsing (handles bullets, paragraphs, format changes)
        root_cause = ""
        solution = ""

        lines = text.split("\n")

        for i, line in enumerate(lines):
            lower = line.lower()

            if "root cause" in lower and not root_cause:
                for j in range(i + 1, len(lines)):
                    if lines[j].strip():
                        root_cause = lines[j].strip(":-• ")
                        break

            if "solution" in lower and not solution:
                for j in range(i + 1, len(lines)):
                    if lines[j].strip():
                        solution = lines[j].strip(":-• ")
                        break

        # 🔹 Final safety fallback (VERY IMPORTANT)
        if not root_cause:
            root_cause = (
                "Possible water seepage or internal plumbing leakage "
                "near the affected area."
            )

        if not solution:
            solution = (
                "Inspect plumbing connections, repair leaks, and apply "
                "proper waterproofing to prevent further damage."
            )

        return root_cause, solution

    except Exception as e:
        print("Gemini error:", e)

        # 🔹 Fallback when quota/model/API fails
        return (
            "Unable to determine root cause due to AI service unavailability.",
            "Manual inspection is recommended to identify and resolve the issue."
        )
