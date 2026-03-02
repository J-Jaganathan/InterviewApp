from flask import Blueprint, request, jsonify
from models import db, Question
from auth import token_required
from sqlalchemy.sql.expression import func

questions_bp = Blueprint('questions', __name__, url_prefix='/api/questions')

@questions_bp.route('', methods=['GET'])
def get_all_questions():
    """Get all questions"""
    difficulty = request.args.get('difficulty')
    category = request.args.get('category')
    
    query = Question.query
    
    if difficulty:
        query = query.filter_by(difficulty=difficulty)
    if category:
        query = query.filter_by(category=category)
    
    questions = query.all()
    
    return jsonify({
        'questions': [question.to_dict() for question in questions],
        'total': len(questions)
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