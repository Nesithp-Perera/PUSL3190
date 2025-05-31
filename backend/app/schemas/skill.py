from pydantic import BaseModel

class SkillBase(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True  # Use this for Pydantic v2

class SkillCreate(BaseModel):
    name: str