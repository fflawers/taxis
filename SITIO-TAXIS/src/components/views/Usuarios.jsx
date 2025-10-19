import { useEffect, useState } from "react";
import Navbar from "../Nabvars/Nabvar";
import IndexFooter from "../Footers/IndexFooter";
import { useAuth } from "../secure/AuthContext";

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
      const { user } = useAuth();
  

  useEffect(() => {
    fetch("http://localhost:3000/usuarios") 
      .then(res => res.json())
      .then(data => setUsuarios(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
        <Navbar/>
      <h1 className="container">Hola, {user?.nombre} esta es la lista de usuarios activos:</h1>
      <ul className="container">
       {usuarios.map(u => (
          <li key={u.no_lista}>
           {u.nombre} {u.apellido_P} {u.apellido_M} - {u.rol}
          </li>
        ))}
     </ul>
     <IndexFooter/>
   </div>
 );
 }

 export default Usuarios;
