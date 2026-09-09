import os
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Tuple
from jinja2 import Environment, FileSystemLoader, select_autoescape
from app.core.config import settings

TEMPLATES_DIR = Path(__file__).resolve().parent / "templates"

_jinja_env: Environment = Environment(
    loader=FileSystemLoader(str(TEMPLATES_DIR)),
    autoescape=select_autoescape(["html", "xml"]),
)


def html_to_plain_text(html: str) -> str:
    """Converts HTML to clean, readable plain-text fallback for email."""
    # Replace breaks and paragraphs with newlines
    text = re.sub(r"<(br|p|div|tr)[^>]*>", "\n", html, flags=re.IGNORECASE)
    text = re.sub(r"&bull;?", "•", text)
    text = re.sub(r"&rarr;?", "->", text)
    text = re.sub(r"&nbsp;", " ", text)
    # Strip remaining HTML tags
    text = re.sub(r"<[^>]+>", "", text)
    # Consolidate duplicate empty lines
    lines = [line.strip() for line in text.split("\n")]
    result = []
    prev_empty = False
    for line in lines:
        if not line:
            if not prev_empty:
                result.append("")
                prev_empty = True
        else:
            result.append(line)
            prev_empty = False
    return "\n".join(result).strip()


class TemplateRenderer:
    """Renders HTML email templates with Jinja2 and generates plain-text fallbacks."""

    def __init__(self, env: Environment = _jinja_env):
        self.env = env

    def render(self, template_name: str, context: Dict[str, Any]) -> Tuple[str, str]:
        """
        Renders template into (html_content, text_content).
        Automatically injects common system variables like app_url and current_year.
        """
        full_context = dict(context)
        full_context.setdefault("app_url", settings.APP_BASE_URL.rstrip("/"))
        full_context.setdefault("current_year", str(datetime.now(timezone.utc).year))

        template = self.env.get_template(template_name)
        html_content = template.render(**full_context)
        text_content = html_to_plain_text(html_content)

        return html_content, text_content


template_renderer = TemplateRenderer()
