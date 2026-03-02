from flask import Blueprint, request, jsonify, current_app
from models import db, User, PasswordResetToken
from auth import generate_token, token_required
import re
from datetime import datetime
import os

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    return len(password) >= 6

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register new user"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    if not data.get('name'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Validate email
    if not validate_email(data['email']):
        return jsonify({'message': 'Invalid email format'}), 400
    
    # Validate password
    if not validate_password(data['password']):
        return jsonify({'message': 'Password must be at least 6 characters'}), 400
    
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 409
    
    # Create new user
    try:
        user = User(
            name=data['name'],
            email=data['email']
        )
        user.set_password(data['password'])
        db.session.add(user)
        db.session.commit()
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Registration failed: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'message': 'Invalid email or password'}), 401
    
    token = generate_token(user.id)
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(user):
    """Get current user info"""
    return jsonify({
        'user': user.to_dict()
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout(user):
    """Logout user (token-based, no action needed on backend)"""
    return jsonify({
        'message': 'Logged out successfully'
    }), 200


FRONTEND_BASE_URL = os.getenv('FRONTEND_BASE_URL', 'http://localhost:3000')

# Reuse your email validator if present; otherwise, simple one:
EMAIL_RE = re.compile(r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
def is_valid_email(email: str) -> bool:
    return bool(EMAIL_RE.match(email or ''))

@auth_bp.route('/forgot', methods=['POST'])
def forgot_password():
    """
    Request a password reset. Body: { "email": "user@example.com" }
    Always return 200 to avoid user enumeration.
    In dev, prints reset link to console. In prod, send an email instead.
    """
    data = request.get_json() or {}
    email = (data.get('email') or '').strip()

    # Uniform response to prevent user enumeration
    generic_ok = jsonify({'message': 'If an account exists for this email, a reset link has been sent.'}), 200

    if not is_valid_email(email):
        return generic_ok

    user = User.query.filter_by(email=email).first()
    if not user:
        # Do not reveal that the email does not exist
        return generic_ok

    try:
        # Optionally: invalidate older unused tokens for this user (defense-in-depth)
        PasswordResetToken.query.filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > datetime.utcnow()
        ).delete(synchronize_session=False)

        # Create a fresh token (15-minute TTL by default)
        prt = PasswordResetToken.generate_for(user_id=user.id, ttl_minutes=15)
        db.session.commit()

        # Build a reset URL for your Next.js page: /auth/reset?token=...
        reset_url = f"{FRONTEND_BASE_URL}/auth/reset?token={prt.token}"

        # DEV behavior: print to server console
        current_app.logger.info("Password reset link for %s: %s", email, reset_url)
        print(f"[DEV] Password reset link for {email}: {reset_url}")

        # TODO (prod): send reset_url via email provider (SMTP, SendGrid, SES, etc.)
        return generic_ok
    except Exception as e:
        db.session.rollback()
        # We still return generic OK (no leakage), but you can log internally
        current_app.logger.exception("Forgot password error: %s", str(e))
        return generic_ok


@auth_bp.route('/reset', methods=['POST'])
def reset_password():
    """
    Reset password with token. Body: { "token": "...", "new_password": "..." }
    """
    data = request.get_json() or {}
    token = (data.get('token') or '').strip()
    new_password = (data.get('new_password') or '').strip()

    if not token or not new_password or len(new_password) < 6:
        return jsonify({'message': 'Invalid request'}), 400

    prt = PasswordResetToken.query.filter_by(token=token).first()
    if not prt or not prt.is_valid():
        # Invalid/expired/used token
        return jsonify({'message': 'Invalid or expired token'}), 400

    # Fetch the user and update the password
    user = User.query.get(prt.user_id)
    if not user:
        # Extremely unlikely unless a dangling token exists
        return jsonify({'message': 'Invalid token'}), 400

    try:
        user.set_password(new_password)
        prt.mark_used()
        db.session.commit()
        return jsonify({'message': 'Password has been reset successfully'}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.exception("Reset password error: %s", str(e))
        return jsonify({'message': 'Password reset failed'}), 500