# Explainable AI with LIME
import lime
import lime.lime_tabular
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline

class AllocationExplainer:
    def __init__(self, feature_names=None):
        self.explainer = None
        self.feature_names = feature_names
        self.class_names = ["Not Recommended", "Recommended"]
    
    def prepare_explainer(self, training_data):
        """Initialize LIME explainer with training data"""
        if self.feature_names is None:
            self.feature_names = training_data.columns.tolist()
            
        # Create a LIME tabular explainer
        self.explainer = lime.lime_tabular.LimeTabularExplainer(
            training_data=training_data.values,
            feature_names=self.feature_names,
            class_names=self.class_names,
            mode='classification'  # We'll treat this as a binary classification problem
        )
        
        return self
    
    def explain_recommendation(self, model, instance, num_features=5):
        """Explain a specific resource allocation recommendation"""
        if self.explainer is None:
            raise ValueError("Explainer must be prepared with training data first")
        
        # Function for LIME to predict with the model
        def predict_fn(instances):
            # Convert to DataFrame to match expected model input
            df = pd.DataFrame(instances, columns=self.feature_names)
            # Get model predictions (binary classification)
            preds = model.predict_proba(df)
            return preds
            
        # Generate an explanation for this instance
        explanation = self.explainer.explain_instance(
            instance.values.flatten(), 
            predict_fn,
            num_features=num_features
        )
        
        # Extract explanation factors
        explanation_factors = []
        for feature, weight in explanation.as_list():
            factor = {
                'feature': feature,
                'weight': float(weight),
                'direction': 'positive' if weight > 0 else 'negative'
            }
            explanation_factors.append(factor)
        
        return explanation_factors
    
    def format_explanation_for_ui(self, explanation_factors):
        """Format explanation for user interface display"""
        positive_factors = [f for f in explanation_factors if f['direction'] == 'positive']
        negative_factors = [f for f in explanation_factors if f['direction'] == 'negative']
        
        explanation_text = "This resource allocation was recommended because:\\n"
        for factor in positive_factors:
            explanation_text += f"- {factor['feature']} (+{factor['weight']:.2f})\\n"
            
        if negative_factors:
            explanation_text += "\\nFactors working against this recommendation:\\n"
            for factor in negative_factors:
                explanation_text += f"- {factor['feature']} ({factor['weight']:.2f})\\n"
        
        return explanation_text

# Example usage:
# explainer = AllocationExplainer()
# explainer.prepare_explainer(training_data)
# explanation = explainer.explain_recommendation(model, instance_to_explain)
# ui_explanation = explainer.format_explanation_for_ui(explanation)
