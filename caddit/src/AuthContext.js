import React, { createContext, useState, useContext } from 'react';

// Create the AuthContext
export const AuthContext = createContext();

// AuthProvider component to wrap your application and provide the authentication state
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = () => {
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily access the AuthContext values
export const useAuth = () => useContext(AuthContext);
