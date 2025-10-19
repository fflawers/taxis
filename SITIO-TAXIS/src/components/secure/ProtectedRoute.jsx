// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../components/secure/AuthContext';

// El 'rolRequerido' es opcional, para rutas solo de admin
function ProtectedRoute({ rolRequerido }) {
  const { isAuthenticated, user } = useAuth();

  // 1. ¿El usuario no está autenticado?
  if (!isAuthenticated) {
    // Lo redirigimos a la página de login
    return <Navigate to="/" />;
  }

  // 2. ¿La ruta requiere un rol específico y el usuario no lo tiene?
  if (rolRequerido && user.rol?.toLowerCase() !== rolRequerido) {
    // Lo redirigimos a una página por defecto o a una de "acceso denegado"
    // En este caso, lo mandamos a la raíz.
    return <Navigate to="/" />;
  }
  
  // Si todo está bien, mostramos el contenido de la ruta
  return <Outlet />;
}

export default ProtectedRoute;