from flask import Blueprint, request, jsonify
from models import db, Question, PracticeSession
from auth import token_required
from sqlalchemy.sql.expression import func
from datetime import datetime

questions_bp = Blueprint('questions', __name__, url_prefix='/api/questions')

# ============================================
# USER PRACTICE SESSION ROUTES (MUST BE FIRST)
# ============================================

@questions_bp.route('/user/completed', methods=['GET'])
@token_required
def get_completed_questions(user):
    """Get all questions completed by the current user"""
    sessions = PracticeSession.query.filter_by(
        user_id=user.id,
        status='completed'
    ).all()
    
    completed_questions = [session.question_id for session in sessions]
    
    return jsonify({
        'completed_questions': completed_questions,
        'total': len(completed_questions)
    }), 200


@questions_bp.route('/user/progress', methods=['GET'])
@token_required
def get_user_progress(user):
    """Get user's overall progress"""
    sessions = PracticeSession.query.filter_by(user_id=user.id).all()
    
    total_questions = Question.query.count()
    completed_count = len([s for s in sessions if s.status == 'completed'])
    
    progress_percentage = (completed_count / total_questions * 100) if total_questions > 0 else 0
    
    return jsonify({
        'total_questions': total_questions,
        'completed_count': completed_count,
        'progress_percentage': round(progress_percentage, 2),
        'sessions': [session.to_dict() for session in sessions]
    }), 200


# ============================================
# GENERIC QUESTION ROUTES
# ============================================

@questions_bp.route('', methods=['GET'])
def get_all_questions():
    """Get all questions with filtering by q (search), difficulty, and category"""
    q = request.args.get('q', '').strip()
    difficulty = request.args.get('difficulty')
    category = request.args.get('category')
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    
    query = Question.query
    
    # Full-text search on title and description
    if q:
        search_term = f"%{q}%"
        query = query.filter(
            (Question.title.ilike(search_term)) | 
            (Question.description.ilike(search_term))
        )
    
    if difficulty:
        query = query.filter_by(difficulty=difficulty)
    if category:
        query = query.filter_by(category=category)
    
    # Get total count before pagination
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    questions = query.offset(offset).limit(limit).all()
    
    return jsonify({
        'items': [question.to_dict() for question in questions],
        'total': total
    }), 200

@questions_bp.route('/<int:question_id>', methods=['GET'])
def get_question(question_id):
    """Get question by ID"""
    question = Question.query.get(question_id)
    
    if not question:
        return jsonify({'message': 'Question not found'}), 404
    
    return jsonify({
        'question': question.to_dict()
    }), 200

@questions_bp.route('', methods=['POST'])
@token_required
def create_question(user):
    """Create new question"""
    data = request.get_json()
    
    if not data or not data.get('title'):
        return jsonify({'message': 'Title is required'}), 400
    
    question = Question(
        title=data['title'],
        description=data.get('description'),
        difficulty=data.get('difficulty', 'medium'),
        category=data.get('category')
    )
    
    db.session.add(question)
    db.session.commit()
    
    return jsonify({
        'message': 'Question created successfully',
        'question': question.to_dict()
    }), 201

@questions_bp.route('/<int:question_id>', methods=['PUT'])
@token_required
def update_question(user, question_id):
    """Update question"""
    question = Question.query.get(question_id)
    
    if not question:
        return jsonify({'message': 'Question not found'}), 404
    
    data = request.get_json()
    
    if 'title' in data:
        question.title = data['title']
    if 'description' in data:
        question.description = data['description']
    if 'difficulty' in data:
        question.difficulty = data['difficulty']
    if 'category' in data:
        question.category = data['category']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Question updated successfully',
        'question': question.to_dict()
    }), 200

@questions_bp.route('/<int:question_id>', methods=['DELETE'])
@token_required
def delete_question(user, question_id):
    """Delete question"""
    question = Question.query.get(question_id)
    
    if not question:
        return jsonify({'message': 'Question not found'}), 404
    
    db.session.delete(question)
    db.session.commit()
    
    return jsonify({
        'message': 'Question deleted successfully'
    }), 200



@questions_bp.route('/random', methods=['GET'])
def get_random_questions():
    count = request.args.get('count', default=10, type=int)
    items = Question.query.order_by(func.rand()).limit(count).all()
    return jsonify({"questions": [q.to_dict() for q in items]}), 200


# ============================================
# Practice Session Endpoints
# ============================================

@questions_bp.route('/<int:question_id>/mark-complete', methods=['POST'])
@token_required
def mark_question_complete(user, question_id):
    """Mark a question as completed by the current user"""
    question = Question.query.get(question_id)
    
    if not question:
        return jsonify({'message': 'Question not found'}), 404
    
    # Check if practice session already exists
    session = PracticeSession.query.filter_by(
        user_id=user.id,
        question_id=question_id
    ).first()
    
    if not session:
        # Create new practice session
        session = PracticeSession(
            user_id=user.id,
            question_id=question_id,
            status='completed',
            solved_at=datetime.utcnow(),
            attempts=1
        )
        db.session.add(session)
    else:
        # Update existing session
        session.status = 'completed'
        session.solved_at = datetime.utcnow()
        session.attempts = (session.attempts or 0) + 1
    
    db.session.commit()
    
    return jsonify({
        'message': 'Question marked as complete',
        'session': session.to_dict()
    }), 200


@questions_bp.route('/<int:question_id>/unmark-complete', methods=['POST'])
@token_required
def unmark_question_complete(user, question_id):
    """Unmark a question as completed by the current user"""
    session = PracticeSession.query.filter_by(
        user_id=user.id,
        question_id=question_id
    ).first()
    
    if not session:
        return jsonify({'message': 'Practice session not found'}), 404
    
    # Remove the session record
    db.session.delete(session)
    db.session.commit()
    
    return jsonify({
        'message': 'Question unmarked as complete'
    }), 200