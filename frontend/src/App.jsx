import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Container, Box } from "@mui/material";
import { motion } from "framer-motion";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateProject from "./pages/CreateProject";
import UpdateProject from "./pages/UpdateProject";
import ViewProjects from "./pages/ViewProjects";
import RegisterEmployee from "./pages/RegisterEmployee";
import Employees from "./pages/Employees";
import UpdateEmployee from "./pages/UpdateEmployee";
import ResourceOptimization from "./pages/ResourceOptimization";
import EmployeeMatching from "./pages/EmployeeMatching";
import Unauthorized from "./pages/Unauthorized";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeProjects from "./pages/EmployeeProjects";
import EmployeeProjectDetail from "./pages/EmployeeProjectDetail";
import EmployeeProfile from "./pages/EmployeeProfile";
import EmployeePerformance from "./pages/EmployeePerformance";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";

const App = () => {
  return (
    <>
      <Navbar />
      <Container component="main" sx={{ 
        py: 4, 
        flexGrow: 1, 
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box 
          component={motion.div}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          sx={{ flexGrow: 1 }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Project Manager Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute roles={["project_manager"]}>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/create-project"
              element={
                <PrivateRoute roles={["project_manager"]}>
                  <CreateProject />
                </PrivateRoute>
              }
            />
            <Route
              path="/update-project/:id"
              element={
                <PrivateRoute roles={["project_manager"]}>
                  <UpdateProject />
                </PrivateRoute>
              }
            />
            <Route
              path="/view-projects"
              element={
                <PrivateRoute roles={["project_manager"]}>
                  <ViewProjects />
                </PrivateRoute>
              }
            />
            <Route
              path="/resource-optimization"
              element={
                <PrivateRoute roles={["project_manager"]}>
                  <ResourceOptimization />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee-matching"
              element={
                <PrivateRoute roles={["project_manager"]}>
                  <EmployeeMatching />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee-matching/:projectId"
              element={
                <PrivateRoute roles={["project_manager"]}>
                  <EmployeeMatching />
                </PrivateRoute>
              }
            />
            <Route
              path="/register-employee"
              element={
                <PrivateRoute roles={["project_manager"]}>
                  <RegisterEmployee />
                </PrivateRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <PrivateRoute roles={["project_manager"]}>
                  <Employees />
                </PrivateRoute>
              }
            />
            <Route
              path="/employees/:id"
              element={
                <PrivateRoute roles={["project_manager"]}>
                  <UpdateEmployee />
                </PrivateRoute>
              }
            />
            <Route
              path="/update-employee/:id"
              element={
                <PrivateRoute roles={["project_manager"]}>
                  <UpdateEmployee />
                </PrivateRoute>
              }
            />

            {/* Employee Routes */}
            <Route
              path="/employee-dashboard"
              element={
                <PrivateRoute roles={["employee"]}>
                  <EmployeeDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee-projects"
              element={
                <PrivateRoute roles={["employee"]}>
                  <EmployeeProjects />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee-projects/:projectId"
              element={
                <PrivateRoute roles={["employee"]}>
                  <EmployeeProjectDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee-profile"
              element={
                <PrivateRoute roles={["employee"]}>
                  <EmployeeProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee-performance"
              element={
                <PrivateRoute roles={["employee"]}>
                  <EmployeePerformance />
                </PrivateRoute>
              }
            />
          </Routes>
        </Box>
      </Container>
      <Footer />
    </>
  );
};

export default App;
