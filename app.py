import os
from flask import Flask, render_template, request, jsonify
import pandas as pd
from dotenv import load_dotenv

from app.diagnosis import diagnose


load_dotenv()

BASE = os.path.dirname(__file__)
DATA = os.path.join(BASE, "data", "cases.csv")

df = pd.read_csv(DATA).fillna("")

reviews = {}

app = Flask(__name__)


def get_case(case_id):
    row = df[df.case_id == case_id]

    if row.empty:
        return None

    return row.iloc[0].to_dict()


@app.route("/")
def index():
    return render_template(
        "index.html",
        cases=df.to_dict("records"),
        reviews=reviews
    )


@app.route("/api/diagnose", methods=["POST"])
def diagnose_case():

    data = request.get_json(force=True)

    case = get_case(data.get("case_id"))

    if not case:
        return jsonify({"error": "Case not found"}), 404

    # Run the new Gemini + deterministic diagnosis pipeline
    result = diagnose(case)

    return jsonify(result)


@app.route("/api/review", methods=["POST"])
def review():

    data = request.get_json(force=True)

    cid = data.get("case_id")

    reviews[cid] = {
        "status": data.get("status"),
        "reviewer_note": data.get("reviewer_note", ""),
        "accepted_fault": data.get("accepted_fault", "")
    }

    return jsonify({
        "ok": True,
        "review": reviews[cid]
    })


@app.route("/api/stats")
def stats():

    issue_counts = df.issue_type.value_counts().to_dict()

    severity = df.severity.value_counts().to_dict()

    accepted = sum(
        1 for r in reviews.values()
        if r["status"] == "Accepted"
    )

    edited = sum(
        1 for r in reviews.values()
        if r["status"] == "Edited"
    )

    rejected = sum(
        1 for r in reviews.values()
        if r["status"] == "Rejected"
    )

    total = accepted + edited + rejected

    agreement = (
        round(accepted / total * 100, 1)
        if total
        else 0
    )

    return jsonify({
        "issue_counts": issue_counts,
        "severity": severity,
        "reviews": {
            "Accepted": accepted,
            "Edited": edited,
            "Rejected": rejected
        },
        "agreement": agreement,
        "cases": len(df)
    })


if __name__ == "__main__":
    app.run(debug=True)
