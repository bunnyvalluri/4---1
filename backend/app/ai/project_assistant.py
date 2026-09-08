"""
Grounded AI Project Mentor & Technical Assistant.
Advises candidates on current milestone execution, architecture design,
unblocking dependencies, and portfolio readiness.
Strictly grounded in persisted database project telemetry.
"""
from typing import Any, Dict, List, Optional
from app.core.config import settings
from app.core.logging import logger


class ProjectAssistant:
    """
    Project guidance assistant providing factual, grounded architectural
    and implementation guidance without hallucinations.
    """

    async def get_guidance(
        self,
        project_title: str,
        difficulty: str,
        current_milestone_title: Optional[str],
        current_milestone_desc: Optional[str],
        uncompleted_milestones: List[str],
        completed_milestones: List[str],
        skills: List[str],
        tech_stack: List[str],
        deliverables: Dict[str, bool],
        blocker_reason: Optional[str],
        user_message: str,
    ) -> Dict[str, Any]:
        """
        Synthesizes grounded advice based on active project state.
        """
        # Formulate grounded prompt context
        missing_deliverables = [k for k, v in deliverables.items() if not v]
        context_summary = (
            f"Project: {project_title} ({difficulty})\n"
            f"Current Active Milestone: {current_milestone_title or 'All milestones cleared'}\n"
            f"Milestone Details: {current_milestone_desc or 'N/A'}\n"
            f"Pending Milestones: {', '.join(uncompleted_milestones[:3]) if uncompleted_milestones else 'None'}\n"
            f"Completed Milestones: {', '.join(completed_milestones) if completed_milestones else 'None'}\n"
            f"Tech Stack: {', '.join(tech_stack)}\n"
            f"Missing Deliverables: {', '.join(missing_deliverables)}\n"
            f"Current Blocker: {blocker_reason or 'None'}\n"
        )

        suggested_action = (
            f"Implement and test: {current_milestone_title}"
            if current_milestone_title
            else "Publish your deployment and finalize your README showcase."
        )

        # 1. Attempt Gemini 1.5 Flash if API Key available
        if settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                model = genai.GenerativeModel("gemini-1.5-flash")

                system_prompt = (
                    "You are a Senior Principal Staff Engineer and Project Mentor. "
                    "Provide concise, actionable, high-signal technical instructions for the candidate's active project. "
                    "CRITICAL SAFETY RULES: Never invent fake commits, false completions, fake credentials, or fictitious deployments. "
                    "Focus on the immediate active milestone, clean code practices, testing, and portfolio readiness. "
                    "Always suggest concrete technical steps (libraries, file structure, test commands)."
                )

                full_prompt = f"{system_prompt}\n\n{context_summary}\n\nCandidate Question: {user_message}"
                response = model.generate_content(full_prompt)
                if response and response.text:
                    return {
                        "response": response.text.strip(),
                        "suggested_action": suggested_action,
                        "current_milestone": current_milestone_title,
                    }
            except Exception as e:
                logger.warning(f"ProjectAssistant Gemini call failed, using rule-based mentor: {e}")

        # 2. High-signal domain-grounded fallback responses
        q_lower = user_message.lower()
        if blocker_reason:
            reply = (
                f"### Blocker Remediation Strategy\n\n"
                f"Your project is currently marked as blocked: **{blocker_reason}**.\n\n"
                f"**Action Steps to Unblock:**\n"
                f"1. **Check Prerequisites**: Ensure preceding dependency milestones are marked completed in order.\n"
                f"2. **Verify Environment**: Verify your local dependencies in `requirements.txt` or `pyproject.toml`.\n"
                f"3. **Clear Blocker**: Once verified, click **Resolve Blocker** in your workspace toolbar to resume progress."
            )
        elif "next" in q_lower or "what should i do" in q_lower or "start" in q_lower:
            if current_milestone_title:
                reply = (
                    f"### Next Action for {project_title}\n\n"
                    f"Your active milestone is **{current_milestone_title}**.\n\n"
                    f"**Recommended Execution Steps:**\n"
                    f"1. **Scope & Design**: {current_milestone_desc or 'Break down the requirements into minimal testable units.'}\n"
                    f"2. **Tech Stack Focus**: Utilize **{', '.join(tech_stack[:3])}** for this component.\n"
                    f"3. **Verification**: Write unit tests before marking this milestone complete.\n"
                    f"4. **Deliverable Tie-in**: Remember that completing this milestone unlocks downstream progress and updates your portfolio readiness score."
                )
            else:
                reply = (
                    f"### Portfolio Finalization\n\n"
                    f"All core development milestones are complete! Focus now on your portfolio checklist:\n"
                    f"- Missing items: **{', '.join(missing_deliverables) if missing_deliverables else 'None'}**.\n"
                    f"- Ensure your GitHub repository is connected with a clear README and architecture diagram."
                )
        elif "architecture" in q_lower or "design" in q_lower:
            reply = (
                f"### System Architecture Guidance for {project_title}\n\n"
                f"- **Separation of Concerns**: Keep API routes lean; delegate business logic to dedicated services and models.\n"
                f"- **Data Flow**: Ensure type-safe schemas and validated request payloads.\n"
                f"- **Observability**: Add structured JSON logging and health check endpoints.\n"
                f"- **Containerization**: Include a multi-stage `Dockerfile` and `docker-compose.yml` for local reproducibility."
            )
        elif "test" in q_lower or "coverage" in q_lower:
            reply = (
                f"### Testing & Quality Strategy\n\n"
                f"For {project_title}, recruiters look for disciplined automated testing:\n"
                f"1. **Unit Tests**: Test core domain algorithms in isolation.\n"
                f"2. **Integration Tests**: Test API routes with simulated database sessions.\n"
                f"3. **CI Pipeline**: Add a GitHub Actions workflow (`.github/workflows/test.yml`) that runs tests on every push."
            )
        else:
            milestone_str = f"milestone **{current_milestone_title}**" if current_milestone_title else "portfolio deliverables"
            reply = (
                f"### Project Mentor Guidance\n\n"
                f"You are building **{project_title}** ({difficulty} tier).\n\n"
                f"To maintain steady momentum, prioritize your current {milestone_str}. "
                f"Completing this milestone directly produces verified evidence for your **{', '.join(skills[:3])}** skills.\n\n"
                f"Would you like advice on testing this component, architecture diagrams, or configuring CI/CD?"
            )

        return {
            "response": reply,
            "suggested_action": suggested_action,
            "current_milestone": current_milestone_title,
        }


project_assistant = ProjectAssistant()
