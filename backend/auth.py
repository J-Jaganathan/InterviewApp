from datetime import datetime, timedelta
import jwt
from functools import wraps
from flask import request, jsonify, current_app
from models import User

def generate_token(user_id, expires_in=86400):
    """Generate JWT token"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(seconds=expires_in),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')

def verify_token(token):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    """Decorator to protect routes that require authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check for token in headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        payload = verify_token(token)
        if not payload:
            return jsonify({'message': 'Invalid or expired token'}), 401
        
        # Get user from database
        user = User.query.get(payload['user_id'])
        if not user:
            return jsonify({'message': 'User not found'}), 401
        
        return f(user, *args, **kwargs)
    
    return decorated

def role_required(role):
    """Decorator to check user role"""
    def decorator(f):
        @wraps(f)
        def decorated_function(user, *args, **kwargs):
            if user.role != role:
                return jsonify({'message': 'Insufficient permissions'}), 403
            return f(user, *args, **kwargs)
        return decorated_function
    return decorator
