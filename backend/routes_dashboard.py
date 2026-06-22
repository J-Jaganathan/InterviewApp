# routes_dashboard.py
from flask import Blueprint, jsonify
from datetime import datetime
from auth import token_required
from models import db, Question, PracticeSession, Progress
try:
    from models import UserGoal  # optional, if you added it
except Exception:
    UserGoal = None

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api')

@dashboard_bp.route('/dashboard', methods=['GET'])
@token_required
def get_dashboard(user):
    total_questions = db.session.query(Question).count()

    prog = db.session.query(Progress).filter_by(user_id=user.id).first()
    if prog:
        solved = prog.solved_problems or 0
        total = prog.total_problems or total_questions
    else:
        solved = db.session.query(PracticeSession)\
            .filter_by(user_id=user.id, status='completed').count()
        total = total_questions

    progress_pct = round((solved / total * 100), 1) if total else 0

    # Dynamic avgScore: for now mirror progress% (purely DB-driven).
    # Later: replace with AVG from interview runs if you store scores.
    avg_score = progress_pct

    payload = {
        "user": user.to_dict(),
        "progress": progress_pct,
        "sessionsCompleted": solved,
        "totalSessions": total,
        "avgScore": avg_score,
        "notifications": 0
    }

    if UserGoal:
        goal = UserGoal.query.filter_by(user_id=user.id).first()
        if goal:
            days = max(0, (goal.interview_at - datetime.utcnow()).days)
            payload["upcomingInterview"] = {
                "company": goal.company,
                "position": goal.role,
                "daysUntil": days
            }

    return jsonify(payload), 200