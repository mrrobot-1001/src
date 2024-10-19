import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode'; // Use named import

// Create Auth Context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Function to log in and store JWT token
  const login = (jwtToken) => {
    localStorage.setItem('jwtToken', jwtToken);
    setToken(jwtToken);

    const decodedUser = jwtDecode(jwtToken);
    setUser(decodedUser);

    //redirect to dashboard
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  // Function to log out and clear token
  const logout = () => {
    localStorage.removeItem('jwtToken');
    setToken(null);
    setUser(null);
  };

  // Load token from localStorage on app start
  useEffect(() => {
    const storedToken = localStorage.getItem('jwtToken');
    if (storedToken) {
      try {
        const decodedUser = jwtDecode(storedToken);
        const isExpired = decodedUser.exp * 1000 < Date.now();

        if (isExpired) {
          logout(); // Token expired, log out
        } else {
          setToken(storedToken);
          setUser(decodedUser);
        }
      } catch (error) {
        logout(); // Invalid token, log out
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use Auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
