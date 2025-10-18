import { useEffect, useState } from "react";
import Navbar from "../Nabvars/Nabvar";
import IndexFooter from "../Footers/IndexFooter";
// Puedes agregar un poco de CSS para el modal si lo deseas
// import './Modal.css'; 

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

  // ✅ --- NUEVOS ESTADOS PARA LA EDICIÓN ---
  // Guarda el objeto del usuario que se está editando
  const [usuarioAEditar, setUsuarioAEditar] = useState(null);
  // Controla el estado del formulario de edición
  const [formEdicion, setFormEdicion] = useState(null);

  // Traer todos los usuarios
  const fetchUsuarios = () => {
    fetch("http://localhost:3000/usuarios")
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Manejar cambios en el formulario de CREACIÓN
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Crear usuario
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

  // Eliminar usuario
  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
        fetch(`http://localhost:3000/usuarios/${id}`, { method: "DELETE" })
        .then((res) => res.json())
        .then(() => fetchUsuarios())
        .catch((err) => console.error(err));
    }
  };

  // ✅ --- NUEVAS FUNCIONES PARA LA EDICIÓN ---

  // 1. Abre el modal y carga los datos del usuario en el formulario de edición
  const handleEditClick = (usuario) => {
    setUsuarioAEditar(usuario);
    setFormEdicion({ ...usuario, contrasena: "" }); // Limpiamos la contraseña por seguridad
  };

  // 2. Maneja los cambios en los inputs del formulario de edición
  const handleEditChange = (e) => {
    setFormEdicion({ ...formEdicion, [e.target.name]: e.target.value });
  };
  
  // 3. Envía los datos actualizados al backend
  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    // El id del usuario que estamos editando
    const id = usuarioAEditar.no_lista;
    
    // Si el campo contraseña está vacío, no lo enviamos para que el backend no la actualice
    const datosAEnviar = { ...formEdicion };
    if (!datosAEnviar.contrasena) {
      delete datosAEnviar.contrasena;
    }

    fetch(`http://localhost:3000/usuarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosAEnviar),
    })
    .then(res => res.json())
    .then(data => {
        console.log(data.message);
        setUsuarioAEditar(null); // Cierra el modal
        fetchUsuarios(); // Recarga la lista de usuarios
    })
    .catch(err => console.error(err));
  };


  return (
    <div>
      <Navbar />
      <h1 className="container text-center mt-4 fw-bold">Gestión de Usuarios</h1>

      {/* --- FORMULARIO PARA CREAR USUARIOS (SIN CAMBIOS) --- */}
      <h2 className="fw-bold container">Crear Nuevo Usuario:</h2>
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

      {/* --- LISTA DE USUARIOS ACTIVOS (CON BOTÓN DE EDITAR) --- */}
      <div className="container">
        <h2 className="fw-bold">Usuarios activos:</h2>
        <ul className="list-group">
          {usuarios.map((u) => (
            <li className="list-group-item d-flex justify-content-between align-items-center" key={u.no_lista}>
              <span>{u.nombre} {u.apellido_P} ({u.rol})</span>
              <div>
                <button
                  className="btn mx-2 btn-sm btn-info"
                  onClick={() => handleEditClick(u)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(u.no_lista)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ✅ --- MODAL DE EDICIÓN --- */}
      {/* Este bloque solo se renderiza si `usuarioAEditar` no es nulo */}
      {usuarioAEditar && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editando a {usuarioAEditar.nombre}</h5>
                <button type="button" className="btn-close" onClick={() => setUsuarioAEditar(null)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdateSubmit}>
                  {/* Inputs para cada campo del usuario */}
                  <div className="mb-3">
                    <label className="form-label">Rol</label>
                    <input type="text" name="rol" value={formEdicion.rol} onChange={handleEditChange} className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input type="text" name="nombre" value={formEdicion.nombre} onChange={handleEditChange} className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Apellido Paterno</label>
                    <input type="text" name="apellido_P" value={formEdicion.apellido_P} onChange={handleEditChange} className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Apellido Materno</label>
                    <input type="text" name="apellido_M" value={formEdicion.apellido_M} onChange={handleEditChange} className="form-control" />
                  </div>
                   <div className="mb-3">
                    <label className="form-label">Edad</label>
                    <input type="number" name="Edad" value={formEdicion.Edad} onChange={handleEditChange} className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nueva Contraseña (dejar en blanco para no cambiar)</label>
                    <input type="password" name="contrasena" value={formEdicion.contrasena} onChange={handleEditChange} className="form-control" />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setUsuarioAEditar(null)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <IndexFooter />
    </div>
  );
}

export default UsuariosPage;