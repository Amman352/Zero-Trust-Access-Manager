from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from sqlalchemy import text

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.mfa import router as mfa_router
from app.api.v1.sessions import router as sessions_router

app = FastAPI(
    title=settings.APP_NAME,
    description="Enterprise-grade Zero Trust Authentication System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Instrumentator().instrument(app).expose(app)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(mfa_router, prefix="/api/v1")
app.include_router(sessions_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
async def health_check():
    db_status = "unreachable"
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
            db_status = "healthy"
    except Exception:
        pass
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "database": db_status,
        "version": "1.0.0",
    }


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Zero Trust Access Manager API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }
