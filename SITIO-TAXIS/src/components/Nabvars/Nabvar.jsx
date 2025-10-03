// src/components/Navbar.jsx
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="nabvar-1 text-center">
        <div className="justify-content-center">
      <Link to="/" className="text-nav">Inicio</Link>
      <Link to="/usuarios" className="text-nav">Administrar Usuarios</Link>
      <Link to="/taxis" className="text-nav">Administrar Taxis</Link>
      {/* Aquí añadirás más enlaces para Reportes, Incidencias, etc. */}
      </div>
    </nav>
  );
}

export default Navbar;