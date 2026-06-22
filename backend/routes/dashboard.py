from flask import Blueprint, jsonify, request
from db import execute_query
from utils.auth_middleware import token_required

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("", methods=["GET"])
@token_required
def get_dashboard():
    user_id = request.user_id

    sessions_data = execute_query(
        """
        SELECT
            COUNT(*) AS totalSessions,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS sessionsCompleted,
            COALESCE(AVG(CASE WHEN status = 'completed' THEN score END), 0) AS averageScore
        FROM practice_sessions
        WHERE user_id = %s
        """,
        (user_id,),
        fetch=True,
    )

    progress_data = execute_query(
        "SELECT total_problems, solved_problems FROM progress WHERE user_id = %s",
        (user_id,),
        fetch=True,
    )

    overall = 0
    if progress_data and progress_data["total_problems"]:
        overall = round(
            (progress_data["solved_problems"] / progress_data["total_problems"]) * 100, 1
        )

    return jsonify({
        "totalSessions": int(sessions_data["totalSessions"] or 0),
        "sessionsCompleted": int(sessions_data["sessionsCompleted"] or 0),
        "averageScore": round(float(sessions_data["averageScore"] or 0), 1),
        "progress": {"overall": overall},
    }), 200