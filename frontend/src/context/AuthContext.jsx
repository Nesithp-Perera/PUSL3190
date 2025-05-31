import React, { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const userString = localStorage.getItem("user");
    return userString ? JSON.parse(userString) : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial auth check
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    
    // Validate token on server or just use stored user data
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      console.log("Making login request to backend");
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          username,
          password,
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login response:", data);
        localStorage.setItem("token", data.access_token);
        
        const userData = {
          id: data.id,
          username: data.username,
          role: data.role,
          email: data.email,
          full_name: data.full_name
        };
        
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
export default AuthContext;