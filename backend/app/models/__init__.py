# filepath: backend/app/models/__init__.py
from app.db.session import Base
from app.models.user import User, user_skills
from app.models.skill import Skill
from app.models.project import Project, ProjectSkillRequirement
from app.models.resource_allocation import ResourceAllocation

# For Alembic to detect models
