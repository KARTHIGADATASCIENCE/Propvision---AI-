COST_MAP = {
    "Crack": {
        "Low": "BHD 20 – 50",
        "Medium": "BHD 80 – 200",
        "Immediate": "BHD 300 – 800"
    },
    "Leakage": {
        "Low": "BHD 15 – 40",
        "Medium": "BHD 70 – 180",
        "Immediate": "BHD 250 – 600"
    },
    "Mould": {
        "Low": "BHD 30 – 80",
        "Medium": "BHD 120 – 300",
        "Immediate": "BHD 400 – 900"
    },
    "Algai": {
        "Low": "BHD 20 – 60",
        "Medium": "BHD 100 – 250",
        "Immediate": "BHD 350 – 700"
    },
    "Tiles": {
        "Low": "BHD 25 – 70",
        "Medium": "BHD 150 – 350",
        "Immediate": "BHD 500 – 1200"
    },
    "Electrical": {
        "Low": "BHD 20 – 50",
        "Medium": "BHD 100 – 300",
        "Immediate": "BHD 400 – 1000"
    }
}


def estimate_cost(issue: str, severity: str) -> str:
    return COST_MAP.get(issue, {}).get(severity, "Inspection required")
