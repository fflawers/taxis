// src/components/TaxistaNavbar.jsx (o como se llame tu archivo)
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../secure/AuthContext"; // 1. Importa el hook

function TaxistaNavbar() {
  // 2. Obtén el estado de autenticación y las funciones
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();      // Limpia la sesión
    navigate('/'); // Redirige al login
  };

  return (
    <div className="index-navbar glass_nav">
      <nav className="pt-2 transition-all navbar navbar-expand-lg navbar-light">
        <div className="backgroundResponsive navbar-default py-1 container">
          <Link to="/taxistas" className="mx-lg-3 mx-0 text-lg-end text-start navbar-brand">
            <img
              src="https://proyectotaxis.s3.us-east-2.amazonaws.com/taxilogo.png"
              alt="Pillo_Logo"
              className="img-fluid imgLogoFekaTaxi"
            />
          </Link>
          <button
            aria-controls="navbarOffcanvas"
            type="button"
            aria-label="Toggle navigation"
            className="hamburger navbar-toggler collapsed"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="justify-content-between navbar-collapse collapse" id="navbarOffcanvas">
            {/* ENLACES DE NAVEGACIÓN */}
            <div className="d-none d-lg-flex navbar-nav">
              <Link to="/taxistas" className="nav-link">Inicio</Link>
              {/* Rutas corregidas para coincidir con App.jsx */}
              <Link to="/reportes" className="nav-link">Ver Mis Reportes</Link>
              <Link to="/resolution" className="nav-link">Ver Mis Acuerdos</Link>
            </div>

            {/* 3. SECCIÓN DE USUARIO Y LOGOUT */}
            <div className="d-none d-lg-flex align-items-center">
              <span className="navbar-text me-3" style={{ color: 'white' }}>
                Hola, {user?.nombre}
              </span>
              <button className="btn btn-outline-danger" onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default TaxistaNavbar;