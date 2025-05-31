from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import pandas as pd
import numpy as np

from app.db.session import get_db
from app.api.endpoints.auth import get_current_user
from app.models import User, Project, ProjectSkillRequirement, ResourceAllocation, Skill
from ml.pipeline import ResourceAllocationPipeline

router = APIRouter()

# Initialize ML pipeline
pipeline = ResourceAllocationPipeline()

@router.post("/train")
async def train_ml_models(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Train the ML models with current data"""
    if current_user.role not in ["admin", "resource_planner"]:
        raise HTTPException(status_code=403, detail="Not authorized to train ML models")
    
    try:
        # Get historical allocations from database
        allocations = db.query(ResourceAllocation).all()
        
        # Convert to pandas DataFrame
        allocation_data = []
        for alloc in allocations:
            allocation_data.append({
                "employee_id": alloc.employee_id,
                "project_id": alloc.project_id,
                "start_date": alloc.start_date,
                "end_date": alloc.end_date,
                "hours_allocated": alloc.hours_allocated,
                "allocation_percentage": alloc.allocation_percentage,
                "status": alloc.status
            })
        
        # Get employee data
        employees = db.query(User).all()
        employee_data = []
        for emp in employees:
            employee_data.append({
                "id": emp.id,
                "name": emp.full_name,
                "role": emp.role,
                "department": emp.department,
                "performance": emp.average_performance
            })
            
        # Convert to DataFrames
        allocations_df = pd.DataFrame(allocation_data)
        employee_df = pd.DataFrame(employee_data)
        
        # Train the pipeline if there's enough data
        if len(allocations_df) > 0:
            pipeline.train(allocations_df, employee_df)
            return {"status": "success", "message": "ML models trained successfully"}
        else:
            return {"status": "warning", "message": "Not enough historical data for training"}
            
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/recommend-resources")
async def recommend_resources(
    request_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get AI-recommended resources for a project"""
    # Get project_id from request data
    project_id = request_data.get("project_id")
    if not project_id:
        raise HTTPException(status_code=400, detail="project_id is required")
    
    try:
        # Get project details
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
            
        # Get skill requirements
        skill_requirements = db.query(ProjectSkillRequirement).filter(
            ProjectSkillRequirement.project_id == project_id
        ).all()
        
        if not skill_requirements:
            return {"status": "warning", "message": "No skill requirements found for this project", "recommendations": []}
        
        # Get the required skills for this project
        required_skill_ids = [req.skill_id for req in skill_requirements]
        required_skills = db.query(Skill).filter(Skill.id.in_(required_skill_ids)).all()
        
        # Get all active employees who are not project managers and have availability
        employees = db.query(User).filter(
            User.is_active == True,
            User.role == "employee",  # Filter out project managers
            User.availability_percentage > 0  # Only include employees with availability
        ).all()
        
        if not employees:
            return {"status": "warning", "message": "No available employees found", "recommendations": []}
        
        # Calculate match scores and recommendations
        recommendations = []
        for emp in employees:
            # Calculate skill match - how many of the required skills does the employee have?
            emp_skills = set(skill.id for skill in emp.skills)
            matched_skills = emp_skills.intersection(required_skill_ids)
            
            if not matched_skills:  # Skip employees with no matching skills
                continue
                
            skill_match_percent = len(matched_skills) / len(required_skill_ids)
            # Adjust match score based on performance and availability
            performance_factor = getattr(emp, 'average_performance', 0) / 5  # Normalize to 0-1 range
            availability_factor = getattr(emp, 'availability_percentage', 0) / 100  # Normalize to 0-1 range
            
            # Calculate final match score (weighted average)
            match_score = (skill_match_percent * 0.6) + (performance_factor * 0.2) + (availability_factor * 0.2)
            
            # Limit match score to a reasonable range (0-1)
            match_score = min(1.0, max(0.0, match_score))
            
            recommendations.append({
                "employee_id": emp.id,
                "employee_name": emp.full_name,
                "match_score": match_score,
                "available_hours": round(getattr(emp, 'availability_percentage', 0) * 0.4, 1),  # 40 hours * availability %
                "explanation": f"Skill match: {int(skill_match_percent * 100)}%, Performance: {getattr(emp, 'average_performance', 0)}/5, Availability: {getattr(emp, 'availability_percentage', 0)}%"
            })
        
        # Sort by match score (descending)
        recommendations.sort(key=lambda x: x["match_score"], reverse=True)
        
        # Take top 10 recommendations
        recommendations = recommendations[:10]
        
        return {
            "status": "success", 
            "message": "Recommendations generated successfully", 
            "recommendations": recommendations
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e), "recommendations": []}
