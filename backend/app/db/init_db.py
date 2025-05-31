from app.db.session import engine, Base
from app.models import User, Skill, Project, ResourceAllocation

def init_db():
    # Create all tables in the database
    Base.metadata.create_all(bind=engine)
    
if __name__ == "__main__":
    init_db()
