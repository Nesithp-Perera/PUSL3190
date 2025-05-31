from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Table, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    start_date = Column(Date)
    end_date = Column(Date)
    status = Column(String)  # 'planning', 'active', 'completed', 'on-hold'
    priority = Column(Integer, default=3)  # 1-5 priority scale
    
    # Project manager reference
    manager_id = Column(Integer, ForeignKey("users.id"))
    manager = relationship("User", foreign_keys=[manager_id])
    
    # Relationships
    skill_requirements = relationship("ProjectSkillRequirement", back_populates="project")
    resource_allocations = relationship("ResourceAllocation", back_populates="project")

class ProjectSkillRequirement(Base):
    __tablename__ = "project_skill_requirements"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    skill_id = Column(Integer, ForeignKey("skills.id"))  # Add ForeignKey to skills table
    employees_requested = Column(Integer, nullable=False)  # Number of employees needed
    
    # Relationships
    project = relationship("Project", back_populates="skill_requirements")
    skill = relationship("Skill", back_populates="project_requirements")  # Fix relationship

