import os
import json
from dotenv import load_dotenv
from google import genai

# Load environment variables
load_dotenv()

# Create Gemini client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

MODEL_NAME = "models/gemini-2.5-flash"


def generate_structured_diagnosis(issue: str, severity: str, description: str):
    """
    STEP-3 LLM:
    Generates structured diagnosis in easy + professional language.
    Always returns safe JSON.
    """

    prompt = f"""
You are a professional building inspection assistant.

Issue: {issue}
Severity: {severity}
User description: {description}

Generate a structured diagnosis.

Return ONLY valid JSON with EXACTLY these keys:
- technical_reasoning (string)
- repair_steps (array of strings, max 7)
- urgency_note (string)
- preventive_measures (array of strings, max 5)

Rules:
- Keep technical_reasoning within 2–3 short sentences
- repair_steps max 3 steps
- preventive_measures max 3 points
- Use simple, non-technical language
- Avoid long explanations

"""

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )

        text = response.text.strip()

        # Try strict JSON parse
        data = json.loads(text)

        # ✅ Validate structure (VERY IMPORTANT)
        return {
            "technical_reasoning": data.get(
                "technical_reasoning",
                "Based on the visible condition, further inspection is required."
            ),
            "repair_steps": data.get(
                "repair_steps",
                ["Consult a qualified professional for inspection."]
            ),
            "urgency_note": data.get(
                "urgency_note",
                severity
            ),
            "preventive_measures": data.get(
                "preventive_measures",
                ["Schedule regular maintenance inspections."]
            )
        }

    except Exception as e:
        print("Gemini error:", e)

        # 🔒 SAFE FALLBACK (never breaks UI)
        return {
            "technical_reasoning":
                "Based on the visible condition, the issue may be caused by "
                "structural or environmental factors that require inspection.",

            "repair_steps": [
                "Inspect the affected area carefully.",
                "Consult a qualified technician for proper assessment."
            ],

            "urgency_note": severity,

            "preventive_measures": [
                "Conduct periodic visual inspections.",
                "Address minor issues early to prevent escalation."
            ]
        }
