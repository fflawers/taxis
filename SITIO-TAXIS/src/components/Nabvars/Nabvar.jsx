// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../secure/AuthContext"; // 1. Importa el hook

function Navbar() {
  // 2. Obtén el estado de autenticación y las funciones
  const {  logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();      // Limpia la sesión
    navigate('/'); // Redirige al login
  };

  return (
    <div className="index-navbar glass_nav">
      <nav className="pt-2 transition-all navbar navbar-expand-lg navbar-light">
        <div className="backgroundResponsive navbar-default py-1 container">
          <Link to="/inicio" className="mx-lg-3 mx-0 text-lg-end text-start navbar-brand">
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
          {/* Usamos justify-content-between para empujar el logout a la derecha */}
          <div className="justify-content-between navbar-collapse collapse" id="navbarOffcanvas">
            {/* ENLACES DE NAVEGACIÓN */}
            <div className="d-none d-lg-flex navbar-nav">
              <Link to="/inicio" className="nav-link">Inicio</Link>
              <Link to="/usuarios" className="nav-link">Administrar Usuarios</Link>
              <Link to="/taxis" className="nav-link">Administrar Taxis</Link>
              <Link to="/incidencias" className="nav-link">Administrar Incidencias</Link>
              <Link to="/acuerdo" className="nav-link">Administrar Acuerdos</Link>
              <Link to="/reports" className="nav-link">Administrar Reportes</Link>
            </div>

            {/* 3. SECCIÓN DE USUARIO Y LOGOUT */}
            <div className="d-none d-lg-flex align-items-center">
             
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

export default Navbar;