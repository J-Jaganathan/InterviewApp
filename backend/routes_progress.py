# routes_progress.py
from flask import Blueprint, jsonify
from auth import token_required
from models import db, Question, PracticeSession, Progress
from sqlalchemy import func

progress_bp = Blueprint('progress', __name__, url_prefix='/api/progress')

@progress_bp.route('', methods=['GET'])
@token_required
def get_progress(user):
    total_questions = db.session.query(Question).count()
    prog = db.session.query(Progress).filter_by(user_id=user.id).first()

    solved = prog.solved_problems if prog else db.session.query(PracticeSession)\
                .filter_by(user_id=user.id, status='solved').count()
    total = prog.total_problems if (prog and prog.total_problems) else total_questions
    overall = round((solved / total * 100), 1) if total else 0

    q = db.session.query(Question.category, func.count(PracticeSession.id))\
        .join(PracticeSession, PracticeSession.question_id == Question.id)\
        .filter(PracticeSession.user_id == user.id, PracticeSession.status == 'solved')\
        .group_by(Question.category)
    category_breakdown_counts = []
    for c, n in q.all():
        pct = round((n / solved * 100), 1) if solved > 0 else 0
        category_breakdown_counts.append({
            "category": c or "Uncategorized",
            "solved": int(n),
            "percentage": pct
        })

    return jsonify({
        "overall": overall,
        "sessionsCompleted": solved,
        "totalSessions": total,
        "avgScore": overall,  # equals overall until you store real scores
        "currentStreak": 0,
        "categoryBreakdown": category_breakdown_counts
    }), 200