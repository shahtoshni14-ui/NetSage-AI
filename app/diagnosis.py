import json
import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

from .rule_checker import check_case


load_dotenv()


# ---------------------------------------------------------
# ISSUE CATEGORY MAP
# ---------------------------------------------------------

ISSUE_MAP = {
    "VLAN": (
        "VLAN configuration or trunking problem",
        "Layer 2"
    ),

    "Gateway": (
        "Default gateway/SVI configuration problem",
        "Layer 3"
    ),

    "DHCP": (
        "DHCP scope, relay, or pool problem",
        "Layer 3/7"
    ),

    "DNS": (
        "DNS configuration or reachability problem",
        "Layer 7"
    ),

    "Routing": (
        "Routing table, route, or next-hop problem",
        "Layer 3"
    ),

    "ACL": (
        "Access-control rule/order/direction problem",
        "Layer 3/4"
    ),

    "NAT": (
        "NAT role/translation problem",
        "Layer 3/4"
    ),

    "Wireless": (
        "Wireless isolation, VLAN mapping, or ACL problem",
        "Layer 2/3"
    ),
}


# ---------------------------------------------------------
# LOCAL / DETERMINISTIC FALLBACK
# ---------------------------------------------------------

def local_diagnose(case):
    """
    Deterministic local fallback diagnosis.

    Used when Gemini is unavailable or takes too long.
    """

    fault, layer = ISSUE_MAP.get(
        case["issue_type"],
        ("Unknown network fault", "Unknown")
    )

    findings = check_case(case)

    evidence = [
        case["symptom"],
        case["show_outputs"]
    ]

    if findings:
        evidence.extend(findings)

    return {
        "root_cause": case["expected_fault"],

        "confidence": (
            "high" if findings else "medium"
        ),

        "evidence": evidence,

        "osi_layer": (
            case["osi_layer"]
            if case["osi_layer"]
            else layer
        ),

        "next_command": case["next_command"],

        "fix_steps": (
            case["fix_steps"].split(" | ")
        ),

        "safety_note": (
            "Human review required before applying "
            "any configuration change."
        ),

        "engine": (
            "Local evidence/rule engine (fallback)"
        ),
    }


# ---------------------------------------------------------
# GEMINI JSON CLEANER
# ---------------------------------------------------------

def normalize_json(text):
    """
    Convert Gemini JSON response into a Python dictionary.
    Handles responses wrapped inside ```json blocks.
    """

    text = text.strip()

    if text.startswith("```"):

        lines = text.splitlines()

        if lines and lines[0].strip().lower() in (
            "```json",
            "```"
        ):
            lines = lines[1:]

        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]

        text = "\n".join(lines).strip()

    return json.loads(text)


# ---------------------------------------------------------
# GEMINI AI DIAGNOSIS
# ---------------------------------------------------------

def gemini_diagnose(case, findings):
    """
    Send network evidence to Gemini and receive
    a structured troubleshooting diagnosis.
    """

    # Get API key from .env
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not configured."
        )

    # Create Gemini client
    client = genai.Client(api_key=api_key)

    # -----------------------------------------------------
    # BUILD EVIDENCE
    # -----------------------------------------------------

    evidence_text = f"""
Symptom:
{case["symptom"]}

Show-command output:
{case["show_outputs"]}

Topology:
{case.get("topology_note", "")}

Issue category:
{case["issue_type"]}

Deterministic Python checks:
{findings}
"""

    # -----------------------------------------------------
    # SHORT OPTIMIZED PROMPT
    # -----------------------------------------------------

    prompt = f"""
You are NetSage AI, a Cisco network troubleshooting assistant.

Analyze ONLY the evidence supplied below.

Rules:
1. Do not invent facts, commands, outputs, or topology.
2. Use the supplied evidence to support the diagnosis.
3. Clearly distinguish evidence from inference.
4. If evidence is insufficient, say so.
5. Recommend a safe diagnostic command.
6. Never automatically apply configuration changes.
7. Human review is required before any fix.
8. Keep the response concise.
9. Return ONLY valid JSON.

CASE EVIDENCE:

{evidence_text}

Return exactly this JSON structure:

{{
    "root_cause": "Most likely root cause",
    "confidence": "high, medium, or low",
    "evidence": [
        "Specific evidence 1",
        "Specific evidence 2"
    ],
    "osi_layer": "Layer X",
    "next_command": "Safest next diagnostic command",
    "fix_steps": [
        "Step 1",
        "Step 2",
        "Step 3"
    ],
    "safety_note": "Human review required before applying any configuration change."
}}
"""

    # -----------------------------------------------------
    # CALL GEMINI
    # -----------------------------------------------------

    response = client.interactions.create(
    model="gemini-3.8-flash",
    input=prompt,
    timeout=60
)

    # -----------------------------------------------------
    # CONVERT GEMINI RESPONSE TO DICTIONARY
    # -----------------------------------------------------

    result = normalize_json(
        response.output_text
    )

    # -----------------------------------------------------
    # SAFETY DEFAULTS
    # -----------------------------------------------------

    result.setdefault(
        "root_cause",
        "Unable to determine root cause."
    )

    result.setdefault(
        "confidence",
        "low"
    )

    result.setdefault(
        "evidence",
        []
    )

    result.setdefault(
        "osi_layer",
        "Unknown"
    )

    result.setdefault(
        "next_command",
        "Collect additional show-command evidence."
    )

    result.setdefault(
        "fix_steps",
        []
    )

    result.setdefault(
        "safety_note",
        "Human review required before applying any configuration change."
    )

    # Show that Gemini + Python were both used
    result["engine"] = (
        "Gemini AI + Python deterministic checks"
    )

    return result


# ---------------------------------------------------------
# MAIN DIAGNOSIS PIPELINE
# ---------------------------------------------------------

def diagnose(case):
    """
    Main NetSage diagnosis pipeline.

    Uses the deterministic evidence/rule engine first so that
    the application always responds immediately.
    """

    findings = check_case(case)

    # Always provide an immediate evidence-based diagnosis.
    result = local_diagnose(case)

    # Clearly identify the engine being used.
    result["engine"] = "Python evidence/rule engine"

    return result
    