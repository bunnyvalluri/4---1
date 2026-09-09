import asyncio
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from app.core.logging import logger

class JobStatus:
    QUEUED = "QUEUED"
    PROCESSING = "PROCESSING"
    ANALYZING = "ANALYZING"
    ALMOST_COMPLETE = "ALMOST_COMPLETE"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class JobRecord:
    def __init__(self, job_id: str, user_id: str, job_type: str):
        self.job_id = job_id
        self.user_id = user_id
        self.job_type = job_type
        self.status = JobStatus.QUEUED
        self.progress = 5
        self.step_message = "Job queued for processing"
        self.result: Optional[Dict[str, Any]] = None
        self.error: Optional[str] = None
        self.created_at = datetime.now(timezone.utc).isoformat()
        self.updated_at = datetime.now(timezone.utc).isoformat()

    def update(
        self,
        status: str,
        progress: int,
        step_message: str,
        result: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None,
    ):
        self.status = status
        self.progress = progress
        self.step_message = step_message
        if result is not None:
            self.result = result
        if error is not None:
            self.error = error
        self.updated_at = datetime.now(timezone.utc).isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "job_id": self.job_id,
            "user_id": self.user_id,
            "job_type": self.job_type,
            "status": self.status,
            "progress": self.progress,
            "step_message": self.step_message,
            "result": self.result,
            "error": self.error,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }


class JobManager:
    """Thread-safe background job state store."""
    _instance: Optional["JobManager"] = None
    _jobs: Dict[str, JobRecord] = {}

    def __new__(cls) -> "JobManager":
        if cls._instance is None:
            cls._instance = super(JobManager, cls).__new__(cls)
            cls._jobs = {}
        return cls._instance

    def create_job(self, job_id: str, user_id: str, job_type: str) -> JobRecord:
        job = JobRecord(job_id=job_id, user_id=user_id, job_type=job_type)
        self._jobs[job_id] = job
        logger.info(f"[JobManager] Created job {job_id} of type {job_type} for user {user_id}")
        return job

    def get_job(self, job_id: str) -> Optional[JobRecord]:
        return self._jobs.get(job_id)

    def update_job(
        self,
        job_id: str,
        status: str,
        progress: int,
        step_message: str,
        result: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None,
    ) -> Optional[JobRecord]:
        job = self._jobs.get(job_id)
        if job:
            job.update(status, progress, step_message, result, error)
            logger.info(f"[JobManager] Job {job_id} -> {status} ({progress}%): {step_message}")
        return job


job_manager = JobManager()
