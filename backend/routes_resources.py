# routes_resources.py
from flask import Blueprint, request, jsonify
from models import Resource

resources_bp = Blueprint('resources', __name__, url_prefix='/api/resources')

@resources_bp.route('', methods=['GET'])
def get_resources():
    category = request.args.get('category')
    q = Resource.query
    if category:
        q = q.filter_by(category=category)
    items = q.order_by(Resource.created_at.desc()).all()
    return jsonify({"resources": [r.to_dict() for r in items]}), 200