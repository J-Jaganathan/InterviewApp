from flask import Flask, jsonify
from flask_cors import CORS
from config import config_by_name
from models import db, User
from routes_auth import auth_bp
from routes_dashboard import dashboard_bp
from routes_candidates import candidates_bp
from routes_questions import questions_bp
from routes_interviews import interviews_bp
from routes_resources import resources_bp
from routes_progress import progress_bp
from routes_study_plan import study_bp
import os

def create_app(config_name):
    """Application factory"""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config_by_name.get(config_name))
    
    # Initialize extensions
    db.init_app(app)
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "http://127.0.0.1:3000", "https://interview-app-mu-nine.vercel.app"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(candidates_bp)
    app.register_blueprint(questions_bp)
    app.register_blueprint(interviews_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(resources_bp)
    app.register_blueprint(progress_bp)
    app.register_blueprint(study_bp)

    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'message': 'Endpoint not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'message': 'Internal server error'}), 500
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'Interview App Backend is running'
        }), 200
    
    return app

app = create_app(os.getenv('FLASK_ENV'))

if __name__ == '__main__':
    app.run(
        debug=False,
        host='127.0.0.1',
        port=5000,
        use_reloader=False
    )