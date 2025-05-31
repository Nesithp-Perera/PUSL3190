from pydantic import BaseModel, EmailStr
from typing import Optional, List

class UserBase(BaseModel):
    email: EmailStr
    full_name: str


class UserCreate(UserBase):
    password: str
    role: Optional[str] = None


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    role: Optional[str] = None
    average_performance: Optional[float] = None
    availability_percentage: Optional[float] = None
    skills: Optional[List[str]] = None


class SkillInUser(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class UserWithSkills(UserBase):
    id: int
    skills: List[SkillInUser] = []
    average_performance: Optional[float] = None
    availability_percentage: Optional[float] = 100

    class Config:
        from_attributes = True
