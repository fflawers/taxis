import { useEffect, useState } from "react";
import Navbar from "../Nabvars/Nabvar";
import IndexFooter from "../Footers/IndexFooter";

function IncidenciasPage() {
  const [incidencias, setIncidencias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [form, setForm] = useState({ descripcion: "", observaciones: "", no_lista: "" });

  const [incidenciaAEditar, setIncidenciaAEditar] = useState(null);
  const [formEdicion, setFormEdicion] = useState(null);

  // 1. MANEJO DE ERRORES MEJORADO EN FETCH INCIDENCIAS
  const fetchIncidencias = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/incidencias`);

      if (!res.ok) {
        let errorMsg = 'Error desconocido del servidor al obtener incidencias';
        try {
          const errData = await res.json();
          errorMsg = errData.message || errData.error || errorMsg;
        } catch (e) {
          errorMsg = `El servidor devolvió un error ${res.status}.`;
        }

        console.error("Error del servidor al obtener incidencias:", errorMsg);
        setIncidencias([]); // <-- Asegura que el estado sea un array
        return;
      }

      const data = await res.json();
      // Asegura que data sea un array (o lo convierte a uno si es null/undefined, aunque la API debería devolver [])
      setIncidencias(Array.isArray(data) ? data : []); 
    } catch (error) {
      console.error("Error de red al obtener incidencias:", error);
      setIncidencias([]); // <-- Asegura que el estado sea un array
    }
  };

  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/taxistas`);
      if (!res.ok) {
        console.error("Error al obtener usuarios:", res.status);
        setUsuarios([]);
        return;
      }
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  useEffect(() => {
    fetchIncidencias();
    fetchUsuarios();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.no_lista) {
      alert("Por favor, selecciona un conductor.");
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/incidencias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Error al crear incidencia');
      }
      setForm({ descripcion: "", observaciones: "", no_lista: "" });
      fetchIncidencias();
    } catch (error) {
      console.error("Error al crear incidencia:", error);
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/incidencias/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchIncidencias();
    } catch (error) {
      console.error("Error al eliminar incidencia:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleEditClick = (incidencia) => {
    setIncidenciaAEditar(incidencia);
    setFormEdicion({
      descripcion: incidencia.descripcion || '',
      observaciones: incidencia.observaciones || '', 
      no_lista: incidencia.no_lista || ''
    });
  };

  const handleEditChange = (e) => {
    setFormEdicion({ ...formEdicion, [e.target.name]: e.target.value });
  };

  // 2. RUTA DE ACTUALIZACIÓN CORREGIDA
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const id = incidenciaAEditar.id_incidencia;
    if (!formEdicion.no_lista) {
      alert("Por favor, selecciona un conductor.");
      return;
    }
    try {
      // RUTA CORREGIDA: debe ser /incidencias/:id
      const res = await fetch(`${import.meta.env.VITE_API_URL}/incidencias/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formEdicion),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Error al actualizar incidencia');
      }
      setIncidenciaAEditar(null);
      fetchIncidencias();
    } catch (error) {
      console.error("Error al actualizar incidencia:", error);
      alert(error.message);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <h1 className="text-center fw-bold">Gestión de Incidencias</h1>
        <div className="card p-3 my-4">
          <h2 className="fw-bold">Agregar Nueva Incidencia</h2>
          <form onSubmit={handleSubmit}>
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label">Descripción</label>
                <input type="text" name="descripcion" placeholder="Ej. Falla mecánica" value={form.descripcion} onChange={handleChange} className="inputTP" required />
              </div>
              <div className="col-md-3">
                <label className="form-label">Observaciones</label>
                <input type="text" name="observaciones" placeholder="(Opcional)" value={form.observaciones} onChange={handleChange} className="inputTP" />
              </div>
              <div className="col-md-3">
                <label className="form-label">Conductor que reporta</label>
                <select name="no_lista" value={form.no_lista} onChange={handleChange} className="inputTP" required>
                  <option value="">-- Seleccionar --</option>
                  {usuarios.map((u) => (
                    <option key={u.no_lista} value={u.no_lista}>{u.nombre} {u.apellido_p}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-green ">Agregar</button>
              </div>
            </div>
          </form>
        </div>

        <h2 className="fw-bold">Incidencias Registradas</h2>
        <div className="table-responsive my-5">
          <table className="table table-bordered table-hover align-middle text-center">
            <thead>
              <tr>
                <th>ID</th><th>Descripción</th><th>Conductor</th><th>Observaciones</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {/* Se evita el error .map porque el estado ahora siempre es un array */}
              {incidencias.map((inc) => (
                <tr key={inc.id_incidencia}>
                  <td>{inc.id_incidencia}</td>
                  <td>{inc.descripcion}</td>
                  <td>{inc.nombre_conductor || <span className="text-muted">No asignado</span>}</td>
                  <td>{inc.observaciones}</td>
                  <td>
                    <button className="btn btn-sm btn-info me-2" onClick={() => handleEditClick(inc)}>Editar</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(inc.id_incidencia)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {incidenciaAEditar && formEdicion && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editando Incidencia #{incidenciaAEditar.id_incidencia}</h5>
                <button type="button" className="btn-close" onClick={() => setIncidenciaAEditar(null)}></button>
              </div>
              <form onSubmit={handleUpdateSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <input type="text" name="descripcion" value={formEdicion.descripcion} onChange={handleEditChange} className="form-control" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Conductor</label>
                    <select name="no_lista" value={formEdicion.no_lista} onChange={handleEditChange} className="form-select" required>
                      <option value="">-- Reasignar --</option>
                      {usuarios.map((u) => (
                        <option key={u.no_lista} value={u.no_lista}>{u.nombre} {u.apellido_p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Observaciones</label>
                    <input type="text" name="observaciones" value={formEdicion.observaciones} onChange={handleEditChange} className="form-control"/>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setIncidenciaAEditar(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <IndexFooter />
    </div>
  );
}

export default IncidenciasPage;