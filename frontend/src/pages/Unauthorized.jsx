import React, { useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const Unauthorized = () => {
  const { user } = useContext(AuthContext);
  
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card border-danger">
            <div className="card-header bg-danger text-white">
              <h4 className="mb-0">Unauthorized Access</h4>
            </div>
            <div className="card-body">
              <h5>You don't have permission to access this page.</h5>
              <p>
                This page requires a different user role than your current role: 
                <strong> {user?.role || "Unknown"}</strong>
              </p>
              
              {user && user.role === "employee" && (
                <div className="mt-4">
                  <p>As an employee, you can access:</p>
                  <div className="list-group">
                    <Link to="/employee-dashboard" className="list-group-item list-group-item-action">
                      Dashboard
                    </Link>
                    <Link to="/employee-projects" className="list-group-item list-group-item-action">
                      My Projects
                    </Link>
                    <Link to="/employee-profile" className="list-group-item list-group-item-action">
                      My Profile
                    </Link>
                    <Link to="/employee-performance" className="list-group-item list-group-item-action">
                      My Performance
                    </Link>
                  </div>
                </div>
              )}
              
              {user && user.role === "project_manager" && (
                <div className="mt-4">
                  <p>As a project manager, you can access:</p>
                  <div className="list-group">
                    <Link to="/dashboard" className="list-group-item list-group-item-action">
                      Dashboard
                    </Link>
                    <Link to="/view-projects" className="list-group-item list-group-item-action">
                      Projects
                    </Link>
                    <Link to="/employees" className="list-group-item list-group-item-action">
                      Employees
                    </Link>
                  </div>
                </div>
              )}
              
              {!user && (
                <div className="mt-4">
                  <p>Please log in to access the system:</p>
                  <Link to="/login" className="btn btn-primary">
                    Go to Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;