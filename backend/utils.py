from datetime import datetime
import json

def success_response(data=None, message=None, status_code=200):
    """Generate a success response"""
    response = {}
    if message:
        response['message'] = message
    if data:
        response.update(data)
    return response, status_code

def error_response(message, status_code=400):
    """Generate an error response"""
    return {'message': message}, status_code

def paginate(query, page=1, per_page=20):
    """Paginate query results"""
    paginated = query.paginate(page=page, per_page=per_page)
    return {
        'items': [item.to_dict() for item in paginated.items],
        'total': paginated.total,
        'pages': paginated.pages,
        'current_page': page
    }

def format_datetime(dt):
    """Format datetime to ISO format"""
    if isinstance(dt, datetime):
        return dt.isoformat()
    return dt

def validate_required_fields(data, required_fields):
    """Validate that required fields are present in data"""
    missing_fields = [field for field in required_fields if field not in data or not data[field]]
    if missing_fields:
        return False, f"Missing required fields: {', '.join(missing_fields)}"
    return True, None
