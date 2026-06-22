from flask import Blueprint, jsonify, request
from db import execute_query
from utils.auth_middleware import token_required

questions_bp = Blueprint("questions", __name__)


@questions_bp.route("", methods=["GET"])
@token_required
def get_questions():
    limit = request.args.get("limit", 30, type=int)
    limit = max(1, min(limit, 100))

    questions = execute_query(
        """
        SELECT id, title, description, category, difficulty, hints, created_at
        FROM questions
        ORDER BY RAND()
        LIMIT %s
        """,
        (limit,),
        fetch=True,
        many=True,
    )

    for q in questions:
        if q.get("created_at"):
            q["created_at"] = q["created_at"].isoformat()

    return jsonify({"questions": questions, "count": len(questions)}), 200