import { useEffect, useState } from "react";
import Navbar from "../Nabvars/Nabvar";
import IndexFooter from "../Footers/IndexFooter";

function ReportesPage() {
  // Estados para los datos de la página
  const [reportes, setReportes] = useState([]);
  const [taxistas, setTaxistas] = useState([]);
  const [taxis, setTaxis] = useState([]);
  const [incidencias, setIncidencias] = useState([]);
  const [acuerdos, setAcuerdos] = useState([]);
  
  // Estado para el formulario de creación
  const [form, setForm] = useState({
    no_lista: "", economico: "", Fecha_Reporte: "",
    Observaciones: "", id_incidencia: "", id_acuerdo: ""
  });

  // Estados para el modal de edición
  const [reporteAEditar, setReporteAEditar] = useState(null);
  const [formEdicion, setFormEdicion] = useState(null);

  // --- OBTENCIÓN DE DATOS (FETCH) ---
  const fetchData = async () => {
    try {
      const [repRes, taxRes, taxisRes, incRes, acuRes] = await Promise.all([
        fetch("http://localhost:3000/reportes"),
        fetch("http://localhost:3000/usuarios/taxistas"),
        fetch("http://localhost:3000/taxis"),
        fetch("http://localhost:3000/incidencias"),
        fetch("http://localhost:3000/acuerdos")
      ]);
      setReportes(await repRes.json());
      setTaxistas(await taxRes.json());
      setTaxis(await taxisRes.json());
      setIncidencias(await incRes.json());
      setAcuerdos(await acuRes.json());
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- MANEJADORES DE FORMULARIO CRUD ---
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/reportes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setForm({ no_lista: "", economico: "", Fecha_Reporte: "", Observaciones: "", id_incidencia: "", id_acuerdo: "" });
      fetchData(); // Recarga todos los datos
    } catch (error) {
      console.error("Error al crear reporte:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este reporte?")) return;
    try {
      const res = await fetch(`http://localhost:3000/reportes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).message);
      fetchData();
    } catch (error) {
      console.error("Error al eliminar reporte:", error);
      alert(`Error: ${error.message}`);
    }
  };

  // --- MANEJADORES DE EDICIÓN ---
  const handleEditClick = (reporte) => {
    setReporteAEditar(reporte);
    // Formatear la fecha para el input type="date"
    const fechaFormateada = new Date(reporte.Fecha_Reporte).toISOString().split('T')[0];
    setFormEdicion({ ...reporte, Fecha_Reporte: fechaFormateada });
  };

  const handleEditChange = (e) => {
    setFormEdicion({ ...formEdicion, [e.target.name]: e.target.value });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3000/reportes/${reporteAEditar.id_reporte}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formEdicion)
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setReporteAEditar(null);
      fetchData();
    } catch (error) {
      console.error("Error al actualizar reporte:", error);
      alert(`Error: ${error.message}`);
    }
  };
  
  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <h1 className="text-center fw-bold">Gestión de Reportes</h1>

        {/* Formulario para agregar */}
        <div className="card p-3 my-4">
            <h2 className="fw-bold">Generar Nuevo Reporte</h2>
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Conductor</label>
                <select name="no_lista" value={form.no_lista} onChange={handleChange} className="form-select" required>
                  <option value="">-- Seleccionar --</option>
                  {taxistas.map(t => <option key={t.no_lista} value={t.no_lista}>{t.nombre} {t.apellido_P}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Taxi (Económico)</label>
                <select name="economico" value={form.economico} onChange={handleChange} className="form-select" required>
                  <option value="">-- Seleccionar --</option>
                  {taxis.map(t => <option key={t.economico} value={t.economico}>#{t.economico} - {t.Placa}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Fecha del Reporte</label>
                <input type="date" name="Fecha_Reporte" value={form.Fecha_Reporte} onChange={handleChange} className="form-control" required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Incidencia</label>
                <select name="id_incidencia" value={form.id_incidencia} onChange={handleChange} className="form-select" required>
                  <option value="">-- Seleccionar --</option>
                  {incidencias.map(i => <option key={i.id_incidencia} value={i.id_incidencia}>{i.descripcion}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Acuerdo</label>
                <select name="id_acuerdo" value={form.id_acuerdo} onChange={handleChange} className="form-select" required>
                  <option value="">-- Seleccionar --</option>
                  {acuerdos.map(a => <option key={a.id_acuerdo} value={a.id_acuerdo}>{a.Descripcion.substring(0, 50)}...</option>)}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Observaciones</label>
                <textarea name="Observaciones" value={form.Observaciones} onChange={handleChange} className="form-control" rows="3"></textarea>
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-primary">Guardar Reporte</button>
              </div>
            </form>
        </div>

       {/* Tabla de reportes */}
        <h2 className="fw-bold">Historial de Reportes</h2>
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Conductor</th>
                <th>Taxi (Placa)</th>
                <th>Incidencia</th>
                {/* ✅ --- NUEVO ENCABEZADO --- */}
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reportes.map((rep) => (
                <tr key={rep.id_reporte}>
                  <td>{rep.id_reporte}</td>
                  <td>{new Date(rep.Fecha_Reporte).toLocaleDateString()}</td>
                  <td>{rep.nombre_conductor}</td>
                  <td>{rep.placa_taxi}</td>
                  <td>{rep.incidencia_descripcion}</td>
                  {/* ✅ --- NUEVA CELDA DE DATOS --- */}
                  {/* Usamos substring para no hacer la columna demasiado ancha */}
                  <td>{rep.Observaciones ? rep.Observaciones.substring(0, 40) + '...' : 'N/A'}</td>
                  <td>
                    <button className="btn btn-sm btn-info me-2" onClick={() => handleEditClick(rep)}>Editar</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(rep.id_reporte)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de edición (similar al formulario de creación) */}
      {reporteAEditar && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editando Reporte #{reporteAEditar.id_reporte}</h5>
                <button type="button" className="btn-close" onClick={() => setReporteAEditar(null)}></button>
              </div>
              <form onSubmit={handleUpdateSubmit}>
                <div className="modal-body row g-3">
                  {/* ... campos del formulario idénticos a los de creación, pero usando formEdicion y handleEditChange ... */}
                  <div className="col-md-6">
                    <label className="form-label">Conductor</label>
                    <select name="no_lista" value={formEdicion.no_lista} onChange={handleEditChange} className="form-select" required>
                      <option value="">-- Seleccionar --</option>
                      {taxistas.map(t => <option key={t.no_lista} value={t.no_lista}>{t.nombre} {t.apellido_P}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Taxi (Económico)</label>
                    <select name="economico" value={formEdicion.economico} onChange={handleEditChange} className="form-select" required>
                      <option value="">-- Seleccionar --</option>
                      {taxis.map(t => <option key={t.economico} value={t.economico}>#{t.economico} - {t.Placa}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Fecha del Reporte</label>
                    <input type="date" name="Fecha_Reporte" value={formEdicion.Fecha_Reporte} onChange={handleEditChange} className="form-control" required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Incidencia</label>
                    <select name="id_incidencia" value={formEdicion.id_incidencia} onChange={handleEditChange} className="form-select" required>
                      <option value="">-- Seleccionar --</option>
                      {incidencias.map(i => <option key={i.id_incidencia} value={i.id_incidencia}>{i.descripcion}</option>)}
                    </select>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">Acuerdo</label>
                    <select name="id_acuerdo" value={formEdicion.id_acuerdo} onChange={handleEditChange} className="form-select" required>
                      <option value="">-- Seleccionar --</option>
                      {acuerdos.map(a => <option key={a.id_acuerdo} value={a.id_acuerdo}>{a.Descripcion.substring(0, 70)}...</option>)}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Observaciones</label>
                    <textarea name="Observaciones" value={formEdicion.Observaciones} onChange={handleEditChange} className="form-control" rows="3"></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setReporteAEditar(null)}>Cancelar</button>
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

export default ReportesPage;