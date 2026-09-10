import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_full_resume_upload_and_async_job_pipeline(client: AsyncClient, auth_headers: dict):
    resume_content = (
        "RAHUL SHARMA\n"
        "Senior Full-Stack Engineer\n\n"
        "EXPERIENCE\n"
        "Tech Systems - Senior Engineer (2022-2025)\n"
        "- Engineered microservices using Python, FastAPI, and PostgreSQL.\n"
        "- Implemented CI/CD pipelines with GitHub Actions and Docker.\n\n"
        "EDUCATION\n"
        "B.S. in Computer Science - University (2022)\n\n"
        "SKILLS\n"
        "Python, FastAPI, TypeScript, React, Docker, PostgreSQL, Redis, REST APIs, Git\n"
    ).encode("utf-8")

    files = {
        "file": ("Rahul_resume.pdf", resume_content, "application/pdf"),
    }

    # 1. Test POST /api/v1/resumes/upload
    res_upload = await client.post(
        "/api/v1/resumes/upload",
        files=files,
        headers=auth_headers,
    )
    assert res_upload.status_code == 200, res_upload.text
    upload_data = res_upload.json()
    assert "resume_id" in upload_data
    resume_id = upload_data["resume_id"]
    assert upload_data["status"] == "uploaded"

    # 2. Test POST /api/v1/resumes/{resume_id}/analyze
    res_analyze = await client.post(
        f"/api/v1/resumes/{resume_id}/analyze",
        headers=auth_headers,
    )
    assert res_analyze.status_code == 200, res_analyze.text
    analyze_data = res_analyze.json()
    assert "job_id" in analyze_data
    assert analyze_data["resume_id"] == resume_id
    assert analyze_data["status"] == "QUEUED"
    job_id = analyze_data["job_id"]

    # 3. Test GET /api/v1/resumes/jobs/{job_id}
    res_job = await client.get(
        f"/api/v1/resumes/jobs/{job_id}",
        headers=auth_headers,
    )
    assert res_job.status_code == 200, res_job.text
    job_data = res_job.json()
    assert job_data["job_id"] == job_id
    assert "status" in job_data
