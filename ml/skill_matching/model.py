# Skill matching with Sentence-BERT from Hugging Face
from sentence_transformers import SentenceTransformer
import numpy as np

class SkillMatcher:
    def __init__(self, model_name='paraphrase-MiniLM-L6-v2'):
        # Load pre-trained model from Hugging Face
        self.model = SentenceTransformer(model_name)
    
    def get_skill_embeddings(self, skills):
        """Generate embeddings for a list of skills"""
        return self.model.encode(skills)
    
    def get_project_requirements_embedding(self, project_description):
        """Generate embedding for project description"""
        return self.model.encode(project_description)
    
    def calculate_similarity(self, project_embedding, skill_embeddings):
        """Calculate cosine similarity between project and skills"""
        # Normalize embeddings for cosine similarity
        normalized_proj = project_embedding / np.linalg.norm(project_embedding)
        normalized_skills = skill_embeddings / np.linalg.norm(skill_embeddings, axis=1, keepdims=True)
        
        # Calculate similarities
        similarities = np.dot(normalized_skills, normalized_proj)
        return similarities
    
    def match_skills_to_project(self, project_description, available_skills):
        """Match skills to project description and return ranked skills"""
        project_embedding = self.get_project_requirements_embedding(project_description)
        skill_embeddings = self.get_skill_embeddings(available_skills)
        
        similarities = self.calculate_similarity(project_embedding, skill_embeddings)
        
        # Create list of (skill, score) tuples
        skill_scores = [(skill, float(score)) for skill, score in zip(available_skills, similarities)]
        
        # Sort by similarity score (descending)
        return sorted(skill_scores, key=lambda x: x[1], reverse=True)

# Example usage:
# matcher = SkillMatcher()
# skills = ["Python programming", "Data analysis", "Project management", "UI design"]
# project = "We need a data scientist to analyze customer data and build predictive models."
# matches = matcher.match_skills_to_project(project, skills)
