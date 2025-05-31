from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class AllocationBase(BaseModel):
    employee_id: int
    project_id: int
    start_date: date
    end_date: date
    hours_allocated: float
    allocation_percentage: float
    status: str = 'proposed'

class AllocationCreate(AllocationBase):
    pass

class AllocationUpdate(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    hours_allocated: Optional[float] = None
    allocation_percentage: Optional[float] = None
    status: Optional[str] = None

class AllocationResponse(AllocationBase):
    id: int
    is_ai_recommended: bool
    confidence_score: Optional[float] = None
    
    class Config:
        from_attributes = True

class AllocationRecommendation(BaseModel):
    project_id: int
    skill_requirements: List[int]
    start_date: date
    end_date: date
    hours_needed: float
