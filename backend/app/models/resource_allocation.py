from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User


router = APIRouter()

class ResourceAllocation(Base):
    __tablename__ = "resource_allocations"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))
    start_date = Column(Date)
    end_date = Column(Date)
    hours_allocated = Column(Float)  # Hours per week
    allocation_percentage = Column(Float)  # Percentage of time
    status = Column(String)  # 'proposed', 'confirmed', 'completed'
    is_ai_recommended = Column(Boolean, default=False)  # Was this allocation recommended by AI
    confidence_score = Column(Float, nullable=True)  # AI confidence score if recommended
    
    # Relationships
    employee = relationship("User", back_populates="allocations")
    project = relationship("Project", back_populates="resource_allocations")

