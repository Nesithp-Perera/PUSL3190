from fastapi import APIRouter
from app.api.endpoints import auth, projects, ml, skills  # Import skills router

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(ml.router, prefix="/ml", tags=["machine-learning"])
api_router.include_router(skills.router, prefix="/skills", tags=["skills"])  # Add skills router

