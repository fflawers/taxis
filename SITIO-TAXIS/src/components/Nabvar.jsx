// src/components/Navbar.jsx
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
      <Link to="/" style={{ marginRight: '15px' }}>Inicio</Link>
      <Link to="/usuarios" style={{ marginRight: '15px' }}>Administrar Usuarios</Link>
      <Link to="/taxis">Administrar Taxis</Link>
      {/* Aquí añadirás más enlaces para Reportes, Incidencias, etc. */}
    </nav>
  );
}

export default Navbar;