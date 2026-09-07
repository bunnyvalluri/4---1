import io
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_resume_upload_and_analysis(client: AsyncClient, auth_headers: dict):
    # Simulated plain text / mock PDF resume content
    resume_content = (
        "SARAH CONNOR\n"
        "Senior Backend Engineer\n\n"
        "EXPERIENCE\n"
        "Acme Systems - Senior Backend Developer (2021-2024)\n"
        "- Architected high-throughput microservices in Python and FastAPI, handling 15,000 requests/sec.\n"
        "- Optimized PostgreSQL queries, cutting database P99 latency by 45%.\n"
        "- Automated Docker deployments and CI/CD pipelines with GitHub Actions.\n\n"
        "EDUCATION\n"
        "B.S. in Computer Science - Tech University (2020)\n\n"
        "SKILLS\n"
        "Python, FastAPI, Docker, PostgreSQL, Redis, Git, Linux, REST APIs\n\n"
        "PROJECTS\n"
        "Real-Time Stream Processor: Distributed streaming pipeline using Python.\n"
    ).encode("utf-8")

    files = {
        "file": ("resume.pdf", resume_content, "application/pdf"),
    }

    res = await client.post(
        "/api/v1/resume/upload",
        files=files,
        headers=auth_headers,
    )
    assert res.status_code == 200, res.text
    data = res.json()
    assert "ats_score" in data
    assert data["ats_score"] > 50.0
    assert "Python" in data["extracted_skills"]
    assert "FastAPI" in data["extracted_skills"]
