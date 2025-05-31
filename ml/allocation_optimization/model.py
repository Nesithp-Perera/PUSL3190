# Resource allocation optimization using Google OR-Tools
from ortools.sat.python import cp_model
import pandas as pd
import numpy as np

class ResourceOptimizer:
    def __init__(self):
        self.model = None
        self.solver = None
        
    def optimize_allocation(self, projects, employees, skill_matches):
        """
        Optimize resource allocation based on:
        - Project requirements
        - Employee availability
        - Employee skills
        - Skill-project match scores
        """
        # Create the optimization model
        model = cp_model.CpModel()
        
        # Decision variables: employee assigned to project
        allocations = {}
        for emp_id in employees['id']:
            for proj_id in projects['id']:
                allocations[(emp_id, proj_id)] = model.NewBoolVar(f'allocation_e{emp_id}_p{proj_id}')
        
        # Constraint: Each employee can't exceed their availability
        for emp_id in employees['id']:
            # Sum of project hours this employee is assigned to
            model.Add(sum(allocations[(emp_id, proj_id)] * projects.loc[projects['id'] == proj_id, 'hours_needed'].iloc[0]
                       for proj_id in projects['id']) 
                    <= employees.loc[employees['id'] == emp_id, 'available_hours'].iloc[0])
        
        # Constraint: Each project must have all required hours allocated
        for proj_id in projects['id']:
            model.Add(sum(allocations[(emp_id, proj_id)] * employees.loc[employees['id'] == emp_id, 'efficiency'].iloc[0]
                        for emp_id in employees['id'])
                    >= projects.loc[projects['id'] == proj_id, 'hours_needed'].iloc[0])
        
        # Objective: Maximize skill match scores
        objective_terms = []
        for emp_id in employees['id']:
            for proj_id in projects['id']:
                # Get skill match score between this employee and project
                match_score = skill_matches.get((emp_id, proj_id), 0)
                objective_terms.append(allocations[(emp_id, proj_id)] * int(match_score * 100))  # Convert to integer
        
        model.Maximize(sum(objective_terms))
        
        # Solve the model
        self.model = model
        solver = cp_model.CpSolver()
        status = solver.Solve(model)
        self.solver = solver
        
        # Return results if optimal solution found
        if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
            allocation_results = []
            for emp_id in employees['id']:
                for proj_id in projects['id']:
                    if solver.Value(allocations[(emp_id, proj_id)]) == 1:
                        allocation_results.append({
                            'employee_id': emp_id,
                            'project_id': proj_id,
                            'skill_match_score': skill_matches.get((emp_id, proj_id), 0)
                        })
            return allocation_results
        else:
            return []
    
    def get_explanation(self):
        """Get explanation for the optimization results"""
        if not self.solver:
            return "No optimization has been performed yet."
            
        explanation = {
            "objective_value": self.solver.ObjectiveValue(),
            "wall_time": self.solver.WallTime(),
            "num_conflicts": self.solver.NumConflicts(),
            "num_branches": self.solver.NumBranches()
        }
        return explanation

# Example usage:
# optimizer = ResourceOptimizer()
# optimal_allocation = optimizer.optimize_allocation(projects_df, employees_df, skill_match_scores)
