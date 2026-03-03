# hero-push.py
"""
Seed realistic data for the application with consistent user identity.
- No external deps (no faker). Curated pools + light generators.
- Consistent name/email across all "fronts" for the primary user.
- Realistic questions, sessions, resources, candidates, and interviews.
"""

import os
from datetime import datetime, timedelta
from random import randint, choice, random, seed as rand_seed

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


# -------------------------
# Config & Reproducibility
# -------------------------

# Primary user identity: consistent everywhere and in summary print
USER_NAME = os.getenv("SEED_USER_NAME", "Miranda Slovakia")
USER_EMAIL = os.getenv("SEED_USER_EMAIL", "miranda.slovakia@gmail.com")
USER_PASSWORD = os.getenv("SEED_USER_PASSWORD", "1234567890")

# Question volume & solved target
TOTAL_QUESTIONS = int(os.getenv("SEED_TOTAL_QUESTIONS", "1000"))
SOLVED_QUESTIONS = int(os.getenv("SEED_SOLVED_QUESTIONS", "899"))

# Random seed for reproducibility (optional)
if os.getenv("SEED_RANDOM"):
    try:
        rand_seed(int(os.getenv("SEED_RANDOM")))
    except ValueError:
        rand_seed(42)
else:
    rand_seed(42)


# -------------------------
# Utilities
# -------------------------

def days_ago(n: int) -> datetime:
    return datetime.utcnow() - timedelta(days=n)

def bounded(v, lo, hi):
    return max(lo, min(hi, v))


# -------------------------
# Truncate
# -------------------------

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
            # Table may not exist in some deployments; ignore
            pass
    conn.execute(text("SET FOREIGN_KEY_CHECKS=1;"))
    db.session.commit()
    print("[OK] Truncated all tables")


# -------------------------
# User
# -------------------------

def create_user(name: str, email: str, password: str) -> User:
    u = User(name=name, email=email)
    u.set_password(password)
    db.session.add(u)
    db.session.commit()
    print(f"[OK] User created: user_id={u.id} email={u.email}")
    return u


# -------------------------
# Questions (realistic)
# -------------------------

BASE_CATEGORIES = [
    "Arrays", "Strings", "Graphs", "Dynamic Programming", "Math",
    "Greedy", "Hashing", "Trees", "Linked Lists", "Stacks & Queues",
    "Heaps", "Binary Search", "Two Pointers", "Backtracking"
]

BASE_DIFFS = ["easy", "medium", "hard"]

# A realistic base pool of canonical DS/Algo practice topics
# Titles are generic/common problem archetypes used across platforms.
QUESTION_POOL = [
    ("Two Sum", "Arrays", "easy"),
    ("Reverse Linked List", "Linked Lists", "easy"),
    ("Valid Parentheses", "Stacks & Queues", "easy"),
    ("Merge Two Sorted Lists", "Linked Lists", "easy"),
    ("Best Time to Buy and Sell Stock", "Arrays", "easy"),
    ("Binary Tree Inorder Traversal", "Trees", "easy"),
    ("Climbing Stairs", "Dynamic Programming", "easy"),
    ("Maximum Subarray", "Arrays", "medium"),
    ("Longest Substring Without Repeating Characters", "Strings", "medium"),
    ("3Sum", "Arrays", "medium"),
    ("Binary Search", "Binary Search", "easy"),
    ("Lowest Common Ancestor of a BST", "Trees", "medium"),
    ("Course Schedule", "Graphs", "medium"),
    ("Number of Islands", "Graphs", "medium"),
    ("K Closest Points to Origin", "Heaps", "medium"),
    ("Top K Frequent Elements", "Hashing", "medium"),
    ("Product of Array Except Self", "Arrays", "medium"),
    ("Merge Intervals", "Arrays", "medium"),
    ("Validate Binary Search Tree", "Trees", "medium"),
    ("Rotting Oranges", "Graphs", "medium"),
    ("Word Break", "Dynamic Programming", "medium"),
    ("Coin Change", "Dynamic Programming", "medium"),
    ("Combination Sum", "Backtracking", "medium"),
    ("Permutations", "Backtracking", "medium"),
    ("Search in Rotated Sorted Array", "Binary Search", "medium"),
    ("Median of Two Sorted Arrays", "Binary Search", "hard"),
    ("Edit Distance", "Dynamic Programming", "hard"),
    ("Longest Increasing Subsequence", "Dynamic Programming", "medium"),
    ("Maximum Product Subarray", "Arrays", "medium"),
    ("Trapping Rain Water", "Two Pointers", "hard"),
    ("Minimum Window Substring", "Strings", "hard"),
    ("LRU Cache", "Hashing", "medium"),
    ("Serialize and Deserialize Binary Tree", "Trees", "hard"),
    ("Implement Trie (Prefix Tree)", "Hashing", "medium"),
    ("Pacific Atlantic Water Flow", "Graphs", "medium"),
    ("Dijkstra’s Shortest Path", "Graphs", "medium"),
    ("Bellman-Ford Negative Cycle Detection", "Graphs", "hard"),
    ("Kruskal’s MST", "Graphs", "medium"),
    ("N-Queens", "Backtracking", "hard"),
    ("Subsets II (With Duplicates)", "Backtracking", "medium"),
    ("Sliding Window Maximum", "Stacks & Queues", "hard"),
    ("Min Stack", "Stacks & Queues", "easy"),
    ("Evaluate Reverse Polish Notation", "Stacks & Queues", "medium"),
    ("Binary Tree Level Order Traversal", "Trees", "medium"),
    ("Reorder List", "Linked Lists", "medium"),
    ("Detect Cycle in Linked List", "Linked Lists", "easy"),
    ("House Robber", "Dynamic Programming", "medium"),
    ("Gas Station", "Greedy", "medium"),
    ("Jump Game", "Greedy", "medium"),
    ("Integer to Roman", "Math", "medium"),
    ("Pow(x, n)", "Math", "medium"),
    ("Bitwise AND of Numbers Range", "Math", "medium"),
    ("Find Minimum in Rotated Sorted Array", "Binary Search", "medium"),
    ("Kth Largest Element in an Array", "Heaps", "medium"),
    ("Ransom Note", "Hashing", "easy"),
    ("Group Anagrams", "Hashing", "medium"),
    ("Palindrome Partitioning", "Backtracking", "medium"),
    ("Restore IP Addresses", "Backtracking", "medium"),
    ("Word Ladder", "Graphs", "hard"),
    ("Meeting Rooms II", "Heaps", "medium"),
]

def _make_question_desc(title: str, category: str, diff: str, i: int) -> tuple[str, str]:
    """
    Returns (description, hints) realistic and succinct.
    """
    desc = (
        f"You are given inputs relevant to '{title}'. Design an algorithm in the '{category}'"
        f" category to solve it with optimal time and space complexity. Provide edge-case handling"
        f" and discuss trade-offs. Problem ID: Q{i}."
    )
    # Hints vary slightly by category
    cat_hint = {
        "Arrays": "Consider prefix/suffix scans and sliding windows.",
        "Strings": "Think hashing or two-pointer normalization for comparisons.",
        "Graphs": "Model as BFS/DFS; check for cycles and disconnected components.",
        "Dynamic Programming": "Define subproblems, transition, and base cases.",
        "Greedy": "Prove the greedy choice; check counterexamples.",
        "Hashing": "Use hash maps/sets to de-duplicate and count.",
        "Trees": "Recursive traversal vs iterative stack; consider BST properties.",
        "Linked Lists": "Use fast/slow pointers; watch for pointer re-wiring.",
        "Stacks & Queues": "Monotonic structures can reduce complexity.",
        "Heaps": "Maintain a k-sized heap for top-K patterns.",
        "Binary Search": "Binary search on value space or pivot.",
        "Two Pointers": "Converging or diverging pointers reduce overhead.",
        "Backtracking": "Prune branches early; maintain partial state.",
        "Math": "Look for invariants and modular arithmetic."
    }.get(category, "Start with a brute force baseline, then optimize.")
    hints = f"- Hint 1: {cat_hint}\n- Hint 2: Justify time/space complexity for a reviewer."
    return desc, hints

def _make_solution_outline(title: str, category: str, diff: str) -> str:
    return (
        f"Approach: Use standard techniques for {category.lower()} problems. "
        f"Provide a clear algorithm, prove correctness, and analyze complexity. "
        f"For {title}, produce a reference implementation in O(...) time and O(...) space."
    )

def seed_questions(min_count: int):
    """Create min_count realistic questions."""
    now = datetime.utcnow()
    pool_len = len(QUESTION_POOL)

    bulk = []
    for i in range(1, min_count + 1):
        if i <= pool_len:
            title, category, diff = QUESTION_POOL[i - 1]
        else:
            # Auto-extend: rotate base pool, vary category/difficulty slightly
            base_title, base_category, base_diff = QUESTION_POOL[(i - 1) % pool_len]
            # Variant suffix to avoid identical titles
            variant = (i // pool_len)
            category = choice(BASE_CATEGORIES) if random() < 0.5 else base_category
            diff = choice(BASE_DIFFS) if random() < 0.33 else base_diff
            title = f"{base_title} (Variant {variant})"

        desc, hints = _make_question_desc(title, category, diff, i)
        solution = _make_solution_outline(title, category, diff)

        bulk.append(Question(
            title=title,
            description=desc,
            category=category,
            difficulty=diff,
            solution=solution,
            hints=hints,
            created_at=now - timedelta(days=randint(0, 365))
        ))

        if i % 500 == 0:
            db.session.add_all(bulk)
            db.session.flush()
            bulk = []

    if bulk:
        db.session.add_all(bulk)

    db.session.commit()
    print(f"[OK] Questions seeded: {min_count}")


# -------------------------
# Sessions & Progress
# -------------------------

def seed_sessions_and_progress(user_id: int, total: int, solved: int):
    """Create realistic sessions and progress."""
    now = datetime.utcnow()
    solved = bounded(solved, 0, total)
    total_time = 0  # seconds

    if solved > 0:
        bulk = []
        # Distribute solved dates over last ~120 days, random attempts/time
        for qid in range(1, solved + 1):
            attempts = randint(1, 4)
            # 3-15 minutes per attempt is typical for practiced problems
            time_spent_s = sum(randint(180, 900) for _ in range(attempts))
            total_time += time_spent_s
            created_days_ago = randint(1, 120)
            solved_days_ago = randint(0, created_days_ago)
            bulk.append(PracticeSession(
                user_id=user_id,
                question_id=qid,
                status='solved',
                attempts=attempts,
                solved_at=now - timedelta(days=solved_days_ago),
                created_at=now - timedelta(days=created_days_ago)
            ))
            if qid % 500 == 0:
                db.session.add_all(bulk)
                db.session.flush()
                bulk = []
        if bulk:
            db.session.add_all(bulk)

    # One current in-progress session if not all solved
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
        total_time_spent_s=total_time
    ))
    db.session.commit()

    print(f"[OK] Sessions: {solved} solved + {1 if solved < total else 0} in_progress")
    print(f"[OK] Aggregate time spent: {total_time // 60} minutes")


# -------------------------
# Resources (credible)
# -------------------------

def seed_resources():
    """Create realistic resources from credible sources."""
    resources_data = [
        # Algorithms & Data Structures
        {"title": "CLRS Companion (MIT OCW Notes)", "description": "Lecture notes and supplements for algorithms.", "url": "https://ocw.mit.edu", "category": "Algorithms", "resource_type": "Reference"},
        {"title": "CP-Algorithms (e-maxx)", "description": "Curated explanations of algorithms and data structures.", "url": "https://cp-algorithms.com", "category": "Algorithms", "resource_type": "Reference"},
        {"title": "VisuAlgo", "description": "Visualizations of common data structures and algorithms.", "url": "https://visualgo.net/en", "category": "Data Structures", "resource_type": "Tool"},

        # System Design
        {"title": "System Design Primer", "description": "Concepts, trade-offs, and interview prep.", "url": "https://github.com/donnemartin/system-design-primer", "category": "System Design", "resource_type": "Guide"},
        {"title": "Grokking System Design", "description": "Patterns for system design interviews.", "url": "https://www.educative.io/courses/grokking-system-design-interview", "category": "System Design", "resource_type": "Course"},

        # OS & Networking
        {"title": "Operating Systems: Three Easy Pieces", "description": "Free book on OS concepts.", "url": "https://pages.cs.wisc.edu/~remzi/OSTEP/", "category": "OS", "resource_type": "Book"},
        {"title": "Computer Networking: A Top-Down Approach Resources", "description": "Companion materials to the textbook.", "url": "https://gaia.cs.umass.edu/kurose_ross/online_lectures.htm", "category": "Networking", "resource_type": "Reference"},

        # Databases
        {"title": "Use The Index, Luke", "description": "Practical SQL performance tuning.", "url": "https://use-the-index-luke.com", "category": "Databases", "resource_type": "Guide"},
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


# -------------------------
# Candidates (realistic)
# -------------------------

CANDIDATE_FIRST = [
    "Aarav", "Vivaan", "Aditya", "Ishaan", "Ananya", "Diya", "Sanjana", "Meera",
    "Rahul", "Rohit", "Sneha", "Pooja", "Karthik", "Arjun", "Nithya", "Priya",
    "Akash", "Varun", "Harini", "Vikram", "Ritika", "Shruti", "Anirudh", "Neha",
    "Alice", "Bob", "Carol", "David", "Ethan", "Sophia"
]
CANDIDATE_LAST = [
    "Sharma", "Iyer", "Reddy", "Nair", "Gupta", "Menon", "Kapoor", "Raman",
    "Krishnan", "Subramanian", "Mukherjee", "Kulkarni", "Desai", "Mehta",
    "Agarwal", "Chatterjee", "Verma", "Malhotra", "Singh", "Patel", "Khan",
    "Fernandes", "D’Souza", "Roy", "Bose", "Johnson", "Brown", "Williams",
    "Smith", "Taylor"
]
CANDIDATE_STATUS = ["active", "pending", "interviewing", "rejected"]

def _rand_phone_in():
    # Generate plausible +91 numbers: +91-9XXXXXXXXX
    return f"+91-{randint(7, 9)}{randint(0,9)}{randint(0,9)}{randint(0,9)}{randint(0,9)}{randint(0,9)}{randint(0,9)}{randint(0,9)}{randint(0,9)}{randint(0,9)}"

def _unique_email(name: str, used: set) -> str:
    base = name.lower().replace(" ", ".")
    i = 0
    while True:
        email = f"{base}{'' if i == 0 else i}@example.com"
        if email not in used:
            used.add(email)
            return email
        i += 1

def seed_candidates(count: int = 20):
    """Create realistic candidates with varied status."""
    now = datetime.utcnow()
    used_emails = set()
    total = 0

    for _ in range(count):
        full_name = f"{choice(CANDIDATE_FIRST)} {choice(CANDIDATE_LAST)}"
        email = _unique_email(full_name, used_emails)
        phone = _rand_phone_in()
        status = choice(CANDIDATE_STATUS)

        db.session.add(Candidate(
            name=full_name,
            email=email,
            phone=phone,
            status=status,
            created_at=now - timedelta(days=randint(0, 45))
        ))
        total += 1

    db.session.commit()
    print(f"[OK] Candidates seeded: {total}")


# -------------------------
# Interviews (realistic)
# -------------------------

INTERVIEW_FEEDBACK = [
    "Clear approach, justified complexity; minor edge cases missed.",
    "Good problem understanding; optimize space further.",
    "Excellent clarity and communication; optimal solution.",
    "Struggled with corner cases; required hints.",
    "Solid first attempt; improved with iterative refinement.",
    "Needs stronger mastery of DP transitions.",
    "Great use of examples; precise reasoning."
]

def seed_interviews():
    """Create multiple interviews per candidate across random questions."""
    try:
        now = datetime.utcnow()
        candidates = Candidate.query.all()
        qcount = Question.query.count()

        if not candidates or qcount == 0:
            print("[OK] Skipped interviews (no candidates/questions)")
            return

        total_interviews = 0

        # For each candidate, create 1–3 interview records distributed over recent days
        for cand in candidates:
            n = randint(1, 3)
            for _ in range(n):
                qid = randint(1, qcount)
                db.session.add(Interview(
                    candidate_id=cand.id,
                    question_id=qid,
                    score=randint(55, 95),  # wider spread, realistic
                    feedback=choice(INTERVIEW_FEEDBACK) if random() < 0.8 else None,
                    created_at=now - timedelta(days=randint(1, 20))
                ))
                total_interviews += 1

        db.session.commit()
        print(f"[OK] Interviews seeded: {total_interviews}")
    except Exception as e:
        db.session.rollback()
        print(f"[OK] Skipped interviews (table missing or error)")


# -------------------------
# Main
# -------------------------

def main():
    with app.app_context():
        truncate_all()

        # Create consistent primary user
        user = create_user(USER_NAME, USER_EMAIL, USER_PASSWORD)

        # Seed
        seed_questions(TOTAL_QUESTIONS)
        seed_sessions_and_progress(user.id, TOTAL_QUESTIONS, SOLVED_QUESTIONS)
        seed_resources()
        seed_candidates(count=20)
        seed_interviews()

        # Summary
        print("\n" + "=" * 60)
        print("ALL DATA SEEDED SUCCESSFULLY [DONE]")
        print("=" * 60)
        print(f"User: {USER_NAME}")
        print(f"Email: {USER_EMAIL}")
        print(f"Password: {USER_PASSWORD}")
        print(f"Progress: {SOLVED_QUESTIONS}/{TOTAL_QUESTIONS} problems solved")
        print(f"Questions: {TOTAL_QUESTIONS} seeded")
        print(f"Resources: {Resource.query.count()} seeded")
        print(f"Candidates: {Candidate.query.count()} seeded")
        print(f"Interviews: {Interview.query.count()} seeded")
        print("=" * 60)


if __name__ == "__main__":
    main()