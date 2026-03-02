# routes_study_plan.py
from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
from auth import token_required
from models import db, Question, PracticeSession, Progress

study_bp = Blueprint('study_plan', __name__, url_prefix='/api/study-plan')

@study_bp.route('/generate', methods=['POST'])
@token_required
def generate_plan(user):
    payload = request.get_json() or {}
    period = int(payload.get('days', 7))

    prog = Progress.query.filter_by(user_id=user.id).first()
    total = prog.total_problems if prog and prog.total_problems else db.session.query(Question).count()
    solved = prog.solved_problems if prog else 0
    remaining = max(0, total - solved)
    per_day = max(5, min(40, remaining // max(1, period)))

    tracks = ["DSA", "System Design", "Aptitude", "Behavioral"]
    out = []
    for i in range(period):
        day = i + 1
        tasks = [
            f"Practice {per_day} problems",
            f"{tracks[i % len(tracks)]} review (30m)",
            "Mock notes / retro (15m)"
        ]
        out.append({"day": day, "date": (datetime.utcnow()+timedelta(days=i)).date().isoformat(), "tasks": tasks})

    return jsonify({"plan": out}), 200