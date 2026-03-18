from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import init_db, close_db
from app.routers import auth, clients, scheduling, billing, reports, metrics


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI.
    
    Handles startup and shutdown events.
    """
    # Startup
    print("🚀 Starting HealthApp EMR & RCM System...")
    await init_db()
    print("✓ Database initialized")
    print(f"✓ Application ready on {settings.APP_NAME} v{settings.VERSION}")
    
    yield
    
    # Shutdown
    print("🔴 Shutting down HealthApp...")
    await close_db()
    print("✓ Cleanup complete")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="HIPAA-compliant EMR and Revenue Cycle Management System",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(clients.router)
app.include_router(scheduling.router)
app.include_router(billing.router)
app.include_router(reports.router)
app.include_router(metrics.router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.VERSION,
        "docs": "/api/docs",
        "health": "/api/metrics/health"
    }


@app.get("/api/health")
async def api_health():
    """API health check."""
    return {
        "status": "healthy",
        "service": "HealthApp API",
        "version": settings.VERSION
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
