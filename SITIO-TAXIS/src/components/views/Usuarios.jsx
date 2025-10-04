import { useEffect, useState } from "react";
import Navbar from "../Nabvars/Nabvar";

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/usuarios") // ruta de tu backend
      .then(res => res.json())
      .then(data => setUsuarios(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
        <Navbar/>
      <h1>Lista de Usuarios</h1>
      <ul>
       {usuarios.map(u => (
          <li key={u.no_lista}>
           {u.nombre} {u.apellido_P} {u.apellido_M} - {u.rol}
          </li>
        ))}
     </ul>
   </div>
 );
 }

 export default Usuarios;
