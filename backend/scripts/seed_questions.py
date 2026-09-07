import sys
import os
import asyncio

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import AsyncSessionLocal
from app.models.assessment import AptitudeQuestion, AptitudeCategory

QUESTIONS_DATA = [
    # Logical Reasoning
    {
        "category": AptitudeCategory.LOGICAL,
        "question": "If all Bloops are Razzies and all Razzies are Lizzies, are all Bloops definitely Lizzies?",
        "options": ["Yes, definitely", "No, never", "Only some Bloops", "Cannot be determined"],
        "correct_option": 0,
        "explanation": "Transitive property of categorical syllogisms: A ⊆ B and B ⊆ C implies A ⊆ C.",
        "difficulty": "Easy",
    },
    {
        "category": AptitudeCategory.LOGICAL,
        "question": "Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?",
        "options": ["(1/3)", "(1/8)", "(2/8)", "(1/16)"],
        "correct_option": 1,
        "explanation": "This is a simple geometric division series; each number is one-half of the previous number.",
        "difficulty": "Easy",
    },
    {
        "category": AptitudeCategory.LOGICAL,
        "question": "In a distributed system, Node A can only talk to Node B, and Node B can talk to Node C. If Node B crashes, can Node A reach Node C?",
        "options": ["Yes, via broadcast", "No, partition occurs", "Yes, automatically rerouted", "Only if Node C is master"],
        "correct_option": 1,
        "explanation": "Node B is a single point of failure (bridge) between Node A and Node C; losing B disconnects the path.",
        "difficulty": "Medium",
    },

    # Quantitative Aptitude
    {
        "category": AptitudeCategory.QUANTITATIVE,
        "question": "An API has an average response latency of 200ms. After caching, latency drops to 20ms. What is the percentage reduction?",
        "options": ["80%", "90%", "85%", "95%"],
        "correct_option": 1,
        "explanation": "Reduction = (200 - 20) / 200 = 180 / 200 = 90%.",
        "difficulty": "Easy",
    },
    {
        "category": AptitudeCategory.QUANTITATIVE,
        "question": "A server cluster processes 1,200 requests per second with 4 nodes. How many nodes are needed for 3,600 rps assuming linear scalability?",
        "options": ["8 nodes", "10 nodes", "12 nodes", "16 nodes"],
        "correct_option": 2,
        "explanation": "Capacity per node = 1200 / 4 = 300 rps. Total needed = 3600 / 300 = 12 nodes.",
        "difficulty": "Medium",
    },

    # Analytical Reasoning
    {
        "category": AptitudeCategory.ANALYTICAL,
        "question": "You have a sorted array of 1,000,000 integers. What is the maximum number of comparisons needed to find an element using binary search?",
        "options": ["10", "20", "100", "1,000"],
        "correct_option": 1,
        "explanation": "log2(1,000,000) ≈ 19.93, meaning at most 20 comparisons are required.",
        "difficulty": "Medium",
    },
    {
        "category": AptitudeCategory.ANALYTICAL,
        "question": "Which data structure provides amortized O(1) time complexity for insertion, deletion, and lookup?",
        "options": ["Binary Search Tree", "Linked List", "Hash Table", "B-Tree"],
        "correct_option": 2,
        "explanation": "Hash tables offer average/amortized O(1) operations given a good hash function.",
        "difficulty": "Easy",
    },

    # Verbal Ability
    {
        "category": AptitudeCategory.VERBAL,
        "question": "Choose the word most nearly opposite in meaning to 'EPHEMERAL':",
        "options": ["Transient", "Permanent", "Fleeting", "Evanescent"],
        "correct_option": 1,
        "explanation": "Ephemeral means short-lived; its antonym is permanent or lasting.",
        "difficulty": "Medium",
    },
    {
        "category": AptitudeCategory.VERBAL,
        "question": "Select the correctly punctuated sentence for documentation:",
        "options": [
            "The service failed because its database connection timed out.",
            "The service failed because it's database connection timed out.",
            "The service failed, because its' database connection timed out.",
            "The service failed because its database connection, timed out."
        ],
        "correct_option": 0,
        "explanation": "'Its' is the possessive pronoun; 'it\\'s' is a contraction of 'it is'.",
        "difficulty": "Easy",
    },

    # Problem Solving
    {
        "category": AptitudeCategory.PROBLEM_SOLVING,
        "question": "A production database query has suddenly become 10x slower as the user table reached 500k rows. What is the first diagnostic step?",
        "options": [
            "Reboot the production database server",
            "Run EXPLAIN / EXPLAIN ANALYZE on the query to inspect indexing",
            "Rewrite the entire application in C++",
            "Immediately shard the database across 5 machines"
        ],
        "correct_option": 1,
        "explanation": "Inspecting the query execution plan with EXPLAIN reveals sequential scans and missing indexes.",
        "difficulty": "Medium",
    },
    {
        "category": AptitudeCategory.PROBLEM_SOLVING,
        "question": "You encounter a race condition where two simultaneous updates overwrite each other. Which pattern best resolves this?",
        "options": [
            "Optimistic concurrency control with version column",
            "Sleep(500) before writing",
            "Increasing server memory",
            "Disabling database transactions"
        ],
        "correct_option": 0,
        "explanation": "Optimistic locking with version checks prevents lost updates without heavy pessimistic locking overhead.",
        "difficulty": "Hard",
    },
]


async def seed_questions(session: AsyncSession):
    print("🌱 Seeding Aptitude Questions catalog...")
    count = 0
    for q in QUESTIONS_DATA:
        stmt = select(AptitudeQuestion).where(AptitudeQuestion.question == q["question"])
        existing = (await session.execute(stmt)).scalar_one_or_none()
        if not existing:
            question = AptitudeQuestion(
                category=q["category"],
                question=q["question"],
                options=q["options"],
                correct_option=q["correct_option"],
                explanation=q["explanation"],
                difficulty=q["difficulty"],
            )
            session.add(question)
            count += 1
    await session.commit()
    print(f"✅ Seeded {count} new questions (total catalog: {len(QUESTIONS_DATA)}).")


if __name__ == "__main__":
    async def main():
        async with AsyncSessionLocal() as session:
            await seed_questions(session)
    asyncio.run(main())
