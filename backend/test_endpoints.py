from app import create_app
from models import User
from auth import generate_token
import json

app = create_app()

with app.app_context():
    user = User.query.first()
    token = generate_token(user.id)

with app.test_client() as client:
    headers = {'Authorization': f'Bearer {token}'}
    
    print('=== /api/progress ===')
    resp = client.get('/api/progress', headers=headers)
    data = json.loads(resp.data)
    print(json.dumps(data, indent=2))
    
    print('\n=== /api/dashboard ===')
    resp = client.get('/api/dashboard', headers=headers)
    data = json.loads(resp.data)
    print(json.dumps(data, indent=2)[:1000])
