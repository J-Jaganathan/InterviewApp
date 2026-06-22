from flask import Blueprint, jsonify, request
from db import execute_query
from utils.auth_middleware import token_required

progress_bp = Blueprint("progress", __name__)


@progress_bp.route("", methods=["GET"])
@token_required
def get_progress():
    user_id = request.user_id

    overall_data = execute_query(
        "SELECT total_problems, solved_problems FROM progress WHERE user_id = %s",
        (user_id,),
        fetch=True,
    )

    overall = 0
    if overall_data and overall_data["total_problems"]:
        overall = round(
            (overall_data["solved_problems"] / overall_data["total_problems"]) * 100, 1
        )

    category_data = execute_query(
        """
        SELECT
            q.category AS name,
            COUNT(ps.id) AS total,
            SUM(CASE WHEN ps.status = 'completed' THEN 1 ELSE 0 END) AS completed
        FROM practice_sessions ps
        JOIN questions q ON ps.question_id = q.id
        WHERE ps.user_id = %s
        GROUP BY q.category
        """,
        (user_id,),
        fetch=True,
        many=True,
    )

    categories = []
    for row in category_data:
        score = round((row["completed"] / row["total"]) * 100, 1) if row["total"] else 0
        categories.append({"name": row["name"], "score": score})

    if not categories:
        categories = [
            {"name": "DSA", "score": 0},
            {"name": "System Design", "score": 0},
            {"name": "Behavioral", "score": 0},
        ]

    return jsonify({"overall": overall, "categories": categories}), 200