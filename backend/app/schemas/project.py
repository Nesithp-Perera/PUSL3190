from pydantic import BaseModel
from typing import List, Optional
from datetime import date


class SkillRequirement(BaseModel):
    skill_id: int
    employees_requested: int

class SkillRequirementResponse(BaseModel):
    skill_id: int
    employees_requested: int

    class Config:
        from_attributes = True  # Updated from orm_mode for Pydantic v2

class ResourceAllocationResponse(BaseModel):
    id: int
    employee_id: int
    project_id: int
    allocation_percentage: float
    status: str

    class Config:
        from_attributes = True  # Updated from orm_mode for Pydantic v2

class ProjectBase(BaseModel):
    name: str
    description: str
    start_date: date
    end_date: date
    priority: int = 3
    status: str = 'planning'

class ProjectCreate(BaseModel):
    name: str
    description: str
    start_date: str
    end_date: str
    status: str
    priority: int
    manager_id: int
    skill_requirements: List[SkillRequirement]  # List of skill requirements

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    priority: Optional[int] = None
    status: Optional[str] = None
    manager_id: Optional[int] = None

class ProjectResponse(ProjectBase):
    id: int
    manager_id: int
    skill_requirements: List[SkillRequirementResponse] = []  # Include skill requirements
    resource_allocations: List[ResourceAllocationResponse] = []  # Set default empty list
    
    class Config:
        from_attributes = True  # Updated from orm_mode
