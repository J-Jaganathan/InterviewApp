from app import create_app
from models import Resource, Question, Progress, User, PracticeSession

app = create_app()
with app.app_context():
    print(f'Users: {User.query.count()}')
    print(f'Resources: {Resource.query.count()}')
    print(f'Questions: {Question.query.count()}')
    print(f'Progress: {Progress.query.count()}')
    print(f'Practice Sessions: {PracticeSession.query.count()}')
    
    # Show sample data
    print("\n--- Sample Resources ---")
    resources = Resource.query.limit(3).all()
    for r in resources:
        print(f"  {r.title} ({r.category})")
    
    print("\n--- Sample Questions ---")
    questions = Question.query.limit(3).all()
    for q in questions:
        print(f"  {q.title} ({q.difficulty})")
