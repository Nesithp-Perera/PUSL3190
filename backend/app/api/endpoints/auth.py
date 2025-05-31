from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserBase, UserUpdate, UserWithSkills
import os

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key_here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 8  # 8 days

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, SECRET_KEY, algorithm=ALGORITHM
    )
    return encoded_jwt


async def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, SECRET_KEY, algorithms=[ALGORITHM]
        )
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user


async def require_role(user: User = Depends(get_current_user), required_role: str = "admin"):
    if user.role != required_role:
        raise HTTPException(status_code=403, detail=f"Not authorized. {required_role} role required")
    return user


@router.post("/register")
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new user
    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=user.role if user.role else "employee",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}


@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "username": user.email,
        "full_name": user.full_name,
    }


@router.get("/users/me")
async def read_users_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Fetch user with projects and allocations
    user_with_data = db.query(User).filter(User.id == current_user.id).first()
    
    from sqlalchemy.orm import joinedload
    # Re-fetch user with projects and other relationships loaded
    user_with_relations = db.query(User).options(
        joinedload(User.skills),
        joinedload(User.allocations)  # Use the correct relationship name 'allocations'
    ).filter(User.id == current_user.id).first()
    
    # Create a dictionary from the user for custom modification
    user_dict = {
        "id": user_with_relations.id,
        "email": user_with_relations.email,
        "full_name": user_with_relations.full_name,
        "role": user_with_relations.role,
        "department": user_with_relations.department,
        "position": user_with_relations.position,
        "skills": [{"id": skill.id, "name": skill.name} for skill in user_with_relations.skills] if user_with_relations.skills else [],
        "availability_percentage": user_with_relations.availability_percentage,
        "average_performance": user_with_relations.average_performance
    }
    
    # Include projects the user is assigned to through allocations
    if hasattr(user_with_relations, 'allocations') and user_with_relations.allocations:
        from app.models.project import Project
        
        # Get projects through allocations
        project_ids = [alloc.project_id for alloc in user_with_relations.allocations if alloc.project_id]
        
        if project_ids:
            projects = db.query(Project).filter(Project.id.in_(project_ids)).all()
            user_dict["projects"] = [{
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "start_date": project.start_date.isoformat() if project.start_date else None,
                "end_date": project.end_date.isoformat() if project.end_date else None,
                "status": project.status,
                "employee_allocation": next(
                    (alloc.allocation_percentage for alloc in user_with_relations.allocations 
                    if alloc.project_id == project.id), 
                    None
                )
            } for project in projects]
        else:
            user_dict["projects"] = []
    else:
        user_dict["projects"] = []
    
    return user_dict


@router.put("/users/me")
async def update_own_user(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the currently authenticated user's profile"""
    user_dict = user_data.dict(exclude_unset=True)
    
    # Handle password update
    if "password" in user_dict:
        user_dict["hashed_password"] = get_password_hash(user_dict["password"])
        del user_dict["password"]
    
    # Handle skills update
    if "skills" in user_dict:
        # Clear current skills
        current_user.skills = []
        
        # Add new skills
        if user_dict["skills"]:
            from app.models.skill import Skill
            for skill_name in user_dict["skills"]:
                # Get or create skill
                skill = db.query(Skill).filter(Skill.name == skill_name).first()
                if not skill:
                    skill = Skill(name=skill_name)
                    db.add(skill)
                    db.flush()  # Flush to get the ID
                current_user.skills.append(skill)
        
        del user_dict["skills"]
    
    # Update other user fields
    for key, value in user_dict.items():
        setattr(current_user, key, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/users")
async def get_users(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if current_user.role != "project_manager":
        raise HTTPException(status_code=403, detail="Not authorized")
    users = db.query(User).all()
    return users


@router.get("/users/{user_id}")
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "project_manager":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Fetch user with skills relationship loaded
    from sqlalchemy.orm import joinedload
    user = db.query(User).options(joinedload(User.skills)).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create a response with skills included
    user_data = {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "department": user.department,
        "position": user.position,
        "skills": [{"id": skill.id, "name": skill.name} for skill in user.skills] if user.skills else [],
        "availability_percentage": user.availability_percentage,
        "average_performance": user.average_performance
    }
    
    return user_data


@router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    user: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "project_manager":
        raise HTTPException(status_code=403, detail="Not authorized")
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user.dict(exclude_unset=True)
    
    # Handle password update
    if "password" in user_data:
        user_data["hashed_password"] = get_password_hash(user_data["password"])
        del user_data["password"]
        
    # Handle skills update
    if "skills" in user_data:
        # Clear current skills
        db_user.skills = []
        
        # Add new skills
        if user_data["skills"]:
            from app.models.skill import Skill
            for skill_name in user_data["skills"]:
                # Get or create skill
                skill = db.query(Skill).filter(Skill.name == skill_name).first()
                if not skill:
                    skill = Skill(name=skill_name)
                    db.add(skill)
                    db.flush()  # Flush to get the ID
                db_user.skills.append(skill)
                
        del user_data["skills"]
        
    # Update user fields
    for key, value in user_data.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return db_user


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "project_manager":
        raise HTTPException(status_code=403, detail="Not authorized")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}
