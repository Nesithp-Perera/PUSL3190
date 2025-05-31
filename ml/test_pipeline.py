import sys
import os

# Add the project root directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.pipeline import ResourceAllocationPipeline
try:
    pipeline = ResourceAllocationPipeline()
    print("Pipeline initialized successfully.")
except Exception as e:
    print(f"Error initializing pipeline: {e}")