import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../secure/AuthContext";
import { useState } from 'react'; 

function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // 2. Estado para manejar el menú responsive
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 3. Función para cambiar el estado del menú
  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  return (
    <div className="index-navbar glass_nav">
      <nav className="pt-2 transition-all navbar navbar-expand-lg navbar-light">
        <div className="backgroundResponsive navbar-default py-1 container">
          <Link to="/inicio" className="mx-0 text-center navbar-brand">
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
            className="hamburger navbar-toggler" 
            onClick={handleNavCollapse} 
            aria-expanded={!isNavCollapsed} 
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          {/* 6. Clases dinámicas para mostrar/ocultar el menú */}
          <div 
            className={`justify-content-between navbar-collapse ${isNavCollapsed ? 'collapse' : ''}`} 
            id="navbarOffcanvas"
          >
            {/* 7. Clases MODIFICADAS para mostrar en móvil */}
            <div className="navbar-nav me-auto mb-2 mb-lg-0">
              {/* Añadimos un onClick para cerrar el menú al navegar en móvil */}
              <Link to="/inicio" className="nav-link" onClick={() => setIsNavCollapsed(true)}>Inicio</Link>
              <Link to="/usuarios" className="nav-link" onClick={() => setIsNavCollapsed(true)}>Administrar Usuarios</Link>
              <Link to="/taxis" className="nav-link" onClick={() => setIsNavCollapsed(true)}>Administrar Taxis</Link>
              <Link to="/incidencias" className="nav-link" onClick={() => setIsNavCollapsed(true)}>Administrar Incidencias</Link>
              <Link to="/acuerdo" className="nav-link" onClick={() => setIsNavCollapsed(true)}>Administrar Acuerdos</Link>
              <Link to="/reports" className="nav-link" onClick={() => setIsNavCollapsed(true)}>Administrar Reportes</Link>
            </div>

            {/* 8. Clases MODIFICADAS para mostrar en móvil (con margen) */}
            <div className="d-flex align-items-center mt-3 mt-lg-0">
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
