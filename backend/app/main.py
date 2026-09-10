from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.core.exceptions import DomainException
from app.db.database import init_db
from app.api.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_logging()
    logger.info(f"Starting {settings.PROJECT_NAME} in {settings.ENVIRONMENT} mode...")
    try:
        await init_db()
        logger.info("Database schemas verified successfully.")
    except Exception as e:
        logger.error(f"Error during database initialization: {e}")
    yield
    # Shutdown
    logger.info(f"Shutting down {settings.PROJECT_NAME}...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="100% Python AI-Powered Career Guidance & Recommendation Engine Backend",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"],
    allow_origin_regex=r"https://.*\.netlify\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def performance_telemetry_middleware(request: Request, call_next):
    import time
    import uuid

    request_id = request.headers.get("X-Request-Id") or str(uuid.uuid4())
    start_time = time.perf_counter()

    # Process request
    response = await call_next(request)

    duration_ms = (time.perf_counter() - start_time) * 1000
    duration_rounded = round(duration_ms, 2)

    # Attach performance telemetry headers
    response.headers["X-Response-Time-Ms"] = str(duration_rounded)
    response.headers["X-Request-Id"] = request_id

    # Structured performance logging (never logs sensitive payload or headers)
    logger.info(
        f"[PERF] request_id={request_id} endpoint={request.url.path} "
        f"method={request.method} status={response.status_code} duration_ms={duration_rounded}"
    )

    return response

# Global Domain Exception Handler
@app.exception_handler(DomainException)
async def domain_exception_handler(request: Request, exc: DomainException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=exc.headers,
    )


# Health check endpoint
@app.get("/health", tags=["Health"])
@app.get(f"{settings.API_V1_STR}/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0",
    }


# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)
