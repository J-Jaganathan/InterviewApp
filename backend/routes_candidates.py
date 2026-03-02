from flask import Blueprint, request, jsonify
from models import db, Candidate
from auth import token_required
from sqlalchemy import or_

candidates_bp = Blueprint('candidates', __name__, url_prefix='/api/candidates')

@candidates_bp.route('', methods=['GET'])
def get_all_candidates():
    """Get all candidates"""
    candidates = Candidate.query.all()
    return jsonify({
        'candidates': [candidate.to_dict() for candidate in candidates],
        'total': len(candidates)
    }), 200

@candidates_bp.route('/<int:candidate_id>', methods=['GET'])
def get_candidate(candidate_id):
    """Get candidate by ID"""
    candidate = Candidate.query.get(candidate_id)
    
    if not candidate:
        return jsonify({'message': 'Candidate not found'}), 404
    
    return jsonify({
        'candidate': candidate.to_dict()
    }), 200

@candidates_bp.route('', methods=['POST'])
@token_required
def create_candidate(user):
    """Create new candidate"""
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'message': 'Name is required'}), 400
    
    candidate = Candidate(
        name=data['name'],
        email=data.get('email'),
        phone=data.get('phone'),
        status=data.get('status', 'pending')
    )
    
    db.session.add(candidate)
    db.session.commit()
    
    return jsonify({
        'message': 'Candidate created successfully',
        'candidate': candidate.to_dict()
    }), 201

@candidates_bp.route('/<int:candidate_id>', methods=['PUT'])
@token_required
def update_candidate(user, candidate_id):
    """Update candidate"""
    candidate = Candidate.query.get(candidate_id)
    
    if not candidate:
        return jsonify({'message': 'Candidate not found'}), 404
    
    data = request.get_json()
    
    if 'name' in data:
        candidate.name = data['name']
    if 'email' in data:
        candidate.email = data['email']
    if 'phone' in data:
        candidate.phone = data['phone']
    if 'status' in data:
        candidate.status = data['status']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Candidate updated successfully',
        'candidate': candidate.to_dict()
    }), 200

@candidates_bp.route('/<int:candidate_id>', methods=['DELETE'])
@token_required
def delete_candidate(user, candidate_id):
    """Delete candidate"""
    candidate = Candidate.query.get(candidate_id)
    
    if not candidate:
        return jsonify({'message': 'Candidate not found'}), 404
    
    db.session.delete(candidate)
    db.session.commit()
    
    return jsonify({
        'message': 'Candidate deleted successfully'
    }), 200

@candidates_bp.route('/search', methods=['GET'])
def search_candidates():
    """Search candidates by name or email"""
    query = request.args.get('q', '').lower()
    
    if not query:
        return jsonify({'message': 'Search query is required'}), 400
    
    
    candidates = Candidate.query.filter(or_(Candidate.name.ilike(f'%{query}%'),
                                            Candidate.email.ilike(f'%{query}%'))).all()

    
    return jsonify({
        'candidates': [candidate.to_dict() for candidate in candidates],
        'total': len(candidates)
    }), 200
