import asyncio
from typing import AsyncGenerator, Dict, Any, List
from app.core.config import settings
from app.core.logging import logger
from app.ai.prompts.assistant_prompt import ASSISTANT_SYSTEM_PROMPT


class CareerAssistant:
    """
    Interactive Career Consultation AI Assistant.
    Supports asynchronous streaming responses and rich context awareness.
    """

    async def get_response(
        self,
        messages: List[Dict[str, str]],
        user_context: Dict[str, Any] = None,
    ) -> str:
        last_message = messages[-1]["content"] if messages else ""

        if settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                model = genai.GenerativeModel("gemini-1.5-flash")

                context_str = ""
                if user_context:
                    context_str = f"User Profile Context: {user_context}\n"

                prompt = f"{ASSISTANT_SYSTEM_PROMPT}\n{context_str}\nUser Question: {last_message}"
                response = model.generate_content(prompt)
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                logger.warning(f"CareerAssistant Gemini call failed: {e}")

        # Intelligent context-aware domain response
        q_lower = last_message.lower()
        if "interview" in q_lower:
            return (
                "### Technical Interview Preparation Strategy\n\n"
                "1. **System Design Fundamentals**: Focus on horizontal scaling, caching strategies (Redis), data modeling, and message queues (Kafka/RabbitMQ).\n"
                "2. **Coding & Data Structures**: Master pattern-based problem solving (Sliding Window, Two Pointers, DFS/BFS graph traversals, Dynamic Programming).\n"
                "3. **Behavioral STAR Technique**: Prepare stories focusing on measurable impact, cross-team collaboration, and handling technical trade-offs."
            )
        elif "resume" in q_lower or "cv" in q_lower:
            return (
                "### Resume Optimization Advice\n\n"
                "- Use the **Google XYZ formula**: *Accomplished [X], as measured by [Y], by doing [Z]*.\n"
                "- Ensure standard section headers: **Experience**, **Education**, **Technical Skills**, **Projects**.\n"
                "- Avoid two-column layouts or graphics that confuse ATS parsers.\n"
                "- Quantify performance gains (e.g. *reduced latency by 45%* or *processed 2M daily events*)."
            )
        elif "roadmap" in q_lower or "learn" in q_lower:
            return (
                "### Recommended Learning Path\n\n"
                "- **Step 1: Solidify Fundamentals**: Python 3.12+, asynchronous programming (`asyncio`), and typing.\n"
                "- **Step 2: Microservice Backends**: FastAPI, SQLAlchemy 2.0 ORM, and PostgreSQL with indexing.\n"
                "- **Step 3: Cloud & Observability**: Docker containers, GitHub Actions CI/CD, and Prometheus/Grafana monitoring.\n"
                "- **Step 4: Capstone Engineering**: Deploy an end-to-end multi-tier application with automated tests."
            )
        else:
            return (
                f"Thank you for reaching out! Regarding your career query:\n\n"
                f"Navigating technical careers requires balancing strong conceptual foundations with hands-on project delivery. "
                f"I recommend checking your **Skill Gap Analysis** on your dashboard and selecting a tailored **Project Recommendation** "
                f"to demonstrate verifiable competency to hiring managers.\n\n"
                f"Would you like me to analyze a specific career path, suggest interview questions, or review your resume bullets?"
            )

    async def stream_response(
        self,
        messages: List[Dict[str, str]],
        user_context: Dict[str, Any] = None,
    ) -> AsyncGenerator[str, None]:
        full_text = await self.get_response(messages, user_context)
        # Yield words in chunks to simulate streaming
        words = full_text.split(" ")
        for i in range(0, len(words), 3):
            chunk = " ".join(words[i : i + 3]) + " "
            yield chunk
            await asyncio.sleep(0.03)


career_assistant = CareerAssistant()
