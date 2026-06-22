from flask import Blueprint, jsonify, request
from db import execute_query
from utils.auth_middleware import token_required

study_plan_bp = Blueprint("study_plan", __name__)

WEEKLY_PLAN = [
    {
        "week": 1,
        "theme": "Foundations",
        "days": [
            {"day": "Monday", "topic": "Arrays & Strings", "category": "DSA", "duration_min": 60,
             "tasks": ["Study array manipulation", "Solve 3 easy array problems", "Review time complexity"]},
            {"day": "Tuesday", "topic": "Linked Lists", "category": "DSA", "duration_min": 60,
             "tasks": ["Understand singly & doubly linked lists", "Implement from scratch", "Solve 2 medium problems"]},
            {"day": "Wednesday", "topic": "Stacks & Queues", "category": "DSA", "duration_min": 60,
             "tasks": ["Learn stack/queue internals", "Solve bracket matching problem", "BFS intro"]},
            {"day": "Thursday", "topic": "System Design Basics", "category": "System Design", "duration_min": 90,
             "tasks": ["Read about scalability", "Study load balancing", "CAP theorem overview"]},
            {"day": "Friday", "topic": "Behavioral Interview Prep", "category": "Behavioral", "duration_min": 45,
             "tasks": ["STAR method practice", "Prepare 3 conflict stories", "Leadership examples"]},
            {"day": "Saturday", "topic": "Mock Interview", "category": "Practice", "duration_min": 120,
             "tasks": ["Full mock DSA session", "Whiteboard practice", "Time yourself"]},
            {"day": "Sunday", "topic": "Review & Rest", "category": "Review", "duration_min": 30,
             "tasks": ["Review weak areas", "Update notes", "Plan next week"]},
        ],
    },
    {
        "week": 2,
        "theme": "Intermediate Data Structures",
        "days": [
            {"day": "Monday", "topic": "Trees & BST", "category": "DSA", "duration_min": 60,
             "tasks": ["Binary tree traversals", "BST operations", "Solve 3 tree problems"]},
            {"day": "Tuesday", "topic": "Heaps & Priority Queues", "category": "DSA", "duration_min": 60,
             "tasks": ["Min/Max heap", "Heapify algorithm", "Top-K elements problem"]},
            {"day": "Wednesday", "topic": "Hashing & Maps", "category": "DSA", "duration_min": 60,
             "tasks": ["Hash table internals", "Collision resolution", "Two-sum & variations"]},
            {"day": "Thursday", "topic": "Database Design", "category": "System Design", "duration_min": 90,
             "tasks": ["Normalization basics", "Indexing strategies", "SQL vs NoSQL"]},
            {"day": "Friday", "topic": "Graphs Introduction", "category": "DSA", "duration_min": 60,
             "tasks": ["Adjacency list/matrix", "DFS & BFS", "Cycle detection"]},
            {"day": "Saturday", "topic": "Mock Interview", "category": "Practice", "duration_min": 120,
             "tasks": ["Medium difficulty problems", "System design question", "Peer review"]},
            {"day": "Sunday", "topic": "Review & Rest", "category": "Review", "duration_min": 30,
             "tasks": ["Consolidate notes", "Re-attempt failed problems", "Rest"]},
        ],
    },
    {
        "week": 3,
        "theme": "Advanced Algorithms",
        "days": [
            {"day": "Monday", "topic": "Dynamic Programming I", "category": "DSA", "duration_min": 75,
             "tasks": ["Memoization vs tabulation", "Fibonacci patterns", "Knapsack problem"]},
            {"day": "Tuesday", "topic": "Dynamic Programming II", "category": "DSA", "duration_min": 75,
             "tasks": ["LCS & LIS", "Coin change variants", "Solve 2 hard DP problems"]},
            {"day": "Wednesday", "topic": "Sorting & Searching", "category": "DSA", "duration_min": 60,
             "tasks": ["Merge sort, quick sort", "Binary search variants", "Search in rotated array"]},
            {"day": "Thursday", "topic": "Distributed Systems", "category": "System Design", "duration_min": 90,
             "tasks": ["Microservices architecture", "Message queues", "Design a URL shortener"]},
            {"day": "Friday", "topic": "Greedy Algorithms", "category": "DSA", "duration_min": 60,
             "tasks": ["Activity selection", "Interval scheduling", "Huffman coding intro"]},
            {"day": "Saturday", "topic": "Mock Interview", "category": "Practice", "duration_min": 120,
             "tasks": ["Hard problems session", "Full system design mock", "Timed coding round"]},
            {"day": "Sunday", "topic": "Review & Rest", "category": "Review", "duration_min": 30,
             "tasks": ["Weak spots review", "Flashcard review", "Reflect on progress"]},
        ],
    },
    {
        "week": 4,
        "theme": "Interview Mastery",
        "days": [
            {"day": "Monday", "topic": "Company-Specific Prep", "category": "Research", "duration_min": 60,
             "tasks": ["Research target companies", "Review past interview questions", "Glassdoor research"]},
            {"day": "Tuesday", "topic": "Bit Manipulation", "category": "DSA", "duration_min": 45,
             "tasks": ["AND/OR/XOR/NOT", "Common bit tricks", "Power of two checks"]},
            {"day": "Wednesday", "topic": "Trie & Advanced Trees", "category": "DSA", "duration_min": 60,
             "tasks": ["Trie implementation", "Autocomplete design", "Segment trees intro"]},
            {"day": "Thursday", "topic": "Full System Design", "category": "System Design", "duration_min": 120,
             "tasks": ["Design Twitter feed", "Design Netflix CDN", "API rate limiting"]},
            {"day": "Friday", "topic": "Behavioral Deep Dive", "category": "Behavioral", "duration_min": 60,
             "tasks": ["Practice all STAR answers", "Salary negotiation tips", "Questions to ask interviewer"]},
            {"day": "Saturday", "topic": "Full Mock Interview Day", "category": "Practice", "duration_min": 180,
             "tasks": ["2 full technical rounds", "1 behavioral round", "System design round"]},
            {"day": "Sunday", "topic": "Final Review", "category": "Review", "duration_min": 60,
             "tasks": ["Review all notes", "Confidence affirmations", "Prepare interview day checklist"]},
        ],
    },
]


@study_plan_bp.route("", methods=["GET"])
@token_required
def get_study_plan():
    week = request.args.get("week", type=int)

    if week:
        plan = next((w for w in WEEKLY_PLAN if w["week"] == week), None)
        if not plan:
            return jsonify({"error": "Week not found"}), 404
        return jsonify(plan), 200

    return jsonify({
        "study_plan": WEEKLY_PLAN,
        "total_weeks": len(WEEKLY_PLAN),
        "summary": "4-week structured interview preparation plan covering DSA, System Design, and Behavioral rounds.",
    }), 200