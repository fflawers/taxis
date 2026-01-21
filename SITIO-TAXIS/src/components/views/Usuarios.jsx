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
      <h1 className="container mt-4">Hola, {user?.nombre} esta es la lista de usuarios activos:</h1>

      <div className="col-12 mx-auto justify-content-center">
        <Link to="/inicio" className="mx-0 text-center navbar-brand">
          <HomeIcon className="w-8 h-8 text-black" />
        </Link>


        <Link to="/usuarios" className="mx-0 text-center navbar-brand">
          <UserIcon color="#000000" width={32} height={32} />
        </Link>


        <Link to="/incidencias" className="mx-0 text-center navbar-brand">
          <SearchIcon color="#000000" width={32} height={32} />
        </Link>




      </div>
      <ul className="container fw-bolder my-4">
        {usuarios.map(u => (
          <li key={u.no_lista}>
            {u.nombre} {u.apellido_P} {u.apellido_M} - {u.rol}
          </li>
        ))}
      </ul>
      <IndexFooter />
    </div>
  );
}

export default Usuarios;
