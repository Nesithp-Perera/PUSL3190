from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from app.db.session import get_db
from app.models import Project, ProjectSkillRequirement, User, ResourceAllocation
from app.models.skill import Skill
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.api.endpoints.auth import get_current_user, require_role
from datetime import datetime

router = APIRouter()

class AllocationRequest(BaseModel):
    allocations: List[dict]

class RemoveAllocationRequest(BaseModel):
    employee_id: int

@router.post("/", response_model=ProjectResponse)
async def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify user has permission to create projects
    if current_user.role not in ["admin", "project_manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create projects"
        )
    
    # Convert start_date and end_date to Python date objects
    try:
        start_date = datetime.strptime(project_data.start_date, "%Y-%m-%d").date()
        end_date = datetime.strptime(project_data.end_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD."
        )
    
    # Create project
    new_project = Project(
        name=project_data.name,
        description=project_data.description,
        start_date=start_date,
        end_date=end_date,
        status=project_data.status,
        priority=project_data.priority,
        manager_id=project_data.manager_id
    )
    
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    # Add skill requirements
    for skill_req in project_data.skill_requirements:
        db_skill_req = ProjectSkillRequirement(
            project_id=new_project.id,
            skill_id=skill_req.skill_id,  # Use skill_id instead of skill_name
            employees_requested=skill_req.employees_requested,
        )
        db.add(db_skill_req)
    
    db.commit()
    
    return new_project

@router.get("/", response_model=list[ProjectResponse])
async def get_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
):
    """Get all projects"""
    if current_user.role != "project_manager":
        raise HTTPException(status_code=403, detail="Not authorized")
    projects = db.query(Project).offset(skip).limit(limit).all()
    return projects

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Project managers can access any project
    if current_user.role == "project_manager":
        return project
    
    # Employees can only access projects they're allocated to
    if current_user.role == "employee":
        # Check if the current user is allocated to this project
        allocation = db.query(ResourceAllocation).filter(
            ResourceAllocation.project_id == project_id,
            ResourceAllocation.employee_id == current_user.id
        ).first()
        
        if allocation:
            return project
        
    # If we get here, the user doesn't have permission
    raise HTTPException(status_code=403, detail="Not authorized to view this project")

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if current_user.role not in ["admin"] and project.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this project")

    # Save old status to check for transitions
    old_status = project.status

    # Update project attributes from project_data
    for key, value in project_data.dict(exclude_unset=True).items():
        setattr(project, key, value)

    # Handle status transitions
    
    # If project is being marked as completed
    if old_status != "completed" and project_data.status == "completed":
        allocations = db.query(ResourceAllocation).filter(
            ResourceAllocation.project_id == project_id,
            ResourceAllocation.status != "completed"
        ).all()
        
        for allocation in allocations:
            employee = db.query(User).filter(User.id == allocation.employee_id).first()
            if employee:
                # Restore availability
                if not hasattr(employee, 'availability_percentage') or employee.availability_percentage is None:
                    employee.availability_percentage = 0
                
                employee.availability_percentage += allocation.allocation_percentage
                employee.availability_percentage = min(100, employee.availability_percentage)  # Cap at 100%
                allocation.status = "completed"
                db.add(employee)
    
    # If project is being reactivated from completed status
    elif old_status == "completed" and project_data.status != "completed":
        # When reactivating, don't restore allocations automatically
        # Just update the status
        allocations = db.query(ResourceAllocation).filter(
            ResourceAllocation.project_id == project_id
        ).all()
        
        # Just log the reactivation for audit purposes
        print(f"Project {project_id} reactivated from 'completed' to '{project_data.status}'")

    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "project_manager"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete projects")
        
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Add additional check for project manager
    if current_user.role == "project_manager" and project.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this project")
    
    db.delete(project)
    db.commit()
    
    return None

@router.post("/projects/{project_id}/allocate")
def allocate_resource(
    project_id: int,
    employee_id: int,
    hours_allocated: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure only project managers can allocate resources
    if current_user.role != "project_manager":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project managers can allocate resources.",
        )
    
    # Create a new resource allocation
    allocation = ResourceAllocation(
        employee_id=employee_id,
        project_id=project_id,
        hours_allocated=hours_allocated,
        allocation_percentage=hours_allocated / 40.0,  # Assuming 40-hour work week
    )
    db.add(allocation)
    db.commit()
    return {"detail": "Resource allocated successfully"}

@router.get("/projects/{project_id}/allocations")
def view_allocations(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch allocations for the given project
    allocations = db.query(ResourceAllocation).filter(
        ResourceAllocation.project_id == project_id
    ).all()
    return allocations

@router.get("/{project_id}/match-employees", response_model=dict)
async def match_employees(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify user has permission to view project details
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if current_user.role not in ["admin", "project_manager"]:
        raise HTTPException(status_code=403, detail="Not authorized to match employees")
    
    # Get skill requirements for the project
    skill_requirements = db.query(ProjectSkillRequirement).filter(
        ProjectSkillRequirement.project_id == project_id
    ).all()
    
    # Find matching employees for each skill requirement
    matching_employees = {}
    for skill_req in skill_requirements:
        # Get skill name from the skill table using skill_id
        skill = db.query(Skill).filter(Skill.id == skill_req.skill_id).first()
        if not skill:
            continue
            
        skill_name = skill.name
        
        # Query users with this skill
        employees = db.query(User).join(User.skills).filter(
            Skill.id == skill_req.skill_id,
            User.is_active == True
        ).all()
        
        # Sort employees by performance (descending)
        employees = sorted(employees, key=lambda e: e.average_performance if e.average_performance is not None else 0, reverse=True)
        
        # Prepare employee details
        employee_list = []
        for emp in employees:
            # Check if this employee is already allocated to this project for this skill
            is_allocated = db.query(ResourceAllocation).filter(
                ResourceAllocation.employee_id == emp.id,
                ResourceAllocation.project_id == project_id,
                ResourceAllocation.status != "completed"
            ).first() is not None
            
            current_project = None
            for alloc in emp.allocations:
                if alloc.status == "confirmed":
                    current_project = db.query(Project).filter(Project.id == alloc.project_id).first()
                    if current_project:
                        break
                        
            # Calculate availability (100% - sum of all allocations)
            availability = 100
            for alloc in emp.allocations:
                if alloc.status in ["confirmed", "proposed"]:
                    availability -= alloc.allocation_percentage
            
            employee_list.append({
                "id": emp.id,
                "name": emp.full_name,
                "email": emp.email,
                "availability": max(0, availability),
                "current_project": current_project.name if current_project else None,
                "allocated": is_allocated  # Add allocation status
            })
        
        matching_employees[skill_name] = employee_list
    
    return matching_employees

@router.post("/{project_id}/allocate-employees", response_model=dict)
async def allocate_employees(
    project_id: int,
    request_data: AllocationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Allocate employees to a project"""
    # Verify user has permission to allocate employees
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if current_user.role not in ["admin", "project_manager"]:
        raise HTTPException(status_code=403, detail="Not authorized to allocate employees")
    
    # Get allocations from request data
    allocations = request_data.allocations
    
    try:
        # Allocate employees
        for allocation in allocations:
            employee_id = allocation["employee_id"]
            
            # Check if employee is already allocated to this project
            existing_allocation = db.query(ResourceAllocation).filter(
                ResourceAllocation.employee_id == employee_id,
                ResourceAllocation.project_id == project_id,
                ResourceAllocation.status != "completed"
            ).first()
            
            if existing_allocation:
                raise HTTPException(
                    status_code=400,
                    detail=f"Employee ID {employee_id} is already allocated to this project"
                )
            
            employee = db.query(User).filter(User.id == employee_id).first()
            if not employee:
                raise HTTPException(
                    status_code=404,
                    detail=f"Employee with ID {employee_id} not found"
                )
            
            # Check if employee has the required skill
            skill_name = allocation["skill_name"]
            if not any(skill.name == skill_name for skill in employee.skills):
                raise HTTPException(
                    status_code=400,
                    detail=f"Employee {employee.full_name} does not have the required skill: {skill_name}"
                )
            
            # Check if employee has sufficient availability
            allocation_percentage = float(allocation["allocation_percentage"])
            current_allocations = db.query(ResourceAllocation).filter(
                ResourceAllocation.employee_id == employee.id,
                ResourceAllocation.status != "completed"
            ).all()
            
            total_allocation = sum(alloc.allocation_percentage for alloc in current_allocations)
            if total_allocation + allocation_percentage > 100:
                raise HTTPException(
                    status_code=400,
                    detail=f"Employee {employee.full_name} does not have sufficient availability"
                )
            
            # Create resource allocation with specific fields required
            new_allocation = ResourceAllocation(
                employee_id=employee.id,
                project_id=project_id,
                allocation_percentage=allocation_percentage,
                status="confirmed",
                start_date=project.start_date,
                end_date=project.end_date,
                hours_allocated=allocation_percentage * 0.4,  # 40 hours * allocation percentage
                is_ai_recommended=False
            )
            
            # Update employee availability
            if not hasattr(employee, 'availability_percentage') or employee.availability_percentage is None:
                employee.availability_percentage = 100
                
            employee.availability_percentage -= allocation_percentage
            
            # Ensure it doesn't go below 0
            employee.availability_percentage = max(0, employee.availability_percentage)
            
            db.add(new_allocation)
            db.add(employee)
        
        # Update project as having allocations if it wasn't already active
        if project.status == "planning":
            project.status = "active"
            db.add(project)
        
        db.commit()
        return {"detail": "Employees allocated successfully"}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{project_id}/remove-allocation", response_model=dict)
async def remove_allocation(
    project_id: int,
    request_data: RemoveAllocationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove an employee allocation from a project"""
    # Verify user has permission
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if current_user.role not in ["admin", "project_manager"]:
        raise HTTPException(status_code=403, detail="Not authorized to modify allocations")
    
    employee_id = request_data.employee_id
    
    try:
        # Find the allocation to remove
        allocation = db.query(ResourceAllocation).filter(
            ResourceAllocation.project_id == project_id,
            ResourceAllocation.employee_id == employee_id,
            ResourceAllocation.status != "completed"
        ).first()
        
        if not allocation:
            raise HTTPException(
                status_code=404,
                detail=f"No active allocation found for employee ID {employee_id} on this project"
            )
        
        # Get the employee to update availability
        employee = db.query(User).filter(User.id == employee_id).first()
        if not employee:
            raise HTTPException(status_code=404, detail=f"Employee with ID {employee_id} not found")
        
        # Update employee availability (restore the allocated percentage)
        if not hasattr(employee, 'availability_percentage') or employee.availability_percentage is None:
            employee.availability_percentage = allocation.allocation_percentage
        else:
            employee.availability_percentage += allocation.allocation_percentage
        
        # Cap availability at 100%
        employee.availability_percentage = min(100, employee.availability_percentage)
        
        # Delete the allocation
        db.delete(allocation)
        db.add(employee)
        db.commit()
        
        return {"detail": "Allocation successfully removed"}
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/non-allocated-projects")
async def get_non_allocated_projects(
    db: Session = Depends(get_db)
):
    """Fetch projects without any allocations"""
    # Remove the current_user dependency that's causing the validation error

    # Fetch projects without allocations
    non_allocated_projects = db.query(Project).filter(~Project.resource_allocations.any()).all()
    return [{"id": proj.id, "name": proj.name, "status": proj.status} for proj in non_allocated_projects]

@router.get("/employee/{project_id}")
async def read_employee_project(
    project_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """
    Get project details for an employee who is assigned to the project
    """
    # First check if the user is assigned to this project
    resource_allocation = (
        db.query(ResourceAllocation)
        .filter(
            ResourceAllocation.project_id == project_id,
            ResourceAllocation.employee_id == current_user.id
        )
        .first()
    )
    
    if not resource_allocation and current_user.role != "project_manager":
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to view this project"
        )
    
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Include allocations in the response
    project_dict = project.__dict__.copy()
    if "_sa_instance_state" in project_dict:
        del project_dict["_sa_instance_state"]
    
    # Add resource allocations
    allocations = (
        db.query(ResourceAllocation)
        .filter(ResourceAllocation.project_id == project_id)
        .all()
    )
    project_dict["resource_allocations"] = [allocation.__dict__ for allocation in allocations]
    for allocation_dict in project_dict["resource_allocations"]:
        if "_sa_instance_state" in allocation_dict:
            del allocation_dict["_sa_instance_state"]
    
    # Add skill requirements
    requirements = (
        db.query(ProjectSkillRequirement)
        .filter(ProjectSkillRequirement.project_id == project_id)
        .all()
    )
    project_dict["skill_requirements"] = []
    for req in requirements:
        req_dict = req.__dict__.copy()
        if "_sa_instance_state" in req_dict:
            del req_dict["_sa_instance_state"]
        project_dict["skill_requirements"].append(req_dict)
    
    return project_dict

@router.get("/employee/list")
async def get_employee_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all projects assigned to the current employee"""
    if current_user.role not in ["employee", "project_manager"]:
        raise HTTPException(status_code=403, detail="Not authorized to access this endpoint")
    
    # Get all resource allocations for the current employee
    allocations = db.query(ResourceAllocation).filter(
        ResourceAllocation.employee_id == current_user.id
    ).all()
    
    # Get project IDs from allocations
    project_ids = [allocation.project_id for allocation in allocations]
    
    if not project_ids:
        return []
    
    # Get projects based on these IDs
    projects = db.query(Project).filter(Project.id.in_(project_ids)).all()
    
    # Convert projects to dictionaries
    result = []
    for project in projects:
        # Create a dictionary representation of the project
        project_dict = {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "start_date": project.start_date,
            "end_date": project.end_date,
            "status": project.status,
            "priority": project.priority,
            "manager_id": project.manager_id,
            "skill_requirements": [],
            "resource_allocations": []
        }
        
        # Add resource allocations
        for allocation in project.resource_allocations:
            if allocation.employee_id == current_user.id:
                allocation_dict = {
                    "id": allocation.id,
                    "employee_id": allocation.employee_id,
                    "project_id": allocation.project_id,
                    "allocation_percentage": allocation.allocation_percentage,
                    "status": allocation.status
                }
                project_dict["resource_allocations"].append(allocation_dict)
        
        result.append(project_dict)
    
    return result
