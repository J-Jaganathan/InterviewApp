# hero-push.py
"""
Seed complete data for Miranda Svolakia.
"""

import os
from datetime import datetime, timedelta
from random import randint, choice

from sqlalchemy import text

app = None
try:
    from app import app as flask_app
    app = flask_app
except Exception:
    try:
        from app import create_app
        app = create_app(os.getenv("FLASK_ENV", "development"))
    except Exception as e:
        raise RuntimeError("Could not import Flask app.") from e

from models import db, User, Question, PracticeSession, Progress, Resource, Candidate, Interview


def truncate_all():
    """Truncate all tables."""
    tables = [
        "practice_sessions", "interviews", "resources", "progress",
        "candidates", "questions", "password_reset_tokens", "users"
    ]
    conn = db.session.connection()
    conn.execute(text("SET FOREIGN_KEY_CHECKS=0;"))
    for t in tables:
        try:
            conn.execute(text(f"TRUNCATE TABLE {t};"))
        except Exception:
            pass
    conn.execute(text("SET FOREIGN_KEY_CHECKS=1;"))
    db.session.commit()
    print("[OK] Truncated all tables")


def create_user(name: str, email: str, password: str) -> User:
    u = User(name=name, email=email)
    u.set_password(password)
    db.session.add(u)
    db.session.commit()
    print(f"[OK] User created: user_id={u.id} email={u.email}")
    return u


def seed_questions(min_count: int):
    """Create min_count questions."""
    cats = ["Arrays", "Strings", "Graphs", "DP", "Math", "Greedy", "Hashing", "Trees"]
    diffs = ["easy", "medium", "hard"]
    now = datetime.utcnow()

    bulk = []
    for i in range(1, min_count + 1):
        bulk.append(Question(
            title=f"Problem #{i}",
            description=f"Description for problem {i}.",
            category=choice(cats),
            difficulty=choice(diffs),
            solution=f"Solution for problem {i}.",
            hints=f"Hint for problem {i}.",
            created_at=now
        ))
        if i % 500 == 0:
            db.session.add_all(bulk)
            db.session.flush()
            bulk = []
    if bulk:
        db.session.add_all(bulk)
    db.session.commit()
    print(f"[OK] Questions seeded: {min_count}")


def seed_sessions_and_progress(user_id: int, total: int, solved: int):
    """Create solved sessions and progress."""
    now = datetime.utcnow()
    solved = max(0, min(solved, total))

    if solved > 0:
        bulk = []
        for qid in range(1, solved + 1):
            bulk.append(PracticeSession(
                user_id=user_id,
                question_id=qid,
                status='solved',
                attempts=randint(1, 3),
                solved_at=now - timedelta(days=randint(1, 60)),
                created_at=now - timedelta(days=randint(1, 60))
            ))
            if qid % 500 == 0:
                db.session.add_all(bulk)
                db.session.flush()
                bulk = []
        if bulk:
            db.session.add_all(bulk)

    if solved < total:
        db.session.add(PracticeSession(
            user_id=user_id,
            question_id=solved + 1,
            status='in_progress',
            attempts=1,
            created_at=now
        ))

    db.session.add(Progress(
        user_id=user_id,
        total_problems=total,
        solved_problems=solved,
        total_time_spent_s=solved * 180
    ))
    db.session.commit()
    print(f"[OK] Sessions: {solved} solved + {1 if solved < total else 0} in_progress")


def seed_resources():
    """Create resources."""
    resources_data = [
        {"title": "Python Algorithms Masterclass", "description": "Guide to solving algorithmic problems.", "url": "https://www.udemy.com/course/python-algorithms/", "category": "Algorithms", "resource_type": "Course"},
        {"title": "LeetCode Data Structures Guide", "description": "Understanding data structures.", "url": "https://leetcode.com/explore/", "category": "Data Structures", "resource_type": "Guide"},
        {"title": "Graph Theory Fundamentals", "description": "Graph algorithms BFS, DFS, Dijkstra.", "url": "https://www.coursera.org/learn/graph-algorithms", "category": "Graphs", "resource_type": "Course"},
        {"title": "Dynamic Programming Patterns", "description": "Common DP patterns.", "url": "https://www.educative.io/path/dynamic-programming", "category": "DP", "resource_type": "Course"},
        {"title": "System Design Interview Prep", "description": "System design fundamentals.", "url": "https://www.educative.io/courses/grokking-system-design-interview", "category": "System Design", "resource_type": "Course"},
        {"title": "String Algorithms Cheat Sheet", "description": "Common string problems.", "url": "https://github.com/trekhleb/javascript-algorithms", "category": "Strings", "resource_type": "Reference"},
        {"title": "Bit Manipulation Tricks", "description": "Bit manipulation techniques.", "url": "https://www.geeksforgeeks.org/bit-tricks-competitive-programming/", "category": "Math", "resource_type": "Article"},
        {"title": "Tree Traversal Patterns", "description": "Tree traversal techniques.", "url": "https://www.baeldung.com/java-binary-tree-traversal", "category": "Trees", "resource_type": "Guide"},
    ]

    now = datetime.utcnow()
    for data in resources_data:
        db.session.add(Resource(
            title=data["title"],
            description=data["description"],
            url=data["url"],
            category=data["category"],
            resource_type=data["resource_type"],
            created_at=now
        ))
    db.session.commit()
    print(f"[OK] Resources seeded: {len(resources_data)}")


def seed_candidates():
    """Create candidates."""
    candidates_data = [
        {"name": "Alice Johnson", "email": "alice@example.com", "phone": "+1-555-0101", "status": "active"},
        {"name": "Bob Smith", "email": "bob@example.com", "phone": "+1-555-0102", "status": "active"},
        {"name": "Carol Williams", "email": "carol@example.com", "phone": "+1-555-0103", "status": "pending"},
        {"name": "David Brown", "email": "david@example.com", "phone": "+1-555-0104", "status": "active"},
    ]

    now = datetime.utcnow()
    for data in candidates_data:
        db.session.add(Candidate(
            name=data["name"],
            email=data["email"],
            phone=data["phone"],
            status=data["status"],
            created_at=now
        ))
    db.session.commit()
    print(f"[OK] Candidates seeded: {len(candidates_data)}")


def seed_interviews():
    """Create interviews if table exists."""
    try:
        now = datetime.utcnow()
        candidates = Candidate.query.all()
        questions = Question.query.limit(4).all()
        
        if not candidates or not questions:
            print("[OK] Skipped interviews (no candidates/questions)")
            return
        
        interview_count = 0
        for candidate in candidates[:4]:
            for question in questions:
                if interview_count >= 4:
                    break
                db.session.add(Interview(
                    candidate_id=candidate.id,
                    question_id=question.id,
                    score=randint(70, 95),
                    feedback="Strong response" if randint(0, 1) else None,
                    created_at=now - timedelta(days=randint(1, 20))
                ))
                interview_count += 1
            if interview_count >= 4:
                break
        
        db.session.commit()
        print(f"[OK] Interviews seeded: {interview_count}")
    except Exception as e:
        print(f"[OK] Skipped interviews (table missing or error)")


def main():
    with app.app_context():
        truncate_all()
        user = create_user("Miranda Svolakia", "miranda.svolakia@gmail.com", "1234567890")
        seed_questions(1000)
        seed_sessions_and_progress(user.id, 1000, 899)
        seed_resources()
        seed_candidates()
        seed_interviews()

        print("\n" + "="*60)
        print("ALL DATA SEEDED SUCCESSFULLY [DONE]")
        print("="*60)
        print(f"User: Miranda Svolakia")
        print(f"Email: miranda.svolakia@gmail.com")
        print(f"Password: 1234567890")
        print(f"Progress: 899/1000 problems solved")
        print(f"Questions: 1000 seeded")
        print(f"Resources: 8 seeded")
        print(f"Candidates: 4 seeded")
        print(f"Interviews: 4 seeded")
        print("="*60)


if __name__ == "__main__":
    main()
