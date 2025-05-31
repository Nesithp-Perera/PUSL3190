# AI-Driven Resource Planning Application

An application that uses AI to optimize resource allocation for project management.

## Overview

This application integrates several AI/ML components to help organizations efficiently allocate resources to projects:

1. **Skill Matching**: Uses Sentence-BERT to match employee skills with project requirements
2. **Resource Forecasting**: Predicts future resource availability using ML models
3. **Allocation Optimization**: Optimizes resource allocation using constraint programming (Google OR-Tools)
4. **Explainable AI**: Provides transparent explanations for why specific resources were recommended

## Project Structure

- **Backend (FastAPI)**
  - API endpoints for project management, resource allocation, and ML integration
  - Database models and schemas
  - ML integration points

- **ML Components**
  - Skill matching using Sentence-BERT
  - Resource forecasting with scikit-learn
  - Allocation optimization with Google OR-Tools
  - Explainability with LIME

- **Frontend (React + Vite)**
  - User interface for project management
  - Resource allocation visualization
  - Employee matching interface

## Setup and Installation

### Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

## Key Features

- Smart employee-project matching based on skills and availability
- Optimization of resource allocation across multiple projects
- AI-driven forecasting of resource needs
- Transparent explanations for resource recommendations

## Folder Structure

- `backend/` - FastAPI backend, database, and ML API integration
- `frontend/` - React frontend (Vite)
- `ml/` - Machine learning models and utilities

