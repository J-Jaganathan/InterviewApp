from flask import Blueprint, jsonify, request
from db import execute_query
from utils.auth_middleware import token_required

resources_bp = Blueprint("resources", __name__)


@resources_bp.route("", methods=["GET"])
@token_required
def get_resources():
    category = request.args.get("category")
    resource_type = request.args.get("type")

    query = "SELECT id, title, description, url, category, resource_type, created_at FROM resources WHERE 1=1"
    params = []

    if category:
        query += " AND category = %s"
        params.append(category)
    if resource_type:
        query += " AND resource_type = %s"
        params.append(resource_type)

    query += " ORDER BY created_at DESC"

    resources = execute_query(query, tuple(params), fetch=True, many=True)

    for r in resources:
        if r.get("created_at"):
            r["created_at"] = r["created_at"].isoformat()

    return jsonify({"resources": resources, "count": len(resources)}), 200