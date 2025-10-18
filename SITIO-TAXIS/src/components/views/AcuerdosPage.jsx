import { useEffect, useState } from "react";
import Navbar from "../Nabvars/Nabvar";
import IndexFooter from "../Footers/IndexFooter";

function AcuerdosPage() {
  const [acuerdos, setAcuerdos] = useState([]);
  const [incidencias, setIncidencias] = useState([]); // <-- Para el selector
  const [form, setForm] = useState({ Descripcion: "", id_incidencia: "" });

  // Estados para el modal de edición
  const [acuerdoAEditar, setAcuerdoAEditar] = useState(null);
  const [formEdicion, setFormEdicion] = useState(null);

  // --- FUNCIONES DE OBTENCIÓN DE DATOS ---
  const fetchAcuerdos = async () => {
    try {
      const res = await fetch("http://localhost:3000/acuerdos");
      const data = await res.json();
      setAcuerdos(data);
    } catch (error) { console.error("Error al obtener acuerdos:", error); }
  };

  const fetchIncidencias = async () => {
    try {
      const res = await fetch("http://localhost:3000/incidencias");
      const data = await res.json();
      setIncidencias(data);
    } catch (error) { console.error("Error al obtener incidencias:", error); }
  };

  useEffect(() => {
    fetchAcuerdos();
    fetchIncidencias();
  }, []);

  // --- MANEJADORES DE FORMULARIO CRUD ---
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id_incidencia) {
      alert("Por favor, selecciona una incidencia.");
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/acuerdos", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error al crear el acuerdo");
      setForm({ Descripcion: "", id_incidencia: "" });
      fetchAcuerdos();
    } catch (error) { console.error("Error al crear acuerdo:", error); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que quieres eliminar este acuerdo?")) {
      try {
        const res = await fetch(`http://localhost:3000/acuerdos/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        fetchAcuerdos();
      } catch (error) {
        console.error("Error al eliminar acuerdo:", error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  // --- MANEJADORES DE EDICIÓN ---
  const handleEditClick = (acuerdo) => {
    setAcuerdoAEditar(acuerdo);
    setFormEdicion({ ...acuerdo });
  };

  const handleEditChange = (e) => {
    setFormEdicion({ ...formEdicion, [e.target.name]: e.target.value });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const id = acuerdoAEditar.id_acuerdo;
    try {
      const res = await fetch(`http://localhost:3000/acuerdos/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formEdicion),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      setAcuerdoAEditar(null);
      fetchAcuerdos();
    } catch (error) { console.error("Error al actualizar acuerdo:", error); }
  };

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <h1 className="text-center fw-bold">Gestión de Acuerdos</h1>

        {/* Formulario para agregar */}
        <div className="card p-3 my-4">
            <h2 className="fw-bold">Registrar Nuevo Acuerdo</h2>
            <form onSubmit={handleSubmit}>
                <div className="row g-3 align-items-end">
                    <div className="col-md-6">
                        <label className="form-label">Descripción del Acuerdo</label>
                        <textarea
                            name="Descripcion" placeholder="Describe el acuerdo o la resolución..."
                            value={form.Descripcion} onChange={handleChange}
                            className="form-control" rows="3" required
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Incidencia Relacionada</label>
                        <select name="id_incidencia" value={form.id_incidencia} onChange={handleChange} className="form-select" required>
                            <option value="">-- Seleccionar Incidencia --</option>
                            {incidencias.map((inc) => (
                                <option key={inc.id_incidencia} value={inc.id_incidencia}>
                                    {inc.id_incidencia} - {inc.descripcion}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <button type="submit" className="btn btn-primary w-100">Agregar</button>
                    </div>
                </div>
            </form>
        </div>

        {/* Tabla de acuerdos */}
        <h2 className="fw-bold">Acuerdos Existentes</h2>
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Descripción del Acuerdo</th>
                <th>Incidencia Relacionada</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {acuerdos.map((ac) => (
                <tr key={ac.id_acuerdo}>
                  <td>{ac.id_acuerdo}</td>
                  <td>{ac.Descripcion}</td>
                  <td>{ac.incidencia_descripcion || <span className="text-muted">No especificada</span>}</td>
                  <td>
                    <button className="btn btn-sm btn-info me-2" onClick={() => handleEditClick(ac)}>Editar</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(ac.id_acuerdo)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de edición */}
      {acuerdoAEditar && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editando Acuerdo #{acuerdoAEditar.id_acuerdo}</h5>
                <button type="button" className="btn-close" onClick={() => setAcuerdoAEditar(null)}></button>
              </div>
              <form onSubmit={handleUpdateSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea name="Descripcion" value={formEdicion.Descripcion} onChange={handleEditChange} className="form-control" rows="3" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Incidencia Relacionada</label>
                    <select name="id_incidencia" value={formEdicion.id_incidencia} onChange={handleEditChange} className="form-select" required>
                        <option value="">-- Seleccionar Incidencia --</option>
                        {incidencias.map((inc) => (
                            <option key={inc.id_incidencia} value={inc.id_incidencia}>
                                {inc.descripcion}
                            </option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setAcuerdoAEditar(null)}>Cancelar</button>
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

export default AcuerdosPage;