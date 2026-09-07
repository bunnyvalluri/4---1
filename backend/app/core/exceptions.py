from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class DomainException(HTTPException):
    """Base exception class for domain errors."""

    def __init__(
        self,
        status_code: int,
        detail: str,
        headers: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)


class EntityNotFoundError(DomainException):
    def __init__(self, entity_name: str, identifier: Any):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{entity_name} with id/identifier '{identifier}' was not found.",
        )


class AuthenticationError(DomainException):
    def __init__(self, detail: str = "Invalid authentication credentials."):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class PermissionDeniedError(DomainException):
    def __init__(self, detail: str = "Not enough permissions to perform this operation."):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
        )


class ConflictError(DomainException):
    def __init__(self, detail: str = "A resource conflict occurred."):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
        )


class AIProcessingError(DomainException):
    def __init__(self, detail: str = "An error occurred during AI processing."):
        super().__init__(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=detail,
        )


class ValidationError(DomainException):
    def __init__(self, detail: str = "Validation failed for the requested operation."):
        super().__init__(
            status_code=422,
            detail=detail,
        )


