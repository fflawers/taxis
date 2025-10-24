import { useEffect, useState } from "react";
import Navbar from "../Nabvars/Nabvar";
import IndexFooter from "../Footers/IndexFooter";

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);

  // ✅ CORREGIDO: Estado del formulario con claves en minúsculas
  const [form, setForm] = useState({
    rol: "",
    contrasena: "",
    nombre: "",
    apellido_p: "",
    apellido_m: "",
    edad: "",
    fecha_de_nacimiento: "",
  });

  const [usuarioAEditar, setUsuarioAEditar] = useState(null);
  const [formEdicion, setFormEdicion] = useState(null);

  const fetchUsuarios = () => {
    fetch(`${import.meta.env.VITE_API_URL}/usuarios`)
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${import.meta.env.VITE_API_URL}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form), // 'form' ya tiene las claves en minúsculas
    })
      .then((res) => {
        if (!res.ok) { // Si la respuesta no es exitosa (ej. 400)
            return res.json().then(err => { throw new Error(err.message) });
        }
        return res.json();
      })
      .then(() => {
        // Reseteamos el formulario a su estado inicial
        setForm({
          rol: "", contrasena: "", nombre: "", apellido_p: "",
          apellido_m: "", edad: "", fecha_de_nacimiento: "",
        });
        fetchUsuarios();
      })
      .catch((err) => console.error("Error al crear usuario:", err));
  };

  const handleDelete = (id) => {
    fetch(`${import.meta.env.VITE_API_URL}/usuarios/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => fetchUsuarios())
      .catch((err) => console.error(err));
  };

  // ✅ CORREGIDO: Asegura que ningún valor sea null/undefined para evitar error de input no controlado
  const handleEditClick = (usuario) => {
    setUsuarioAEditar(usuario);
    const usuarioSeguro = {
      rol: usuario.rol || '',
      nombre: usuario.nombre || '',
      apellido_p: usuario.apellido_p || '',
      apellido_m: usuario.apellido_m || '',
      edad: usuario.edad || '',
      fecha_de_nacimiento: usuario.fecha_de_nacimiento || '',
      contrasena: "", // Limpiamos la contraseña por seguridad
    };
    setFormEdicion(usuarioSeguro);
  };

  const handleEditChange = (e) => {
    setFormEdicion({ ...formEdicion, [e.target.name]: e.target.value });
  };
  
  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    const id = usuarioAEditar.no_lista;
    
    const datosAEnviar = { ...formEdicion };
    if (!datosAEnviar.contrasena) {
      delete datosAEnviar.contrasena;
    }

    fetch(`${import.meta.env.VITE_API_URL}/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosAEnviar),
    })
    .then(res => res.json())
    .then(data => {
      console.log("Usuario actualizado");
      setUsuarioAEditar(null);
      fetchUsuarios();
    })
    .catch(err => console.error(err));
  };

  return (
    <div>
      <Navbar />
      <h1 className="container text-center mt-4 fw-bold">Gestión de Usuarios</h1>

      <h2 className="fw-bold container">Crear Nuevo Usuario:</h2>
      {/* ✅ CORREGIDO: Formulario de creación con 'name' en minúsculas */}
      <form onSubmit={handleSubmit} className="container text-center my-4">
        <div className="row g-3 justify-content-center">
          <div className="col-md-3">
            <input className="inputTP" name="rol" placeholder="Rol" value={form.rol} onChange={handleChange} required />
          </div>
          <div className="col-md-3">
            <input className="inputTP" name="contrasena" placeholder="Contraseña" value={form.contrasena} onChange={handleChange} required />
          </div>
          <div className="col-md-3">
            <input className="inputTP" name="nombre" placeholder="Nombre(s)" value={form.nombre} onChange={handleChange} required />
          </div>
          <div className="col-md-3">
            <input className="inputTP" name="apellido_p" placeholder="Apellido Paterno" value={form.apellido_p} onChange={handleChange} required />
          </div>
          <div className="col-md-3">
            <input className="inputTP" name="apellido_m" placeholder="Apellido Materno" value={form.apellido_m} onChange={handleChange} />
          </div>
          <div className="col-md-3">
            <input className="inputTP" name="edad" type="number" placeholder="Edad" value={form.edad} onChange={handleChange} required />
          </div>
          <div className="col-md-3">
            <input className="inputTP" name="fecha_de_nacimiento" type="date" value={form.fecha_de_nacimiento} onChange={handleChange} required />
          </div>
          <div className="col-md-3">
            <button className="btn btn-green" type="submit">Agregar Usuario</button>
          </div>
        </div>
      </form>

      <div className="container">
        <h2 className="fw-bold">Usuarios activos:</h2>
        <ul className="list-group">
          {/* ✅ CORREGIDO: Muestra los datos con claves en minúsculas */}
          {usuarios.map((u) => (
            <li className="list-group-item d-flex justify-content-between align-items-center" key={u.no_lista}>
              <span>ID: {u.no_lista} - {u.nombre} {u.apellido_p} ({u.rol})</span>
              <div>
                <button className="btn mx-2 btn-sm btn-info" onClick={() => handleEditClick(u)}>Editar</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.no_lista)}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ✅ CORREGIDO: Modal de edición con 'name' y 'value' en minúsculas */}
      {usuarioAEditar && formEdicion && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editando a {usuarioAEditar.nombre}</h5>
                <button type="button" className="btn-close" onClick={() => setUsuarioAEditar(null)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdateSubmit}>
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
                    <input type="text" name="apellido_p" value={formEdicion.apellido_p} onChange={handleEditChange} className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Apellido Materno</label>
                    <input type="text" name="apellido_m" value={formEdicion.apellido_m} onChange={handleEditChange} className="form-control" />
                  </div>
                   <div className="mb-3">
                    <label className="form-label">Edad</label>
                    <input type="number" name="edad" value={formEdicion.edad} onChange={handleEditChange} className="form-control" />
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