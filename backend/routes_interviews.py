from flask import Blueprint, request, jsonify
from models import db, Interview, Candidate, Question
from auth import token_required

interviews_bp = Blueprint('interviews', __name__, url_prefix='/api/interviews')

@interviews_bp.route('', methods=['GET'])
def get_all_interviews():
    """Get all interviews"""
    candidate_id = request.args.get('candidate_id', type=int)
    
    query = Interview.query
    
    if candidate_id:
        query = query.filter_by(candidate_id=candidate_id)
    
    interviews = query.all()
    
    return jsonify({
        'interviews': [interview.to_dict() for interview in interviews],
        'total': len(interviews)
    }), 200

@interviews_bp.route('/<int:interview_id>', methods=['GET'])
def get_interview(interview_id):
    """Get interview by ID"""
    interview = Interview.query.get(interview_id)
    
    if not interview:
        return jsonify({'message': 'Interview not found'}), 404
    
    interview_data = interview.to_dict()
    
    # Get related data
    candidate = Candidate.query.get(interview.candidate_id)
    question = Question.query.get(interview.question_id)
    
    if candidate:
        interview_data['candidate'] = candidate.to_dict()
    if question:
        interview_data['question'] = question.to_dict()
    
    return jsonify({
        'interview': interview_data
    }), 200

@interviews_bp.route('', methods=['POST'])
@token_required
def create_interview(user):
    """Create new interview"""
    data = request.get_json()
    
    if not data or not data.get('candidate_id') or not data.get('question_id'):
        return jsonify({'message': 'candidate_id and question_id are required'}), 400
    
    # Verify candidate and question exist
    candidate = Candidate.query.get(data['candidate_id'])
    question = Question.query.get(data['question_id'])
    
    if not candidate or not question:
        return jsonify({'message': 'Candidate or question not found'}), 404
    
    interview = Interview(
        candidate_id=data['candidate_id'],
        question_id=data['question_id'],
        score=data.get('score'),
        feedback=data.get('feedback')
    )
    
    db.session.add(interview)
    db.session.commit()
    
    return jsonify({
        'message': 'Interview created successfully',
        'interview': interview.to_dict()
    }), 201

@interviews_bp.route('/<int:interview_id>', methods=['PUT'])
@token_required
def update_interview(user, interview_id):
    """Update interview"""
    interview = Interview.query.get(interview_id)
    
    if not interview:
        return jsonify({'message': 'Interview not found'}), 404
    
    data = request.get_json()
    
    if 'score' in data:
        interview.score = data['score']
    if 'feedback' in data:
        interview.feedback = data['feedback']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Interview updated successfully',
        'interview': interview.to_dict()
    }), 200

@interviews_bp.route('/<int:interview_id>', methods=['DELETE'])
@token_required
def delete_interview(user, interview_id):
    """Delete interview"""
    interview = Interview.query.get(interview_id)
    
    if not interview:
        return jsonify({'message': 'Interview not found'}), 404
    
    db.session.delete(interview)
    db.session.commit()
    
    return jsonify({
        'message': 'Interview deleted successfully'
    }), 200

@interviews_bp.route('/candidate/<int:candidate_id>', methods=['GET'])
def get_candidate_interviews(candidate_id):
    """Get all interviews for a candidate"""
    interviews = Interview.query.filter_by(candidate_id=candidate_id).all()
    
    if not interviews:
        return jsonify({
            'interviews': [],
            'total': 0
        }), 200
    
    interviews_data = []
    for interview in interviews:
        interview_dict = interview.to_dict()
        candidate = Candidate.query.get(interview.candidate_id)
        question = Question.query.get(interview.question_id)
        if candidate:
            interview_dict['candidate'] = candidate.to_dict()
        if question:
            interview_dict['question'] = question.to_dict()
        interviews_data.append(interview_dict)
    
    return jsonify({
        'interviews': interviews_data,
        'total': len(interviews_data)
    }), 200
