import React from "react";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
// Importa useEffect si necesitas hacer algo después de la carga inicial o para efectos secundarios
// import { useEffect } from 'react';

function Formulario() {
  const [showPassword, setShowPassword] = useState(false);
  const [noLista, setNoLista] = useState(""); // Estado para el Username (no_lista)
  const [password, setPassword] = useState(""); // Estado para la Contraseña
  const [mensajeError, setMensajeError] = useState(""); // Estado para mostrar errores
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeError("");

    try {
      // ... (petición fetch al endpoint /login)

      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          no_lista: noLista,
          contraseña: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Declaramos la variable antes de usarla
        const rol = data.rol?.toLowerCase();

        console.log("Inicio de sesión exitoso:", data.usuario);
        console.log("Rol recibido:", data.rol);
        console.log(
          "Redirigiendo a:",
          rol === "admin" ? "/inicio" : "/taxistas"
        );

        // ✅ Redirección según el rol
        if (rol === "admin") {
          navigate("/inicio");
        } else if (rol === "taxista") {
          navigate("/taxistas");
        } else {
          console.warn("Rol no reconocido:", data.rol);
        }
      } else {
        // Error de inicio de sesión
        setMensajeError(data.message || "Error al iniciar sesión.");
        console.error("Error en el login:", data.message);
      }
    } catch (error) {
      console.error("Error de red o del servidor:", error);
      setMensajeError("No se pudo conectar con el servidor. Intente de nuevo.");
    }
  };

  // ...

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div>
      <div className="container spaceNavbarGeneral">
        <div className="row justify-content-center my-5 mx-auto">
          <div className="col-12 col-lg-5 m-auto">
            <div className="row">
              <div className="col-12 col-lg-10 text-center m-auto">
                <h1>Inicia tu sesión</h1>
                <p className="my-3 text-general">
                  Ingresa tu username y contraseña:
                </p>

                {/* Muestra el mensaje de error si existe */}
                {mensajeError && (
                  <p style={{ color: "red", fontWeight: "bold" }}>
                    {mensajeError}
                  </p>
                )}

                <div className="row">
                  <form
                    onSubmit={handleSubmit} /* Asigna la función handleSubmit */
                  >
                    <div className="row d-block m-auto">
                      <div className="col-12 my-3 text-start">
                        <input
                          type="text"
                          inputMode="numeric"
                          name="no_lista" // Cambiado a no_lista para claridad
                          className="col-11 inputG px-3 py-2 mb-4"
                          id="no_lista" // Cambiado a no_lista
                          placeholder="Username (Número de Lista)" // Indicando qué usar
                          required
                          maxLength="10"
                          value={noLista}
                          onChange={(e) => setNoLista(e.target.value)} // Manejo del cambio
                        />

                        <input
                          name="contraseña" // Cambiado a contrasena para claridad
                          className="inputG px-3 py-2 col-11"
                          id="contraseña" // Cambiado a contrasena
                          placeholder="Contraseña"
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)} // Manejo del cambio
                        />
                        <button
                          type="button"
                          className="col-1 button-eye"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      <div className="col-11 my-3">
                        <button
                          type="submit"
                          id="submit-btn"
                          className="btnIngresarVerde py-2 px-3 col-lg-12"
                        >
                          Continuar
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="line"></div>
    </div>
  );
}

export default Formulario;
