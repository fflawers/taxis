// src/context/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Intentamos obtener el usuario de sessionStorage para mantener la sesión
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData) => {
    // Guardamos el usuario en el estado y en sessionStorage
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem('user');
    setUser(null);
  };

  const isAuthenticated = !!user; // Convierte el objeto user en un booleano

  // Pasamos el usuario y las funciones a los componentes hijos
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
  return useContext(AuthContext);
};