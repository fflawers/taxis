import { useEffect, useState } from "react";
import Navbar from "../Nabvars/Nabvar";
import IndexFooter from "../Footers/IndexFooter";

function IncidenciasPage() {
  const [incidencias, setIncidencias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  // ✅ CORREGIDO: Estado inicial con minúsculas
  const [form, setForm] = useState({ descripcion: "", observaciones: "", no_lista: "" });

  const [incidenciaAEditar, setIncidenciaAEditar] = useState(null);
  const [formEdicion, setFormEdicion] = useState(null);

  const fetchIncidencias = async () => {
    try {
      const res = await fetch("http://localhost:3000/incidencias");
      const data = await res.json();
      setIncidencias(data);
    } catch (error) {
      console.error("Error al obtener incidencias:", error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const res = await fetch("http://localhost:3000/usuarios/taxistas");
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
      const res = await fetch("http://localhost:3000/incidencias", {
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
      const res = await fetch(`http://localhost:3000/incidencias/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchIncidencias();
    } catch (error) {
      console.error("Error al eliminar incidencia:", error);
      alert(`Error: ${error.message}`);
    }
  };

  // ✅ CORREGIDO: Previene error de input no controlado
  const handleEditClick = (incidencia) => {
    setIncidenciaAEditar(incidencia);
    setFormEdicion({
      descripcion: incidencia.descripcion || '',
      observaciones: incidencia.observaciones || '', // Corregido
      no_lista: incidencia.no_lista || ''
    });
  };

  const handleEditChange = (e) => {
    setFormEdicion({ ...formEdicion, [e.target.name]: e.target.value });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const id = incidenciaAEditar.id_incidencia;
    if (!formEdicion.no_lista) {
        alert("Por favor, selecciona un conductor.");
        return;
    }
    try {
      const res = await fetch(`http://localhost:3000/incidencias/${id}`, {
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
          {/* ✅ CORREGIDO: Atributo 'name' en minúsculas */}
          <form onSubmit={handleSubmit}>
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label">Descripción</label>
                <input type="text" name="descripcion" placeholder="Ej. Falla mecánica" value={form.descripcion} onChange={handleChange} className="form-control" required />
              </div>
              <div className="col-md-3">
                <label className="form-label">Observaciones</label>
                <input type="text" name="observaciones" placeholder="(Opcional)" value={form.observaciones} onChange={handleChange} className="form-control" />
              </div>
              <div className="col-md-3">
                <label className="form-label">Conductor que reporta</label>
                <select name="no_lista" value={form.no_lista} onChange={handleChange} className="form-select" required>
                  <option value="">-- Seleccionar --</option>
                  {/* ✅ CORREGIDO: Muestra datos con claves minúsculas */}
                  {usuarios.map((u) => (
                    <option key={u.no_lista} value={u.no_lista}>{u.nombre} {u.apellido_p}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-primary w-100">Agregar</button>
              </div>
            </div>
          </form>
        </div>

        <h2 className="fw-bold">Incidencias Registradas</h2>
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th><th>Descripción</th><th>Conductor</th><th>Observaciones</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {/* ✅ CORREGIDO: Muestra datos con claves minúsculas */}
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

      {/* ✅ CORREGIDO: Modal con 'name' y 'value' en minúsculas */}
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