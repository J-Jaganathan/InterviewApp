from flask import Blueprint, jsonify, request
from db import execute_query, get_connection
from utils.auth_middleware import token_required

sessions_bp = Blueprint("sessions", __name__)


@sessions_bp.route("", methods=["POST"])
@token_required
def create_session():
    user_id = request.user_id
    data = request.get_json() or {}
    num_questions = data.get("num_questions", 5)

    questions = execute_query(
        "SELECT id FROM questions ORDER BY RAND() LIMIT %s",
        (num_questions,),
        fetch=True,
        many=True,
    )

    if not questions:
        return jsonify({"error": "No questions available"}), 404

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        session_ids = []
        for q in questions:
            cursor.execute(
                "INSERT INTO practice_sessions (user_id, question_id, status, attempts) VALUES (%s, %s, 'pending', 0)",
                (user_id, q["id"]),
            )
            session_ids.append(cursor.lastrowid)
        conn.commit()
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({"error": "Failed to create sessions", "detail": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

    return jsonify({
        "message": "Session created",
        "session_ids": session_ids,
        "question_count": len(questions),
    }), 201


@sessions_bp.route("", methods=["GET"])
@token_required
def get_sessions():
    user_id = request.user_id

    sessions = execute_query(
        """
        SELECT ps.id, ps.question_id, ps.status, ps.attempts, ps.score,
               ps.solved_at, ps.created_at, q.title AS question_title, q.category, q.difficulty
        FROM practice_sessions ps
        LEFT JOIN questions q ON ps.question_id = q.id
        WHERE ps.user_id = %s
        ORDER BY ps.created_at DESC
        """,
        (user_id,),
        fetch=True,
        many=True,
    )

    for s in sessions:
        for field in ["solved_at", "created_at"]:
            if s.get(field):
                s[field] = s[field].isoformat()

    return jsonify({"sessions": sessions, "count": len(sessions)}), 200


@sessions_bp.route("/<int:session_id>/complete", methods=["POST"])
@token_required
def complete_session(session_id):
    user_id = request.user_id
    data = request.get_json() or {}
    score = data.get("score", 0)

    session = execute_query(
        "SELECT id, user_id, status FROM practice_sessions WHERE id = %s",
        (session_id,),
        fetch=True,
    )

    if not session:
        return jsonify({"error": "Session not found"}), 404
    if session["user_id"] != user_id:
        return jsonify({"error": "Unauthorized"}), 403
    if session["status"] == "completed":
        return jsonify({"error": "Session already completed"}), 400

    try:
        execute_query(
            """
            UPDATE practice_sessions
            SET status = 'completed', score = %s, solved_at = NOW(), attempts = attempts + 1
            WHERE id = %s
            """,
            (score, session_id),
        )

        # Update user progress
        execute_query(
            """
            INSERT INTO progress (user_id, total_problems, solved_problems, total_time_spent_s)
            VALUES (%s, 1, 1, 0)
            ON DUPLICATE KEY UPDATE
                total_problems = total_problems + 1,
                solved_problems = solved_problems + 1,
                last_updated = NOW()
            """,
            (user_id,),
        )
    except Exception as e:
        return jsonify({"error": "Failed to complete session", "detail": str(e)}), 500

    return jsonify({"message": "Session marked as completed", "session_id": session_id, "score": score}), 200