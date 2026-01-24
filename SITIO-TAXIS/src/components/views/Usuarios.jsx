import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Nabvars/Nabvar";
import IndexFooter from "../Footers/IndexFooter";
import { useAuth } from "../secure/AuthContext";
import SearchIcon from "../Icons/SearchIcon";
import HomeIcon from "../Icons/HomeIcon";
import UserIcon from "../Icons/UserIcon";

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const { user } = useAuth();


  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/usuarios`)
      .then(res => res.json())
      .then(data => setUsuarios(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <Navbar />
      <h1 className="container mt-4 text-center">Hola, {user?.nombre}</h1>

      <div className="d-flex justify-content-center align-items-center gap-4 my-4">
        <Link to="/gestion" className="mx-0 text-center navbar-brand">
          <HomeIcon color="#000000" width={90} height={90} />
          <p>Gestion de usuarios</p>
        </Link>


        <Link to="/reporte" className="mx-0 text-center navbar-brand">
          <UserIcon color="#000000" width={90} height={90} />
          <p>Reportes de usuarios</p>
        </Link>


        <Link to="/dashbor" className="mx-0 text-center navbar-brand">
          <SearchIcon color="#000000" width={90} height={90} />
          <p>Dashboard de usuarios</p>
        </Link>




      </div>
      {/* <ul className="container fw-bolder my-4">
        {usuarios.map(u => (
          <li key={u.no_lista}>
            {u.nombre} {u.apellido_P} {u.apellido_M} - {u.rol}
          </li>
        ))}
      </ul> */}
      <IndexFooter />
    </div>
  );
}

export default Usuarios;
