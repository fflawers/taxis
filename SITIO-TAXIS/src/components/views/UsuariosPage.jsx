import { useEffect, useState } from "react";
import Navbar from "../Nabvars/Nabvar";
import IndexFooter from "../Footers/IndexFooter";

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({
    rol: "",
    contrasena: "",
    nombre: "",
    apellido_P: "",
    apellido_M: "",
    Edad: "",
    Fecha_de_nacimiento: "",
  });

  // ✅ Traer todos los usuarios
  const fetchUsuarios = () => {
    fetch("http://localhost:3000/usuarios")
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  //  Manejar cambios en el formulario
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  //  Crear usuario
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:3000/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then(() => {
        setForm({
          rol: "",
          contrasena: "",
          nombre: "",
          apellido_P: "",
          apellido_M: "",
          Edad: "",
          Fecha_de_nacimiento: "",
        });
        fetchUsuarios();
      })
      .catch((err) => console.error(err));
  };

  //  Eliminar usuario
  const handleDelete = (id) => {
    fetch(`http://localhost:3000/usuarios/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => fetchUsuarios())
      .catch((err) => console.error(err));
  };

  return (
    <div>
      <Navbar />
      <h1 className="container text-center mt-4 fw-bold">Usuarios</h1>

      <h2 className="fw-bold container">Usuarios nuevos:</h2>
      <form onSubmit={handleSubmit} className="container text-center my-4">
        <div className="row g-3 justify-content-center">
          <div className="col-md-3">
            <input
              className="inputTP"
              name="rol"
              placeholder="Rol"
              value={form.rol}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-3">
            <input
              className="inputTP"
              name="contrasena"
              placeholder="Contraseña"
              value={form.contrasena}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-3">
            <input
              className="inputTP"
              name="nombre"
              placeholder="Nombre(s)"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-3">
            <input
              className="inputTP"
              name="apellido_P"
              placeholder="Apellido Paterno"
              value={form.apellido_P}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-3">
            <input
              className="inputTP"
              name="apellido_M"
              placeholder="Apellido Materno"
              value={form.apellido_M}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-3">
            <input
              className="inputTP"
              name="Edad"
              type="number"
              placeholder="Edad"
              value={form.Edad}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-3">
            <input
              className="inputTP"
              name="Fecha_de_nacimiento"
              type="date"
              value={form.Fecha_de_nacimiento}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-3">
            <button className="btn btn-green" type="submit">
              Agregar Usuario
            </button>
          </div>
        </div>
      </form>

      <div className="container">
        <h2 className="fw-bold">Usuarios activos:</h2>
        <ul className="container">
          {usuarios.map((u) => (
            <li className="textUP" 
            key={u.no_lista}>
              {u.nombre} {u.apellido_P} {u.apellido_M} ({u.rol})
              <button
                className="btn mx-5 btn-md btn-danger"
                onClick={() => handleDelete(u.no_lista)}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </div>
      <IndexFooter />
    </div>
  );
}

export default UsuariosPage;
