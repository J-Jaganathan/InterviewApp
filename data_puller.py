#!/usr/bin/env python3
"""
Seed realistic dummy data into a MySQL database:
- users
- questions
- resources
- practice_sessions
- progress

Defaults insert:
- 1,000 users
- 1,000 questions
- 600 resources
- 3–6 practice_sessions per user
All values are configurable via CLI flags.

Requires:
    pip install mysql-connector-python
    pip install Faker   # optional; script falls back to built-in generators if not installed
"""

import os
import sys
import math
import time
import random
import hashlib
import argparse
from datetime import datetime, timedelta

try:
    from faker import Faker
    _FAKER_AVAILABLE = True
except ImportError:
    _FAKER_AVAILABLE = False

import mysql.connector
from mysql.connector import errorcode

# -----------------------
# DB CONFIG (edit here)
# -----------------------
DB_CONFIG = {
    "host": os.getenv("MYSQL_HOST", "127.0.0.1"),
    "port": int(os.getenv("MYSQL_PORT", "3306")),
    "user": os.getenv("MYSQL_USER", "root"),
    "password": os.getenv("MYSQL_PASSWORD", "SQL@123PPa"),
    "database": os.getenv("MYSQL_DATABASE", "interview_app_database"),
    "autocommit": False,
}

# -----------------------
# TUNABLES & CONSTANTS
# -----------------------
BATCH_SIZE = 2000  # bulk insert batch size
RANDOM_SEED = 42   # reproducibility

CATEGORIES = ["arrays", "strings", "graphs", "dynamic_programming", "math", "greedy", "trees", "hashing"]
RESOURCE_TYPES = ["article", "video", "cheatsheet", "exercise", "tutorial", "blog"]

STATUSES = ["pending", "in_progress", "solved", "skipped"]
DIFFICULTIES = ["easy", "medium", "hard"]

# Fallback generators if Faker is unavailable
FIRST_NAMES = [
    "Aarav","Diya","Arjun","Isha","Vikram","Karthik","Priya","Ravi","Neha","Rohit","Ananya",
    "Sanjay","Sneha","Harish","Meera","Arvind","Pooja","Vishal","Lakshmi","Naveen"
]
LAST_NAMES = [
    "Sharma","Iyer","Reddy","Patel","Gupta","Menon","Nair","Rao","Mishra","Kapoor","Bose","Ghosh","Das","Pillai","Verma"
]

# -----------------------
# Helpers
# -----------------------
def get_conn():
    return mysql.connector.connect(**DB_CONFIG)

def random_past_datetime(max_days_back: int, min_days_back: int = 0) -> datetime:
    """Random datetime between now - max_days_back and now - min_days_back (inclusive)."""
    assert max_days_back >= min_days_back >= 0
    days_back = random.randint(min_days_back, max_days_back)
    seconds = random.randint(0, 24 * 3600 - 1)
    return datetime.now() - timedelta(days=days_back, seconds=seconds)

def ensure_tables_exist(cursor):
    """Minimal sanity: fail fast if required tables are missing."""
    required = {"users", "questions", "resources", "practice_sessions", "progress"}
    cursor.execute("SHOW TABLES;")
    existing = {row[0] for row in cursor.fetchall()}
    missing = required - existing
    if missing:
        raise RuntimeError(f"Missing tables: {sorted(missing)}. Create schema first.")

def truncate_all(cursor):
    cursor.execute("SET FOREIGN_KEY_CHECKS=0;")
    for t in ["practice_sessions", "progress", "resources", "questions", "users"]:
        cursor.execute(f"TRUNCATE TABLE {t};")
    cursor.execute("SET FOREIGN_KEY_CHECKS=1;")

def chunked_iter(iterable, size):
    chunk = []
    for item in iterable:
        chunk.append(item)
        if len(chunk) >= size:
            yield chunk
            chunk = []
    if chunk:
        yield chunk

def sha256_hex(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest().upper()

def maybe_faker():
    if _FAKER_AVAILABLE:
        f = Faker()
        Faker.seed(RANDOM_SEED)
        return f
    return None

# -----------------------
# Generators
# -----------------------
def gen_user_records(n, faker=None):
    """Yield tuples for users: (name, email, password_hash, created_at, updated_at)"""
    seen_emails = set()
    for i in range(1, n + 1):
        if faker:
            name = faker.name()
            # Build a deterministic, unique email
            base = faker.user_name() if random.random() < 0.7 else name.replace(" ", ".").lower()
            email = f"{base}{i}@example.com".replace("..", ".")
        else:
            fn = random.choice(FIRST_NAMES)
            ln = random.choice(LAST_NAMES)
            name = f"{fn} {ln}"
            email = f"{fn.lower()}.{ln.lower()}{i}@example.com"

        # Guarantee uniqueness in case of collisions
        if email in seen_emails:
            email = f"user{i:04d}@example.com"
        seen_emails.add(email)

        # Realistic timestamps: spread across past 365 days
        created_at = random_past_datetime(365, 120)
        # updated_at >= created_at
        updated_at = created_at + timedelta(days=random.randint(0, 90), seconds=random.randint(0, 3600))

        # Deterministic password hash pattern (NEVER use in prod)
        password_hash = sha256_hex(f"Password{i:04d}!{name}")

        yield (name, email, password_hash, created_at, updated_at)

def gen_question_records(n, faker=None):
    """Yield tuples for questions: (title, description, category, difficulty, solution, hints, created_at)"""
    for i in range(1, n + 1):
        cat = random.choice(CATEGORIES)
        difficulty = random.choices(DIFFICULTIES, weights=[4, 5, 3], k=1)[0]
        if faker:
            topic = faker.word()
            title = f"Q{i}: {topic.title()} – {cat.replace('_', ' ').title()}"
            description = faker.paragraph(nb_sentences=4)
            solution = " ".join(faker.sentences(nb=3))
            hint = f"Consider {random.choice(['two pointers','sliding window','BFS','DFS','binary search','prefix sums'])}."
        else:
            title = f"Q{i}: {cat.title()} Problem"
            description = f"Detailed description for problem {i} in {cat}. Includes constraints and examples."
            solution = f"Outline approach for problem {i}: discuss complexity and edge cases."
            hint = random.choice([
                "Think two pointers.", "Try sliding window.", "Consider BFS/DFS.",
                "Use memoization.", "Binary search on answer.", "Leverage prefix sums."
            ])
        created_at = random_past_datetime(180, 0)
        yield (title, description, cat, difficulty, solution, hint, created_at)

def gen_resource_records(n, faker=None):
    """Yield tuples for resources: (title, description, url, category, resource_type, created_at)"""
    for i in range(1, n + 1):
        cat = random.choice(CATEGORIES)
        rtype = random.choice(RESOURCE_TYPES)
        if faker:
            title = f"{rtype.title()}: {faker.catch_phrase()}"
            description = faker.paragraph(nb_sentences=3)
            slug = "-".join(title.lower().split())
            url = f"https://example.com/{rtype}/{slug}-{i}"
        else:
            title = f"{rtype.title()} for {cat.title()} #{i}"
            description = f"Curated {rtype} covering {cat} topic, item {i}."
            url = f"https://example.com/{rtype}/{cat}/{i}"
        created_at = random_past_datetime(120, 0)
        yield (title, description, url, cat, rtype, created_at)

def gen_practice_sessions_for_users(user_start_id, user_count, question_count):
    """
    For each user, create 3–6 sessions across different questions.
    Returns tuples: (user_id, question_id, status, attempts, solved_at, created_at)
    """
    for u in range(user_start_id, user_start_id + user_count):
        k = random.randint(3, 6)
        # Choose distinct question IDs per user
        qids = random.sample(range(1, question_count + 1), k=min(k, question_count))
        for j, q in enumerate(qids):
            # realistic status distribution
            status = random.choices(STATUSES, weights=[2, 3, 4, 1], k=1)[0]
            # attempts: solved tends to have >0 attempt
            if status == "solved":
                attempts = random.choices([1, 2, 3], weights=[6, 3, 1], k=1)[0]
            elif status == "in_progress":
                attempts = random.choices([0, 1, 2], weights=[2, 5, 3], k=1)[0]
            else:
                attempts = random.choices([0, 1], weights=[8, 2], k=1)[0]

            created_at = random_past_datetime(60, 0)
            solved_at = None
            if status == "solved":
                # solved_at same day or later than created_at
                solved_at = created_at + timedelta(minutes=random.randint(5, 240))

            yield (u, q, status, attempts, solved_at, created_at)

def aggregate_progress_from_sessions(sessions, user_start_id, user_count):
    """
    Compute progress rows from the generated sessions in-memory to avoid heavy SQL.
    Returns dict user_id -> (total_problems, solved_problems, total_time_spent_s, last_updated)
    """
    by_user = {u: {"total": 0, "solved": 0, "time": 0, "last": datetime.now()} 
               for u in range(user_start_id, user_start_id + user_count)}
    for (user_id, _qid, status, attempts, solved_at, created_at) in sessions:
        by_user[user_id]["total"] += 1
        if status == "solved":
            by_user[user_id]["solved"] += 1
        # crude time model: (attempts+1) * 180s, adjusted if solved
        base = (attempts + 1) * 180
        if status == "solved":
            base += random.randint(60, 600)
        by_user[user_id]["time"] += base
        by_user[user_id]["last"] = max(by_user[user_id]["last"], created_at if solved_at is None else solved_at)

    # convert to tuples
    for u in range(user_start_id, user_start_id + user_count):
        m = by_user[u]
        yield (u, m["total"], m["solved"], m["time"], m["last"])

# -----------------------
# Insert routines
# -----------------------
def insert_users(cursor, records):
    sql = """
        INSERT INTO users (name, email, password_hash, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s)
    """
    total = 0
    for chunk in chunked_iter(records, BATCH_SIZE):
        cursor.executemany(sql, chunk)
        total += len(chunk)
    return total

def insert_questions(cursor, records):
    sql = """
        INSERT INTO questions (title, description, category, difficulty, solution, hints, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    total = 0
    for chunk in chunked_iter(records, BATCH_SIZE):
        cursor.executemany(sql, chunk)
        total += len(chunk)
    return total

def insert_resources(cursor, records):
    sql = """
        INSERT INTO resources (title, description, url, category, resource_type, created_at)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    total = 0
    for chunk in chunked_iter(records, BATCH_SIZE):
        cursor.executemany(sql, chunk)
        total += len(chunk)
    return total

def insert_practice_sessions(cursor, records):
    sql = """
        INSERT INTO practice_sessions (user_id, question_id, status, attempts, solved_at, created_at)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    total = 0
    for chunk in chunked_iter(records, BATCH_SIZE):
        cursor.executemany(sql, chunk)
        total += len(chunk)
    return total

def insert_progress(cursor, records):
    sql = """
        INSERT INTO progress (user_id, total_problems, solved_problems, total_time_spent_s, last_updated)
        VALUES (%s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
          total_problems = VALUES(total_problems),
          solved_problems = VALUES(solved_problems),
          total_time_spent_s = VALUES(total_time_spent_s),
          last_updated = VALUES(last_updated)
    """
    total = 0
    for chunk in chunked_iter(records, BATCH_SIZE):
        cursor.executemany(sql, chunk)
        total += len(chunk)
    return total

# -----------------------
# Main driver
# -----------------------
def main():
    parser = argparse.ArgumentParser(description="Seed realistic dummy data into MySQL.")
    parser.add_argument("--users", type=int, default=1000, help="Number of users to create.")
    parser.add_argument("--questions", type=int, default=1000, help="Number of questions to create.")
    parser.add_argument("--resources", type=int, default=600, help="Number of resources to create.")
    parser.add_argument("--truncate", action="store_true", help="Truncate tables before inserting.")
    parser.add_argument("--no-faker", action="store_true", help="Force built-in generators (ignore Faker).")
    parser.add_argument("--seed", type=int, default=RANDOM_SEED, help="Random seed for reproducibility.")
    args = parser.parse_args()

    random.seed(args.seed)
    faker = None if args.no_faker or not _FAKER_AVAILABLE else maybe_faker()

    print(f"[INFO] Connecting to MySQL at {DB_CONFIG['host']}:{DB_CONFIG['port']} / DB={DB_CONFIG['database']}")
    conn = get_conn()
    cursor = conn.cursor()

    try:
        ensure_tables_exist(cursor)
        if args.truncate:
            print("[INFO] Truncating tables...")
            truncate_all(cursor)
            conn.commit()

        # USERS
        print(f"[INFO] Generating {args.users} users...")
        users_iter = list(gen_user_records(args.users, faker=faker))
        t0 = time.time()
        inserted_users = insert_users(cursor, users_iter)
        conn.commit()
        print(f"[OK] Inserted users: {inserted_users} in {time.time() - t0:.2f}s")

        # QUESTIONS
        print(f"[INFO] Generating {args.questions} questions...")
        questions_iter = list(gen_question_records(args.questions, faker=faker))
        t0 = time.time()
        inserted_questions = insert_questions(cursor, questions_iter)
        conn.commit()
        print(f"[OK] Inserted questions: {inserted_questions} in {time.time() - t0:.2f}s")

        # RESOURCES
        print(f"[INFO] Generating {args.resources} resources...")
        resources_iter = list(gen_resource_records(args.resources, faker=faker))
        t0 = time.time()
        inserted_resources = insert_resources(cursor, resources_iter)
        conn.commit()
        print(f"[OK] Inserted resources: {inserted_resources} in {time.time() - t0:.2f}s")

        # PRACTICE SESSIONS (derived)
        print(f"[INFO] Generating practice sessions (3–6 per user)...")
        sessions_iter = list(gen_practice_sessions_for_users(1, args.users, args.questions))
        t0 = time.time()
        inserted_ps = insert_practice_sessions(cursor, sessions_iter)
        conn.commit()
        print(f"[OK] Inserted practice_sessions: {inserted_ps} in {time.time() - t0:.2f}s")

        # PROGRESS (aggregate in-memory)
        print("[INFO] Aggregating progress per user...")
        progress_iter = list(aggregate_progress_from_sessions(sessions_iter, 1, args.users))
        t0 = time.time()
        inserted_prog = insert_progress(cursor, progress_iter)
        conn.commit()
        print(f"[OK] Upserted progress rows: {inserted_prog} in {time.time() - t0:.2f}s")

        print("\n[SUCCESS] Seeding complete.")
        print("         Quick checks you can run in Workbench:")
        print("           SELECT COUNT(*) FROM users;")
        print("           SELECT COUNT(*) FROM questions;")
        print("           SELECT COUNT(*) FROM resources;")
        print("           SELECT COUNT(*) FROM practice_sessions;")
        print("           SELECT COUNT(*) FROM progress;")

    except Exception as e:
        conn.rollback()
        print(f"[ERROR] {e}", file=sys.stderr)
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()