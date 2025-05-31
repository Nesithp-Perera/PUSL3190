import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, MetaData, Table, Column, DateTime
from datetime import datetime
from app.core.config import settings
from alembic import op

def add_created_at_to_users():
    """Add created_at field to users table if missing"""
    # Create engine
    engine = create_engine(settings.DATABASE_URI)
    
    # Connect to DB
    conn = engine.connect()
    
    # Check if column exists
    metadata = MetaData()
    metadata.reflect(bind=engine)
    users_table = metadata.tables['users']
    
    # Check if created_at column exists
    if 'created_at' not in users_table.columns:
        # Add created_at column with default value
        op.add_column('users', Column('created_at', DateTime, default=datetime.now))
        
        # Update all existing records
        conn.execute(f"UPDATE users SET created_at = '{datetime.now()}' WHERE created_at IS NULL")
    
    conn.close()

if __name__ == "__main__":
    add_created_at_to_users()
    print("Migration completed successfully")
