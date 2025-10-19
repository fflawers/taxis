// Tu archivo Index.jsx

import React, { Fragment, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./secure/AuthContext";  // ✅ 1. Importa el hook (ajusta la ruta si es necesario)

import Banner from "./Banner/Banner";
import Formulario from "./Formularios/Formulario";
import IndexFooter from "./Footers/IndexFooter";

export default function Index() {
  // ✅ 2. Llama a los hooks para obtener el estado y la función de navegación
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // ✅ 3. Este efecto se ejecuta tan pronto como el componente se carga
  useEffect(() => {
    // Si el usuario ya está autenticado...
    if (isAuthenticated) {
      const rol = user?.rol?.toLowerCase();
      
      // ...lo redirigimos a su página correspondiente
      if (rol === 'admin') {
        navigate('/inicio');
      } else if (rol === 'taxista') {
        navigate('/taxistas');
      }
    }
    // Si no está autenticado, el efecto no hace nada y permite que se muestre el login.
  }, [isAuthenticated, user, navigate]); // El efecto depende de estos valores

  // ✅ 4. Mientras redirige, muestra un mensaje para evitar que el formulario "parpadee"
  if (isAuthenticated) {
    return (
      <div className="container text-center mt-5">
        <h1>Ya tienes una sesión activa. Redirigiendo...</h1>
      </div>
    );
  }

  // Si no está autenticado, muestra la página de login completa
  return (
    <Fragment>
      <Banner titleB={"Bienvenido"} />
      <Formulario />
      <IndexFooter />
    </Fragment>
  );
}