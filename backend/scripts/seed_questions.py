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
from app.firebase.firestore import FirestoreRepository, FirestoreCollections

QUESTIONS_DATA = [
    # =========================================================================
    # 1. LOGICAL REASONING (5 questions)
    # =========================================================================
    {
        "category": AptitudeCategory.LOGICAL,
        "question": 'In a certain code, "CLOUD" is written as "DMPVE". How is "SYSTEM" written in that same code?',
        "options": ["TZTUFN", "SZTUFM", "TYTUFN", "TATUSN"],
        "correct_option": 0,
        "explanation": "Each letter is shifted forward by 1 in the alphabet: S->T, Y->Z, S->T, T->U, E->F, M->N.",
        "difficulty": "Easy",
    },
    {
        "category": AptitudeCategory.LOGICAL,
        "question": "Statements: All microservices run in containers. Some containers are managed by Kubernetes. Conclusions: I. Some microservices are managed by Kubernetes. II. All Kubernetes nodes host microservices.",
        "options": [
            "Only conclusion I follows",
            "Only conclusion II follows",
            "Neither I nor II follows",
            "Both I and II follow",
        ],
        "correct_option": 2,
        "explanation": 'Since only "some containers" are in Kubernetes, we cannot conclude with certainty that the microservices containers specifically are among those without further premises.',
        "difficulty": "Medium",
    },
    {
        "category": AptitudeCategory.LOGICAL,
        "question": "Look at this series: 2, 6, 12, 20, 30, ... What number should come next?",
        "options": ["40", "42", "44", "48"],
        "correct_option": 1,
        "explanation": "Differences between consecutive numbers increase by 2: +4, +6, +8, +10, so +12 -> 30 + 12 = 42 (or n*(n+1): 1*2, 2*3, 3*4, 4*5, 5*6, 6*7=42).",
        "difficulty": "Easy",
    },
    {
        "category": AptitudeCategory.LOGICAL,
        "question": "Point A is 5km North of B. Point C is 12km East of B. What is the shortest direct line distance from A to C?",
        "options": ["17 km", "13 km", "15 km", "14 km"],
        "correct_option": 1,
        "explanation": "Using Pythagorean theorem: sqrt(5^2 + 12^2) = sqrt(25 + 144) = sqrt(169) = 13 km.",
        "difficulty": "Medium",
    },
    {
        "category": AptitudeCategory.LOGICAL,
        "question": "Five servers (S1, S2, S3, S4, S5) are queued. S1 finishes before S3. S4 finishes after S2 but before S1. S5 finishes last. Which server finishes second?",
        "options": ["S1", "S2", "S4", "S3"],
        "correct_option": 2,
        "explanation": "Order: S2 finishes first, then S4, then S1, then S3, then S5. The second server to finish is S4.",
        "difficulty": "Medium",
    },

    # =========================================================================
    # 2. QUANTITATIVE APTITUDE (5 questions)
    # =========================================================================
    {
        "category": AptitudeCategory.QUANTITATIVE,
        "question": "A cloud server processes 1,200 requests per minute with 4 CPU cores. If capacity scales linearly, how many requests can 7 CPU cores process in 30 seconds?",
        "options": ["1,050", "2,100", "1,400", "1,200"],
        "correct_option": 0,
        "explanation": "1 core handles 1200 / 4 = 300 req/min. 7 cores handle 7 * 300 = 2100 req/min. In 30 seconds (0.5 min), 2100 * 0.5 = 1050 requests.",
        "difficulty": "Medium",
    },
    {
        "category": AptitudeCategory.QUANTITATIVE,
        "question": "If the price of a cloud database cluster drops by 20% and its usage increases by 25%, what is the net effect on the company total spend for this service?",
        "options": [
            "Decreases by 5%",
            "Increases by 5%",
            "Remains unchanged (0% change)",
            "Increases by 2%",
        ],
        "correct_option": 2,
        "explanation": "New Spend = (0.80) * (1.25) = 1.00. Hence, there is no change in total spend.",
        "difficulty": "Medium",
    },
    {
        "category": AptitudeCategory.QUANTITATIVE,
        "question": "An API response time has a mean of 120ms with standard deviation of 15ms. Assuming normal distribution, approximately what percentage of requests respond in under 150ms?",
        "options": ["68%", "95%", "97.5%", "99.7%"],
        "correct_option": 2,
        "explanation": "150ms is (150-120)/15 = 2 standard deviations above the mean. The area under the normal curve below +2 sigma is approximately 97.7% (~97.5%).",
        "difficulty": "Hard",
    },
    {
        "category": AptitudeCategory.QUANTITATIVE,
        "question": "A distributed queue receives 400 messages/sec and 2 workers can process 150 messages/sec each. How many additional workers are required to prevent queue backlog?",
        "options": ["1 worker", "2 workers", "3 workers", "4 workers"],
        "correct_option": 0,
        "explanation": "Current capacity = 2 * 150 = 300 msg/s. Deficit = 400 - 300 = 100 msg/s. 1 extra worker adds 150 msg/s, raising capacity to 450 msg/s, clearing backlog.",
        "difficulty": "Easy",
    },
    {
        "category": AptitudeCategory.QUANTITATIVE,
        "question": "What is the sum of integers from 1 to 50 inclusive?",
        "options": ["1,250", "1,275", "1,300", "1,325"],
        "correct_option": 1,
        "explanation": "Sum = n*(n+1)/2 = 50 * 51 / 2 = 25 * 51 = 1275.",
        "difficulty": "Easy",
    },

    # =========================================================================
    # 3. VERBAL ABILITY (5 questions)
    # =========================================================================
    {
        "category": AptitudeCategory.VERBAL,
        "question": 'Select the word that is most nearly OPPOSITE in meaning to "OBSOLETE":',
        "options": ["Archaic", "Contemporary", "Redundant", "Superfluous"],
        "correct_option": 1,
        "explanation": '"Obsolete" means outdated or no longer in use; "Contemporary" means modern and current.',
        "difficulty": "Easy",
    },
    {
        "category": AptitudeCategory.VERBAL,
        "question": "Identify the sentence with correct grammatical agreement and syntax:",
        "options": [
            "The committee have reached its decision unanimously.",
            "Neither the engineering lead nor the developers was available for comment.",
            "Each of the microservices requires its own independent database schema.",
            "Data from the production telemetry are showing an spike in latency.",
        ],
        "correct_option": 2,
        "explanation": '"Each" takes the singular pronoun "its" and singular verb "requires". In B, the verb should agree with the plural "developers" (were).',
        "difficulty": "Medium",
    },
    {
        "category": AptitudeCategory.VERBAL,
        "question": "Complete the analogy — ALGORITHM : PROGRAM :: BLUEPRINT : ?",
        "options": ["Draftsman", "Building", "Foundation", "Architecture"],
        "correct_option": 1,
        "explanation": "An algorithm is the abstract plan realized in a program, just as a blueprint is the abstract architectural plan realized in a building.",
        "difficulty": "Medium",
    },
    {
        "category": AptitudeCategory.VERBAL,
        "question": 'Choose the most precise term: "The engineering team achieved ________, ensuring that identical inputs consistently yield the exact same system output without side effects."',
        "options": ["Concurrency", "Idempotence", "Redundancy", "Elasticity"],
        "correct_option": 1,
        "explanation": "Idempotence describes an operation where applying it multiple times yields the exact same outcome as a single execution.",
        "difficulty": "Hard",
    },
    {
        "category": AptitudeCategory.VERBAL,
        "question": 'Select the correct meaning of the idiom: "To iron out the bottlenecks":',
        "options": [
            "To speed up CPU clock speed",
            "To resolve hindrances and streamline a workflow",
            "To press garments for an interview",
            "To compress disk storage",
        ],
        "correct_option": 1,
        "explanation": '"To iron out bottlenecks" means to detect and resolve obstacles that restrict throughput.',
        "difficulty": "Easy",
    },

    # =========================================================================
    # 4. ANALYTICAL THINKING (5 questions)
    # =========================================================================
    {
        "category": AptitudeCategory.ANALYTICAL,
        "question": "A system failure occurs only when both Database connection pool is exhausted AND Redis cache misses exceed 80%. If Redis cache miss is 92% but Database pool is only 40% full, does system failure occur?",
        "options": [
            "Yes, because Redis miss rate is critically high",
            "No, because both conditions must be met simultaneously",
            "System enters warning mode only",
            "Cannot be determined without CPU metric",
        ],
        "correct_option": 1,
        "explanation": "Logical AND demands both conditions to be true. Since the DB connection pool is not exhausted, the failure condition is not satisfied.",
        "difficulty": "Medium",
    },
    {
        "category": AptitudeCategory.ANALYTICAL,
        "question": "You observe that web page bounce rates spike whenever average DOMContentLoaded time exceeds 2.4 seconds. If optimizing image payloads reduces load time from 3.1s to 1.8s, what is the most reasonable analytical hypothesis?",
        "options": [
            "Bounce rates will likely decrease because page load drops below the 2.4s threshold",
            "Bounce rates will stay unchanged because image size never affects user retention",
            "Bounce rates will double due to image caching overhead",
            "Server compute cost will increase proportionally to bounce reduction",
        ],
        "correct_option": 0,
        "explanation": "Since the load time moves from above the friction threshold (3.1s > 2.4s) to comfortably below it (1.8s < 2.4s), user drop-off is expected to improve.",
        "difficulty": "Medium",
    },
    {
        "category": AptitudeCategory.ANALYTICAL,
        "question": "A machine learning classifier predicts fraud. Precision is 90% and Recall is 50%. What does this imply about the model predictions?",
        "options": [
            "When the model flags a transaction as fraud, it is almost always correct, but it misses half of all actual fraud cases.",
            "The model flags 90% of all fraud cases correctly, but has 50% false alarms.",
            "The model has an accuracy of 70% across all transactions.",
            "The dataset is perfectly balanced between fraudulent and legitimate events.",
        ],
        "correct_option": 0,
        "explanation": "High precision (90%) means low false positives. Moderate recall (50%) means it detects only 50% of the true positive population.",
        "difficulty": "Hard",
    },
    {
        "category": AptitudeCategory.ANALYTICAL,
        "question": "In an A/B test with 50,000 users per variant, Variant B generates a 3.4% conversion rate versus Variant A 3.1% (p-value = 0.008). Which conclusion is analytically rigorous?",
        "options": [
            "Variant B has a statistically significant improvement at alpha = 0.05 level.",
            "The test was too small to draw any conclusions.",
            "Variant A is superior because p-value is below 0.05.",
            "The observed difference is entirely attributable to random noise.",
        ],
        "correct_option": 0,
        "explanation": "A p-value of 0.008 is well below the standard 0.05 significance threshold, indicating the observed lift is statistically significant.",
        "difficulty": "Medium",
    },
    {
        "category": AptitudeCategory.ANALYTICAL,
        "question": "Given three microservices X, Y, Z: X depends on Y, and Y depends on Z. If Z experiences a 500 error, what is the expected cascading failure pattern in the absence of circuit breakers?",
        "options": [
            "Only Z fails; X and Y remain unaffected",
            "Both Y and X will likely experience timeout or error propagation",
            "X will succeed because it has no direct dependency on Z",
            "The network switch will reset automatically",
        ],
        "correct_option": 1,
        "explanation": "Without isolation or circuit breakers, synchronous dependency failures cascade upstream: Z failing causes Y to block/fail, which causes X to fail.",
        "difficulty": "Easy",
    },

    # =========================================================================
    # 5. PROBLEM SOLVING (5 questions)
    # =========================================================================
    {
        "category": AptitudeCategory.PROBLEM_SOLVING,
        "question": "You need to find a single target value in a sorted array of 1,000,000 elements. What is the maximum number of comparisons required using Binary Search?",
        "options": ["1,000,000", "500,000", "20", "100"],
        "correct_option": 2,
        "explanation": "Binary search operates in O(log2 N). ceil(log2(1,000,000)) = ceil(19.93) = 20 comparisons.",
        "difficulty": "Medium",
    },
    {
        "category": AptitudeCategory.PROBLEM_SOLVING,
        "question": "A web app experiences sudden high latency. The database CPU is at 99%, while app servers are at 15% CPU. What is the most effective immediate troubleshooting step?",
        "options": [
            "Spin up 10 more app server instances",
            "Inspect slow query logs and active transactions to identify unindexed queries or table locks",
            "Restart the frontend build process",
            "Switch CSS frameworks",
        ],
        "correct_option": 1,
        "explanation": "App servers are idle while database CPU is saturated. Inspecting slow queries and table locks addresses the root bottleneck immediately.",
        "difficulty": "Medium",
    },
    {
        "category": AptitudeCategory.PROBLEM_SOLVING,
        "question": "You need to store and look up user session tokens with average time complexity O(1). Which data structure is best suited?",
        "options": [
            "Binary Search Tree",
            "Hash Map / Key-Value Store",
            "Doubly Linked List",
            "Sorted Array",
        ],
        "correct_option": 1,
        "explanation": "A Hash Map or in-memory key-value store (like Redis) provides average O(1) amortized lookup, insertion, and deletion.",
        "difficulty": "Easy",
    },
    {
        "category": AptitudeCategory.PROBLEM_SOLVING,
        "question": "Two threads simultaneously execute `count = count + 1` on a shared variable without synchronization. What is the classic name for this bug and its resolution?",
        "options": [
            "Memory leak; resolve by increasing RAM",
            "Race condition; resolve using mutex locks or atomic operations",
            "Stack overflow; resolve by avoiding recursion",
            "Deadlock; resolve by eliminating threads",
        ],
        "correct_option": 1,
        "explanation": "Simultaneous read-modify-write without synchronization is a race condition. Mutexes, semaphores, or atomic instructions ensure thread safety.",
        "difficulty": "Medium",
    },
    {
        "category": AptitudeCategory.PROBLEM_SOLVING,
        "question": "You are designing an image upload feature. Users frequently upload 25MB RAW images that crash mobile viewers. What architecture resolves this gracefully?",
        "options": [
            "Reject all files larger than 100KB at the form level without user explanation",
            "Upload to object storage, trigger an async background worker to compress and generate multi-resolution WebP variants, and serve via CDN",
            "Store base64 strings directly in the relational database rows",
            "Tell mobile users to only view the site on desktop screens",
        ],
        "correct_option": 1,
        "explanation": "Decoupling storage, async background transformation into modern web formats (WebP/AVIF), and CDN distribution is the cloud-native best practice.",
        "difficulty": "Medium",
    },
]


async def seed_questions(session: AsyncSession):
    print("🌱 Seeding Aptitude Questions catalog...")
    count = 0
    questions_repo = FirestoreRepository(FirestoreCollections.QUESTIONS)

    for idx, q in enumerate(QUESTIONS_DATA):
        stmt = select(AptitudeQuestion).where(AptitudeQuestion.question == q["question"])
        existing = (await session.execute(stmt)).scalar_one_or_none()
        cat_val = q["category"].value if hasattr(q["category"], "value") else str(q["category"])

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
            await session.flush()
            q_id = question.id
            count += 1
        else:
            q_id = existing.id

        # Also mirror to Firestore questions collection
        try:
            questions_repo.set(q_id, {
                "id": q_id,
                "category": cat_val,
                "question": q["question"],
                "options": q["options"],
                "correctOption": q["correct_option"],
                "explanation": q["explanation"],
                "difficulty": q["difficulty"],
                "order": idx + 1,
            })
        except Exception as e:
            # Firestore client might be offline in mock mode
            pass

    await session.commit()
    print(f"✅ Seeded {count} new questions (total catalog: {len(QUESTIONS_DATA)}).")


if __name__ == "__main__":
    async def main():
        async with AsyncSessionLocal() as session:
            await seed_questions(session)
    asyncio.run(main())
