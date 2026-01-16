SUPPORTED_LANGUAGES = ["en", "ar", "hi", "ml", "ta", "ur", "tl"]

def translate_text(text: str, target_lang: str) -> str:
    """
    Placeholder for translation logic.
    For now, return text as-is.
    Multilingual friend will implement this.
    """
    return text


def translate_response(response: dict, language: str) -> dict:
    if language not in SUPPORTED_LANGUAGES or language == "en":
        response["language"] = "en"
        return response

    response["technical_reasoning"] = translate_text(
        response["technical_reasoning"], language
    )

    response["urgency_note"] = translate_text(
        response.get("urgency_note", ""), language
    )

    response["repair_steps"] = [
        translate_text(step, language)
        for step in response.get("repair_steps", [])
    ]

    response["preventive_measures"] = [
        translate_text(item, language)
        for item in response.get("preventive_measures", [])
    ]

    response["language"] = language
    return response
