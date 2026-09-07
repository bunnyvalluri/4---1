import io
import re
from typing import Any, Dict, List, Tuple
from app.core.logging import logger

WEAK_VERBS = [
    "responsible for",
    "helped with",
    "worked on",
    "assisted with",
    "duties included",
    "handled",
    "participated in",
]

STRONG_ACTION_VERBS = [
    "architected",
    "engineered",
    "optimized",
    "spearheaded",
    "implemented",
    "automated",
    "deployed",
    "refactored",
    "scaled",
    "accelerated",
]


class ResumeAnalyzer:
    """
    Parses PDF/DOCX resumes and computes comprehensive ATS score,
    skill extraction, formatting audits, and bullet point optimizations.
    """

    def extract_text_from_pdf(self, file_bytes: bytes) -> str:
        """Extract plain text from PDF using PyMuPDF (fitz)."""
        try:
            import fitz
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            text_parts = [page.get_text() for page in doc]
            return "\n".join(text_parts).strip()
        except Exception as e:
            logger.warning(f"PyMuPDF PDF extraction failed: {e}")
            try:
                return file_bytes.decode("utf-8", errors="ignore").strip()
            except Exception:
                return ""

    def extract_text_from_docx(self, file_bytes: bytes) -> str:
        """Extract plain text from DOCX using python-docx."""
        try:
            import docx
            doc = docx.Document(io.BytesIO(file_bytes))
            text_parts = [p.text for p in doc.paragraphs if p.text]
            return "\n".join(text_parts).strip()
        except Exception as e:
            logger.error(f"python-docx extraction failed: {e}")
            return ""

    def parse_document(self, file_name: str, file_bytes: bytes) -> str:
        """Dispatches file parsing according to file extension."""
        name_lower = file_name.lower()
        if name_lower.endswith(".pdf"):
            return self.extract_text_from_pdf(file_bytes)
        elif name_lower.endswith(".docx") or name_lower.endswith(".doc"):
            return self.extract_text_from_docx(file_bytes)
        else:
            # Attempt plain text decoding
            try:
                return file_bytes.decode("utf-8", errors="ignore")
            except Exception:
                return ""

    def audit_resume(
        self,
        resume_text: str,
        target_skills: List[str] = None,
    ) -> Dict[str, Any]:
        """Audits resume text, calculating ATS score and actionable recommendations."""
        if not resume_text:
            return {
                "ats_score": 0.0,
                "extracted_skills": [],
                "missing_skills": target_skills or [],
                "formatting_issues": ["The uploaded document contained no extractable text."],
                "weak_bullet_points": [],
                "suggested_keywords": target_skills or [],
                "recommendations": ["Re-upload your resume as a text-selectable PDF or DOCX file."],
                "summary": "Document could not be parsed.",
            }

        lines = [line.strip() for line in resume_text.split("\n") if line.strip()]
        lower_text = resume_text.lower()

        # 1. Section Header Check
        standard_sections = ["experience", "education", "skills", "projects"]
        present_sections = [sec for sec in standard_sections if re.search(r"\b" + sec + r"\b", lower_text)]
        formatting_issues = []
        if len(present_sections) < len(standard_sections):
            missing_secs = set(standard_sections) - set(present_sections)
            formatting_issues.append(f"Missing explicit standard section headers: {', '.join(missing_secs).title()}")

        # 2. Measurable Metrics Check (% or numbers or $)
        metric_matches = re.findall(r"(\d+[\%xX]?|\$\d+)", resume_text)
        has_metrics = len(metric_matches) >= 3
        if not has_metrics:
            formatting_issues.append("Few quantifiable metrics detected. Add measurable results (e.g., % improvement, latency reduction, user count).")

        # 3. Weak Bullet Identification
        weak_bullets = []
        for line in lines:
            line_clean = line.strip("-*• ")
            if len(line_clean) < 15:
                continue
            line_lower = line_clean.lower()
            for weak in WEAK_VERBS:
                if line_lower.startswith(weak) or f" {weak} " in line_lower:
                    weak_bullets.append({
                        "original": line_clean,
                        "issue": f"Passive phrasing detected ('{weak}'). Lacks quantified impact.",
                        "suggested": f"Spearheaded the initiative, optimizing efficiency by 30% through engineered automation.",
                    })
                    break
            if len(weak_bullets) >= 4:
                break

        # 4. Extract Skills
        common_catalog = [
            "Python", "JavaScript", "TypeScript", "React.js", "Next.js", "Node.js", "SQL",
            "PostgreSQL", "Docker", "Kubernetes", "AWS", "Git", "REST APIs", "GraphQL",
            "FastAPI", "MongoDB", "Redis", "Machine Learning", "Linux", "CI/CD",
        ]
        extracted_skills = []
        for s in common_catalog:
            pattern = r"\b" + re.escape(s.lower()) + r"\b"
            if re.search(pattern, lower_text):
                extracted_skills.append(s)

        # Missing skills against target
        target = target_skills or ["Python", "SQL", "Docker", "Git", "CI/CD"]
        missing_skills = [ts for ts in target if ts.lower() not in [es.lower() for es in extracted_skills]]

        # ATS Score calculation
        score = 60.0
        score += len(present_sections) * 5.0
        score += min(15.0, len(extracted_skills) * 1.5)
        score += 10.0 if has_metrics else -5.0
        score -= min(15.0, len(weak_bullets) * 3.0)
        score = round(max(25.0, min(96.0, score)), 1)

        recommendations = [
            "Quantify key accomplishments with explicit numbers, percentages, or scale metrics.",
            "Replace passive verbs with high-impact action verbs (Architected, Engineered, Optimized).",
            "Align technical skills section with standard industry keywords for ATS searchability.",
        ]

        summary = (
            f"Resume parsed with {len(lines)} content lines. Identified {len(extracted_skills)} technical skills. "
            f"ATS compatibility is currently {score}%. "
            f"{'Found multiple high-impact metrics.' if has_metrics else 'Needs more quantifiable business outcomes.'}"
        )

        return {
            "ats_score": score,
            "extracted_skills": extracted_skills,
            "missing_skills": missing_skills,
            "formatting_issues": formatting_issues,
            "weak_bullet_points": weak_bullets,
            "suggested_keywords": missing_skills[:6] if missing_skills else ["System Design", "Unit Testing", "Cloud Architecture"],
            "recommendations": recommendations,
            "summary": summary,
        }


resume_analyzer = ResumeAnalyzer()
