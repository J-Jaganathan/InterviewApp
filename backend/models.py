# models.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import bcrypt
import secrets

db = SQLAlchemy()

# -----------------------------
# Users
# -----------------------------
class User(db.Model):
    """User model for authentication"""
    __tablename__ = 'users'

    id = db.Column(db.BigInteger, primary_key=True)  # BIGINT to match ERD
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(320), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def set_password(self, password: str):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password: str) -> bool:
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# -----------------------------
# Candidates
# -----------------------------
class Candidate(db.Model):
    """Candidate model"""
    __tablename__ = 'candidates'

    id = db.Column(db.BigInteger, primary_key=True)  # BIGINT consistently
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255))
    phone = db.Column(db.String(50))
    status = db.Column(db.String(50), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# -----------------------------
# Questions
# -----------------------------
class Question(db.Model):
    """Interview question model"""
    __tablename__ = 'questions'

    id = db.Column(db.BigInteger, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100))
    difficulty = db.Column(
        db.Enum('easy', 'medium', 'hard', name='difficulty_enum'),
        default='medium'
    )
    solution = db.Column(db.Text)  # MEDIUMTEXT ~ Text works in SQLAlchemy
    hints = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'difficulty': self.difficulty,
            'solution': self.solution,
            'hints': self.hints,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# -----------------------------
# Interviews
# -----------------------------
class Interview(db.Model):
    """Interview result model"""
    __tablename__ = 'interviews'

    id = db.Column(db.BigInteger, primary_key=True)
    candidate_id = db.Column(db.BigInteger, db.ForeignKey('candidates.id'), nullable=False, index=True)
    question_id = db.Column(db.BigInteger, db.ForeignKey('questions.id'), nullable=False, index=True)
    score = db.Column(db.Integer)
    feedback = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'candidate_id': self.candidate_id,
            'question_id': self.question_id,
            'score': self.score,
            'feedback': self.feedback,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# -----------------------------
# Practice Sessions
# -----------------------------
class PracticeSession(db.Model):
    __tablename__ = 'practice_sessions'

    id = db.Column(db.BigInteger, primary_key=True)

    user_id = db.Column(
        db.BigInteger,
        db.ForeignKey('users.id'),
        nullable=False,
        index=True
    )

    question_id = db.Column(
        db.BigInteger,
        db.ForeignKey('questions.id'),
        nullable=False,
        index=True
    )

    status = db.Column(
        db.Enum(
            'pending',
            'in_progress',
            'completed',
            'skipped',
            name='session_status_enum'
        ),
        nullable=False,
        default='pending'
    )

    attempts = db.Column(db.Integer, nullable=False, default=0)

    score = db.Column(db.Float)

    solved_at = db.Column(db.DateTime)

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'question_id': self.question_id,
            'status': self.status,
            'attempts': self.attempts,
            'score': self.score,
            'solved_at': self.solved_at.isoformat() if self.solved_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

# -----------------------------
# Resources  (resource_type is VARCHAR per ERD)
# -----------------------------
class Resource(db.Model):
    __tablename__ = 'resources'

    id = db.Column(db.BigInteger, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    url = db.Column(db.String(2048))
    category = db.Column(db.String(100))
    resource_type = db.Column(db.String(50))  # VARCHAR, not Enum, to match ERD
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'desc': self.description,
            'link': self.url,
            'category': self.category,
            'resource_type': self.resource_type,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# -----------------------------
# Progress
# -----------------------------
class Progress(db.Model):
    __tablename__ = 'progress'

    id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False, index=True)
    total_problems = db.Column(db.Integer, default=0)
    solved_problems = db.Column(db.Integer, default=0)
    total_time_spent_s = db.Column(db.Integer, default=0)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'total_problems': self.total_problems,
            'solved_problems': self.solved_problems,
            'total_time_spent_s': self.total_time_spent_s,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None
        }


# -----------------------------
# Password Reset Tokens (for /auth/forgot + /auth/reset)
# -----------------------------
class PasswordResetToken(db.Model):
    __tablename__ = 'password_reset_tokens'

    id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False, index=True)
    token = db.Column(db.String(255), unique=True, nullable=False, index=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    used_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    @staticmethod
    def generate_for(user_id: int, ttl_minutes: int = 15) -> "PasswordResetToken":
        """Create and return a new reset token for the given user."""
        token = secrets.token_urlsafe(32)  # ~256 bits of entropy
        prt = PasswordResetToken(
            user_id=user_id,
            token=token,
            expires_at=datetime.utcnow() + timedelta(minutes=ttl_minutes)
        )
        db.session.add(prt)
        return prt

    def is_valid(self) -> bool:
        """Token is valid if not used and not expired."""
        if self.used_at is not None:
            return False
        return datetime.utcnow() <= self.expires_at

    def mark_used(self):
        self.used_at = datetime.utcnow()