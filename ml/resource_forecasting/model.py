# Resource forecasting with scikit-learn
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

class ResourceForecaster:
    def __init__(self):
        # Create a pipeline with preprocessing and model
        self.model = Pipeline([
            ('scaler', StandardScaler()),
            ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
        ])
        self.trained = False
    
    def prepare_features(self, allocation_data):
        """
        Prepare features from allocation data
        Expected columns: employee_id, project_id, skill_id, start_date, end_date, 
                        hours_allocated, allocation_percentage
        """
        # Convert dates to numerical features
        df = allocation_data.copy()
        df['start_year'] = pd.to_datetime(df['start_date']).dt.year
        df['start_month'] = pd.to_datetime(df['start_date']).dt.month
        df['end_year'] = pd.to_datetime(df['end_date']).dt.year
        df['end_month'] = pd.to_datetime(df['end_date']).dt.month
        df['duration_months'] = (df['end_year'] - df['start_year']) * 12 + (df['end_month'] - df['start_month'])
        
        # One-hot encode categorical variables
        df_encoded = pd.get_dummies(df, columns=['employee_id', 'project_id', 'skill_id'])
        
        return df_encoded
    
    def train(self, historical_allocations):
        """Train the forecasting model on historical allocation data"""
        if len(historical_allocations) == 0:
            raise ValueError("No historical data provided for training")
        
        X = self.prepare_features(historical_allocations)
        y = historical_allocations['hours_allocated']  # Target variable
        
        self.model.fit(X, y)
        self.trained = True
        return self
    
    def predict_allocation(self, new_allocations):
        """Predict resource allocation hours based on new allocation requests"""
        if not self.trained:
            raise ValueError("Model must be trained before making predictions")
        
        X_new = self.prepare_features(new_allocations)
        
        # Ensure X_new has the same features as training data
        missing_cols = set(self.model.feature_names_in_) - set(X_new.columns)
        for col in missing_cols:
            X_new[col] = 0
            
        # Ensure X_new has only the features used in training
        X_new = X_new[self.model.feature_names_in_]
        
        return self.model.predict(X_new)
    
    def forecast_availability(self, employee_data, future_dates):
        """Forecast employee availability for future dates"""
        # This would use historical allocation patterns to predict future availability
        # For simplicity, using a rule-based approach for now
        availability = {}
        
        for emp_id in employee_data['employee_id'].unique():
            # Example: calculate availability as 40 hours minus allocated hours
            emp_allocations = employee_data[employee_data['employee_id'] == emp_id]
            weekly_hours = 40  # Assuming 40-hour work week
            
            # Calculate allocated hours per week
            allocated_hours = emp_allocations.groupby('week')['hours_allocated'].sum()
            
            # Calculate availability for each week
            for week in future_dates:
                if week in allocated_hours.index:
                    availability[(emp_id, week)] = max(0, weekly_hours - allocated_hours[week])
                else:
                    availability[(emp_id, week)] = weekly_hours
                    
        return availability

# Example usage:
# forecaster = ResourceForecaster()
# forecaster.train(historical_data)
# predicted_hours = forecaster.predict_allocation(new_allocation_requests)
