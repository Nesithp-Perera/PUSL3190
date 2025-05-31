# Main ML pipeline integrating all components
from ml.skill_matching.model import SkillMatcher
from ml.resource_forecasting.model import ResourceForecaster
from ml.allocation_optimization.model import ResourceOptimizer
from ml.explainability.model import AllocationExplainer
import pandas as pd
import numpy as np

class ResourceAllocationPipeline:
    def __init__(self):
        self.skill_matcher = SkillMatcher()
        self.forecaster = ResourceForecaster()
        self.optimizer = ResourceOptimizer()
        self.explainer = AllocationExplainer()
        self.trained = False
        
    def train(self, historical_allocations, employee_data):
        """Train the pipeline components with historical data"""
        # Train forecasting model
        self.forecaster.train(historical_allocations)
        
        # Prepare explainer
        # We'll create a simplified feature set for explanation purposes
        features = pd.DataFrame({
            'employee_skill_match': np.random.rand(len(historical_allocations)),
            'employee_availability': np.random.randint(0, 40, size=len(historical_allocations)),
            'employee_experience': np.random.randint(1, 10, size=len(historical_allocations)),
            'project_priority': np.random.randint(1, 5, size=len(historical_allocations)),
            'project_duration': np.random.randint(1, 12, size=len(historical_allocations))
        })
        self.explainer.prepare_explainer(features)
        
        self.trained = True
        return self
    
    def process_project_request(self, project_data, available_employees):
        """Process a new project resource request"""
        if not self.trained:
            raise ValueError("Pipeline must be trained before processing requests")
        
        results = {
            'project_id': project_data['id'],
            'recommendations': [],
            'explanation': {}
        }
        
        # Step 1: Extract skills from project description
        project_desc = project_data['description']
        employee_skills = self._extract_employee_skills(available_employees)
        
        # Step 2: Match skills to project requirements
        skill_matches = {}
        for emp_id, skills in employee_skills.items():
            # Get skill text list
            skill_texts = [skill['name'] for skill in skills]
            if skill_texts:  # Check if employee has any skills
                # Match project to skills
                matches = self.skill_matcher.match_skills_to_project(project_desc, skill_texts)
                # Calculate overall match score (average of top 3 skills or all if less than 3)
                if matches:
                    top_matches = matches[:min(3, len(matches))]
                    avg_score = sum(score for _, score in top_matches) / len(top_matches)
                    skill_matches[(emp_id, project_data['id'])] = avg_score
        
        # Step 3: Forecast resource availability
        # For simplicity, using a rule-based approach here
        employee_availability = {}
        for emp in available_employees:
            # Assume 40 hours/week is standard
            employee_availability[emp['id']] = 40 - self._get_allocated_hours(emp['id'])
        
        # Step 4: Prepare data for optimization
        projects_df = pd.DataFrame({
            'id': [project_data['id']],
            'hours_needed': [project_data['hours_needed']]
        })
        
        employees_df = pd.DataFrame({
            'id': list(employee_availability.keys()),
            'available_hours': list(employee_availability.values()),
            'efficiency': [1.0] * len(employee_availability)  # Simplified efficiency factor
        })
        
        # Step 5: Optimize resource allocation
        optimal_allocations = self.optimizer.optimize_allocation(
            projects_df, 
            employees_df, 
            skill_matches
        )
        
        # Step 6: Generate recommendations with explanations
        for allocation in optimal_allocations:
            emp_id = allocation['employee_id']
            emp_data = next((e for e in available_employees if e['id'] == emp_id), None)
            
            if emp_data:
                # Create a feature vector for explanation
                instance = pd.DataFrame({
                    'employee_skill_match': [skill_matches.get((emp_id, project_data['id']), 0)],
                    'employee_availability': [employee_availability.get(emp_id, 0)],
                    'employee_experience': [emp_data.get('experience', 1)],
                    'project_priority': [project_data.get('priority', 3)],
                    'project_duration': [project_data.get('duration_months', 1)]
                })
                
                # Generate explanation
                explanation = "This is a placeholder explanation"  # In a real system, use the explainer
                
                recommendation = {
                    'employee_id': emp_id,
                    'employee_name': emp_data.get('name', f"Employee {emp_id}"),
                    'match_score': skill_matches.get((emp_id, project_data['id']), 0),
                    'available_hours': employee_availability.get(emp_id, 0),
                    'explanation': explanation
                }
                
                results['recommendations'].append(recommendation)
        
        # Add optimization explanation
        results['explanation'] = self.optimizer.get_explanation()
        
        return results
    
    def _extract_employee_skills(self, employees):
        """Helper to extract skills from employee data"""
        skills = {}
        for emp in employees:
            if 'skills' in emp:
                skills[emp['id']] = emp['skills']
            else:
                skills[emp['id']] = []
        return skills
    
    def _get_allocated_hours(self, employee_id):
        """Helper to get currently allocated hours for an employee"""
        # In a real system, this would query the database
        # For now, returning random values between 0-30
        return np.random.randint(0, 30)

# Example usage:
# pipeline = ResourceAllocationPipeline()
# pipeline.train(historical_data, employee_data)
# recommendations = pipeline.process_project_request(new_project, available_employees)
