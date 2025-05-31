from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.skill import Skill
from app.models.user import User
from app.schemas.skill import SkillBase, SkillCreate
from app.api.endpoints.auth import get_current_user

router = APIRouter()

@router.get("", response_model=list[SkillBase])
async def get_skills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  # Only require authentication, not specific role
    skip: int = 0,
    limit: int = 100
):
    """Get all skills (accessible to all authenticated users)"""
    skills = db.query(Skill).offset(skip).limit(limit).all()
    return skills

@router.post("/", response_model=SkillBase, status_code=status.HTTP_201_CREATED)
async def create_skill(
    skill: SkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new skill"""
    # Check if user has permission (optional)
    if current_user.role not in ["admin", "project_manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create skills"
        )
    
    # Check if skill already exists
    existing_skill = db.query(Skill).filter(Skill.name == skill.name).first()
    if existing_skill:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Skill with name {skill.name} already exists"
        )
    
    # Create new skill
    new_skill = Skill(name=skill.name)
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    
    return new_skill

@router.get("/{skill_id}", response_model=SkillBase)
async def get_skill(skill_id: int, db: Session = Depends(get_db)):
    """Get a skill by ID"""
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    return skill

@router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a skill by ID"""
    # Check if user has permission (optional)
    if current_user.role not in ["admin", "project_manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete skills"
        )
    
    # Get skill
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    
    # Delete skill
    db.delete(skill)
    db.commit()
    
    return None