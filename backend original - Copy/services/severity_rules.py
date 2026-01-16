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
