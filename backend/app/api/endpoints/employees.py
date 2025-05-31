from app.api.endpoints.auth import get_current_user, require_role
from app.models import User, ResourceAllocation, Skill
from sqlalchemy.orm import Session
from app.db.session import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.endpoints.auth import require_role

router = APIRouter()

@router.put("/employees/{employee_id}/availability")
def update_availability(
    employee_id: int,
    availability: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "project_manager":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project managers can update availability.",
        )
    employee = db.query(User).filter(User.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")
    employee.availability_percentage = availability
    db.commit()
    return {"detail": "Availability updated successfully"}


@router.put("/employees/{employee_id}/performance")
def update_performance(
    employee_id: int,
    performance_score: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "project_manager":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project managers can update performance metrics.",
        )
    employee = db.query(User).filter(User.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")
    employee.average_performance = performance_score
    db.commit()
    return {"detail": "Performance updated successfully"}


@router.get("/employees/{employee_id}/allocations")
def view_allocations(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure employees can only view their own allocations
    if current_user.role == "employee" and current_user.id != employee_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Employees can only view their own allocations.",
        )
    
    allocations = db.query(ResourceAllocation).filter(
        ResourceAllocation.employee_id == employee_id
    ).all()
    return allocations


@router.post("/employees/{employee_id}/skills")
def add_skills_to_employee(
    employee_id: int,
    skill_ids: list[int],  # List of skill IDs to add
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure employees can only add skills to themselves
    if current_user.role == "employee" and current_user.id != employee_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Employees can only add skills to themselves.",
        )
    
    # Find the employee
    employee = db.query(User).filter(User.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found.",
        )
    
    # Add skills to the employee
    for skill_id in skill_ids:
        skill = db.query(Skill).filter(Skill.id == skill_id).first()
        if not skill:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Skill with ID {skill_id} does not exist.",
            )
        if skill not in employee.skills:
            employee.skills.append(skill)
    
    db.commit()
    return {"detail": "Skills added successfully"}