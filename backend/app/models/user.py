from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, Float, Table, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

# Association table for user-skill many-to-many relationship
user_skills = Table(
    'user_skills',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('skill_id', Integer, ForeignKey('skills.id'), primary_key=True),
    Column('proficiency_level', Float, default=1.0),  # 0-5 rating scale
    extend_existing=True  # Allow redefinition if the table already exists
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    role = Column(String, default="employee")
    department = Column(String, nullable=True)
    position = Column(String, nullable=True)
    
    # Relationships
    skills = relationship("Skill", secondary=user_skills, back_populates="users")
    allocations = relationship("ResourceAllocation", back_populates="employee")
    
    # Performance metrics (could be expanded)
    average_performance = Column(Float, default=0.0)  # 0-5 rating
    availability_percentage = Column(Float, default=100.0)  # Default to 100.0
    
    extend_existing=True  # Allow redefinition if the table already exists