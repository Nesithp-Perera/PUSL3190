from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.user import user_skills
from pydantic import BaseModel

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    category = Column(String, nullable=True)  # Technical, Soft skill, etc.
    description = Column(String, nullable=True)
    
    # Relationships
    users = relationship("User", secondary=user_skills, back_populates="skills")
    project_requirements = relationship("ProjectSkillRequirement", back_populates="skill")  # Fix relationship

class SkillBase(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

class SkillCreate(BaseModel):
    name: str
