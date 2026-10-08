# NetSage AI — Applied AI + Network Troubleshooting

An AI-assisted troubleshooting helper for Cisco-style Packet Tracer/lab network problems. It combines a case dataset, deterministic Python checks, an explainable diagnosis engine, human review, and a dashboard.

## Run
```bash
python -m venv venv
# Windows: venv\\Scripts\\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python app.py
```
Open http://127.0.0.1:5000

## Optional real AI
Set `GEMINI_API_KEY` in your environment. The app can call Gemini through the modern `google-genai` package. Without a key, the local evidence/rule engine produces a clearly labelled fallback diagnosis so the demo remains functional.

## Project deliverables
- `data/cases.csv`: 30 cases across VLAN, gateway, DHCP, DNS, routing, ACL, NAT and wireless.
- `prompts/diagnose_prompt.md`: structured JSON diagnosis prompt.
- `app/rule_checker.py`: deterministic configuration checks.
- Dashboard: issue types, severity and AI-vs-human agreement.
- Responsible AI log: corrected/edited cases.
- Demo workflow: diagnose → review → fix/verify.
