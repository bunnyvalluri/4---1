import asyncio
import json
from typing import AsyncGenerator, Dict, Any, List, Optional
from app.core.config import settings
from app.core.logging import logger
from app.ai.prompts.career_mentor_prompt import build_system_prompt


class CareerAssistant:
    """
    Production-grade AI Career Mentor and Copilot.
    Provides streaming responses, thinking state transitions,
    and structured action cards grounded in genuine user career telemetry.
    """

    async def generate_guidance_stream(
        self,
        messages: List[Dict[str, str]],
        user_context: Dict[str, Any],
        mode: str = "standard",
    ) -> AsyncGenerator[str, None]:
        """
        Streams response chunks with intermediate thinking stage markers,
        token streams, and final structured action payloads.
        """
        last_message = messages[-1]["content"] if messages else ""
        system_prompt = build_system_prompt(user_context, mode=mode)

        # Stage 1: Thinking stages
        yield "data: [THINKING: Understanding your query...]\n\n"
        await asyncio.sleep(0.1)

        yield "data: [THINKING: Reviewing your career telemetry & skill gaps...]\n\n"
        await asyncio.sleep(0.1)

        # Try Gemini streaming if API key is active
        streamed_gemini = False
        if settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                model = genai.GenerativeModel("gemini-1.5-flash")

                conversation_prompt = f"{system_prompt}\n\n"
                for m in messages[:-1]:
                    role = "User" if m.get("role") == "user" else "Assistant"
                    conversation_prompt += f"{role}: <untrusted_input>{m.get('content')}</untrusted_input>\n"
                conversation_prompt += f"User: <untrusted_input>{last_message}</untrusted_input>\nAssistant:"

                yield "data: [THINKING: Generating personalized guidance...]\n\n"

                response = model.generate_content(conversation_prompt, stream=True)
                for chunk in response:
                    if chunk.text:
                        # Format as SSE json packet
                        payload = json.dumps({"token": chunk.text})
                        yield f"data: {payload}\n\n"
                        streamed_gemini = True

            except Exception as e:
                logger.warning(f"CareerAssistant Gemini streaming unavailable: {e}")
                streamed_gemini = False

        # Fallback to authentic domain-grounded intelligence if Gemini was not used or failed
        if not streamed_gemini:
            yield "data: [THINKING: Formulating telemetry-grounded guidance...]\n\n"
            async for chunk in self._stream_domain_response(last_message, user_context, mode):
                payload = json.dumps({"token": chunk})
                yield f"data: {payload}\n\n"

        # Emit structured action payloads derived from telemetry
        actions = self._generate_suggested_actions(last_message, user_context, mode)
        if actions:
            action_payload = json.dumps({"actions": actions, "sources": self._get_sources_list(user_context)})
            yield f"data: {action_payload}\n\n"

        yield "data: [DONE]\n\n"

    async def get_response(
        self,
        messages: List[Dict[str, str]],
        user_context: Dict[str, Any] = None,
        mode: str = "standard",
    ) -> Dict[str, Any]:
        """Non-streaming generation returning complete content and structured metadata."""
        user_context = user_context or {}
        last_message = messages[-1]["content"] if messages else ""
        system_prompt = build_system_prompt(user_context, mode=mode)

        if settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                model = genai.GenerativeModel("gemini-1.5-flash")
                prompt = f"{system_prompt}\nUser Question: <untrusted_input>{last_message}</untrusted_input>\nAssistant:"
                response = model.generate_content(prompt)
                if response and response.text:
                    content = response.text.strip()
                    return {
                        "content": content,
                        "actions": self._generate_suggested_actions(last_message, user_context, mode),
                        "sources": self._get_sources_list(user_context),
                    }
            except Exception as e:
                logger.warning(f"CareerAssistant Gemini non-streaming call failed: {e}")

        # Grounded domain generator
        content = await self._generate_domain_text(last_message, user_context, mode)
        return {
            "content": content,
            "actions": self._generate_suggested_actions(last_message, user_context, mode),
            "sources": self._get_sources_list(user_context),
        }

    async def _stream_domain_response(
        self,
        query: str,
        ctx: Dict[str, Any],
        mode: str,
    ) -> AsyncGenerator[str, None]:
        text = await self._generate_domain_text(query, ctx, mode)
        words = text.split(" ")
        for i in range(0, len(words), 3):
            chunk = " ".join(words[i : i + 3]) + " "
            yield chunk
            await asyncio.sleep(0.02)

    async def _generate_domain_text(self, query: str, ctx: Dict[str, Any], mode: str) -> str:
        q = query.lower()
        user_name = ctx.get("user_name", "Engineer")
        target_career = ctx.get("target_career") or "your targeted engineering pathway"
        match_score = ctx.get("career_match_score")
        gaps = ctx.get("top_skill_gaps", [])
        top_gap_name = gaps[0]["name"] if gaps else None
        roadmap = ctx.get("roadmap")
        active_project = ctx.get("active_project")
        ats_score = ctx.get("resume_ats_score")

        if mode == "interview" or "interview" in q:
            return (
                f"### Practice Interview Session: {target_career}\n\n"
                f"**Question:** In high-throughput distributed systems, how do you handle backpressure and guarantee idempotency during intermittent worker failovers?\n\n"
                f"**Key Evaluation Criteria:**\n"
                f"1. **Idempotency Strategy**: Unique transaction tokens or distributed locks.\n"
                f"2. **Backpressure**: Reactive streams, queue throttling, or circuit breakers.\n"
                f"3. **Trade-offs**: Latency overhead vs. exactly-once processing guarantees.\n\n"
                f"*Type your answer below, and I will evaluate your architecture reasoning, technical depth, and communication structure.*"
            )

        elif mode == "learning" or "teach" in q or "learn" in q or "concept" in q:
            subject = top_gap_name or "Distributed Systems Architecture"
            return (
                f"### Deep Dive: {subject}\n\n"
                f"**1. Core Architectural Purpose**\n"
                f"{subject} solves system scaling and reliability bottlenecks by decoupling compute layers and enforcing predictable contracts.\n\n"
                f"**2. Production Architecture Pattern**\n"
                f"- **Producer / Consumer Isolation**: Prevents service cascade failure under traffic spikes.\n"
                f"- **Dead Letter Queuing**: Isolates malformed payloads without blocking downstream consumers.\n\n"
                f"**3. Practical Code Implementation**\n"
                f"```python\n"
                f"async def process_event(event_id: str, payload: dict):\n"
                f"    async with transaction() as tx:\n"
                f"        if await is_already_processed(event_id):\n"
                f"            return  # Idempotent skip\n"
                f"        await commit_state(tx, event_id, payload)\n"
                f"```\n\n"
                f"**4. Practice Exercise**: Wire this pattern into your active portfolio project to resolve your verified **{subject}** skill gap."
            )

        elif mode == "quiz" or "quiz" in q:
            topic = top_gap_name or "System Design"
            return (
                f"### Quick Diagnostic Quiz: {topic}\n\n"
                f"**Q1:** When designing an idempotent RESTful endpoint for asynchronous resource creation, which HTTP header is best practice to reject duplicate requests?\n"
                f"- **A)** `X-Forwarded-For`\n"
                f"- **B)** `Idempotency-Key`\n"
                f"- **C)** `Cache-Control`\n"
                f"- **D)** `Content-Disposition`\n\n"
                f"*Reply with your choice (A, B, C, or D) to see the architectural breakdown.*"
            )

        elif mode == "project" or "project" in q:
            if active_project:
                p_title = active_project.get("title", "Project")
                p_milestone = active_project.get("currentMilestone", "Implementation")
                return (
                    f"### Project Mentorship: {p_title}\n\n"
                    f"Your active milestone is **{p_milestone}**.\n\n"
                    f"**Recommended Engineering Checklist:**\n"
                    f"- Implement schema validation on all ingress boundaries.\n"
                    f"- Write integration tests with isolated mock fixtures.\n"
                    f"- Record timing metrics to verify latency boundaries under load.\n\n"
                    f"What specific obstacle or design trade-off are you evaluating for this milestone?"
                )
            else:
                return (
                    f"### Recommended Capstone Project\n\n"
                    f"Based on your target role (**{target_career}**), you do not currently have an active capstone project in progress.\n\n"
                    f"Starting a production-grade project is the highest-leverage way to close your critical skill gaps"
                    + (f" (especially **{top_gap_name}**)." if top_gap_name else ".")
                    + f"\n\nWould you like me to guide you to the Projects catalog to activate a recommended build?"
                )

        elif mode == "resume" or "resume" in q or "ats" in q or "cv" in q:
            ats_str = f"**{ats_score}/100**" if ats_score is not None else "not yet calculated"
            return (
                f"### Resume Optimization Strategy\n\n"
                f"Your latest ATS benchmark is {ats_str} for **{target_career}**.\n\n"
                f"**Targeted Enhancements:**\n"
                f"1. **Google XYZ Formula**: Reframe bullet points to: *Accomplished [X], measured by [Y], by doing [Z]*.\n"
                + (f"2. **Critical Keyword Alignment**: Inject explicit evidence of **{top_gap_name}** in your experience bullets.\n" if top_gap_name else "2. **Keyword Density**: Ensure verified skills are present in project descriptions.\n")
                + f"3. **Metrics & Impact**: Quantify latency reductions, throughput gains, or reliability improvements.\n\n"
                f"You can review your detailed scan report in the Resume ATS scanner."
            )

        elif "next" in q or "what should i do" in q or "roadmap" in q or "priority" in q:
            next_step = None
            why_text = ""
            if roadmap and roadmap.get("nextMilestone"):
                next_step = f"Complete roadmap milestone: **{roadmap.get('nextMilestone')}**"
                why_text = f"It is your next pending milestone in {roadmap.get('title')} ({roadmap.get('progressPercent', 0)}% completed)."
            elif top_gap_name:
                next_step = f"Address skill gap: **{top_gap_name}**"
                why_text = f"It represents a primary gap between your current profile and the requirements for {target_career}."
            else:
                next_step = "Take the Technical Skill Assessment"
                why_text = "Completing the diagnostic assessment will generate precision skill gap telemetry and activate your custom roadmap."

            return (
                f"### Strategic Next Priority for {user_name}\n\n"
                f"**RECOMMENDED ACTION:**\n"
                f"{next_step}\n\n"
                f"**WHY:**\n"
                f"{why_text}\n\n"
                f"**CURRENT TELEMETRY SUMMARY:**\n"
                f"- **Target Pathway**: {target_career}" + (f" ({match_score}% Match)" if match_score else "") + "\n"
                + (f"- **Top Priority Skill Gap**: {top_gap_name}\n" if top_gap_name else "")
                + (f"- **Roadmap Status**: {roadmap.get('progressPercent', 0)}% complete\n" if roadmap else "")
                + (f"- **Active Project**: {active_project.get('title')}\n" if active_project else "")
            )

        else:
            return (
                f"### Aura Career Guidance: {target_career}\n\n"
                f"I am tracking your career trajectory against verified benchmarks for **{target_career}**.\n\n"
                f"Here are high-impact areas we can work on today:\n"
                + (f"- **Skill Mastery**: Close your **{top_gap_name}** skill gap.\n" if top_gap_name else "- **Skill Verification**: Add or verify your technical proficiencies.\n")
                + (f"- **Roadmap Execution**: Advance through **{roadmap.get('title')}**.\n" if roadmap else "- **Roadmap Generation**: Build a personalized 6-month curriculum.\n")
                + (f"- **Project Engineering**: Make progress on **{active_project.get('title')}**.\n" if active_project else "- **Portfolio Projects**: Start an industry-standard capstone.\n")
                + (f"- **Resume Optimization**: Improve your current **{ats_score} ATS score**.\n" if ats_score else "- **Resume Diagnostic**: Scan your resume against target roles.\n\n")
                + f"What would you like to focus on next?"
            )

    def _generate_suggested_actions(
        self,
        query: str,
        ctx: Dict[str, Any],
        mode: str,
    ) -> List[Dict[str, Any]]:
        actions = []
        q = query.lower()
        gaps = ctx.get("top_skill_gaps", [])
        roadmap = ctx.get("roadmap")
        active_project = ctx.get("active_project")
        ats_score = ctx.get("resume_ats_score")

        if "roadmap" in q or "milestone" in q or "next" in q:
            actions.append({
                "action_type": "OPEN_ROADMAP",
                "title": "Open Active Roadmap",
                "description": f"Progress: {roadmap.get('progressPercent', 0)}%" if roadmap else "View learning plan",
                "route": "/roadmap",
                "requires_confirmation": False,
            })

        if "skill" in q or "gap" in q or "learn" in q or gaps:
            top_gap = gaps[0]["name"] if gaps else "Skill Matrix"
            actions.append({
                "action_type": "OPEN_SKILLS",
                "title": f"Review {top_gap} Gap",
                "description": "Examine verified skills and required proficiencies",
                "route": "/skills",
                "requires_confirmation": False,
            })

        if "project" in q or active_project:
            actions.append({
                "action_type": "OPEN_PROJECT",
                "title": active_project.get("title", "Portfolio Projects") if active_project else "Browse Recommended Projects",
                "description": "Work on applied milestone code",
                "route": "/projects",
                "requires_confirmation": False,
            })

        if "resume" in q or "ats" in q or ats_score is not None:
            actions.append({
                "action_type": "OPEN_RESUME",
                "title": "Open Resume ATS Scanner",
                "description": f"Current Score: {ats_score}/100" if ats_score else "Scan and evaluate your resume",
                "route": "/resume",
                "requires_confirmation": False,
            })

        return actions[:3]

    def _get_sources_list(self, ctx: Dict[str, Any]) -> List[str]:
        sources = ["Career Profile"]
        if ctx.get("top_skill_gaps") or ctx.get("top_skills"):
            sources.append("Skill Matrix")
        if ctx.get("roadmap"):
            sources.append("Active Roadmap")
        if ctx.get("active_project"):
            sources.append("Capstone Projects")
        if ctx.get("resume_ats_score"):
            sources.append("Resume ATS Analysis")
        return sources


career_assistant = CareerAssistant()
