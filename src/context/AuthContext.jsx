// import React, {
//   createContext,
//   useState,
//   useContext,
//   useEffect,
//   useCallback,
// } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// const AuthContext = createContext(null);
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// /**
//  * Decode JWT token payload safely
//  */
// const parseJwt = (token) => {
//   if (!token) return null;
//   try {
//     const base64Url = token.split(".")[1];
//     const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//     const jsonPayload = decodeURIComponent(
//       atob(base64)
//         .split("")
//         .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
//         .join("")
//     );
//     return JSON.parse(jsonPayload);
//   } catch (error) {
//     console.error("Invalid JWT token:", error);
//     return null;
//   }
// };

// export const AuthProvider = ({ children }) => {
//   const navigate = useNavigate();

//   const [token, setToken] = useState(null);
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   /**
//    * Logout user and clear session data
//    */
//   const logout = useCallback(() => {
//     localStorage.removeItem("authToken");
//     localStorage.removeItem("authUser");
//     setToken(null);
//     setUser(null);
//     setIsAuthenticated(false);
//     navigate("/login", { replace: true });
//   }, [navigate]);

//   /**
//    * Initialize authentication from localStorage
//    */
//   useEffect(() => {
//     const storedToken = localStorage.getItem("authToken");
//     const storedUser = localStorage.getItem("authUser");

//     if (storedToken) {
//       const payload = parseJwt(storedToken);
//       const currentTime = Math.floor(Date.now() / 1000);

//       if (payload && payload.exp > currentTime) {
//         setToken(storedToken);
//         setUser(JSON.parse(storedUser));
//         setIsAuthenticated(true);
//       } else {
//         console.warn("JWT expired or invalid. Logging out...");
//         logout();
//       }
//     }

//     setIsLoading(false);
//   }, [logout]);

//   /**
//    * Create a preconfigured Axios instance with interceptors
//    */
//   const axiosInstance = axios.create({
//     baseURL: API_BASE_URL,
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });

//   // Attach token to every request
//   axiosInstance.interceptors.request.use(
//     (config) => {
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//       return config;
//     },
//     (error) => Promise.reject(error)
//   );

//   // Handle 401 globally
//   axiosInstance.interceptors.response.use(
//     (response) => response,
//     (error) => {
//       if (error.response?.status === 401) {
//         console.warn("Unauthorized (401). Logging out...");
//         logout();
//       }
//       return Promise.reject(error);
//     }
//   );

//   /**
//    * Login user
//    */
//   const login = useCallback(async (username, password) => {
//     try {
//       const response = await axiosInstance.post("/auth/login", {
//         username,
//         password,
//       });

//       const data = response.data?.data;

//       if (!data?.token || !data?.user) {
//         throw new Error("Invalid login response");
//       }

//       localStorage.setItem("authToken", data.token);
//       localStorage.setItem("authUser", JSON.stringify(data.user));

//       setToken(data.token);
//       setUser(data.user);
//       setIsAuthenticated(true);
//     } catch (error) {
//       console.error("Login failed:", error.response?.data || error.message);
//       throw new Error(error.response?.data?.message || "Login failed");
//     }
//   }, []);

//   /**
//    * Authenticated request helper
//    * Example: await authRequest.get("/users");
//    */
//   const authRequest = axiosInstance;

//   return (
//     <AuthContext.Provider
//       value={{
//         isAuthenticated,
//         token,
//         user,
//         login,
//         logout,
//         isLoading,
//         authRequest,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// /**
//  * Hook for easy access to AuthContext
//  */
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// -------- src/context/AuthContext.jsx --------
// Manages global authentication state with a real API and token expiration.
import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to parse the JWT and get its payload
const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Invalid token:", e);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Logout user
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Check token validity on startup
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("authToken");

      if (storedToken) {
        const payload = parseJwt(storedToken);
        const currentTime = Math.floor(Date.now() / 1000);

        if (payload && payload.exp > currentTime) {
          const storedUser = JSON.parse(localStorage.getItem("authUser"));
          setToken(storedToken);
          setUser(storedUser);
          setIsAuthenticated(true);
        } else {
          logout();
          console.log("Token expired or invalid, logging out.");
        }
      }
    } catch (error) {
      console.error("Error during initial auth check:", error);
      logout();
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const { data } = await response.json();
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("authUser", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to login");
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, token, user, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
