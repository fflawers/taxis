import { useEffect, useState } from "react";
import Navbar from "../Nabvars/Nabvar";
import IndexFooter from "../Footers/IndexFooter";

function ReportesPage() {
  const [reportes, setReportes] = useState([]);
  const [taxistas, setTaxistas] = useState([]);
  const [taxis, setTaxis] = useState([]);
  const [incidencias, setIncidencias] = useState([]);
  const [acuerdos, setAcuerdos] = useState([]);

  // ✅ CORREGIDO: Claves en minúsculas
  const [form, setForm] = useState({
    no_lista: "", economico: "", fecha_reporte: "",
    observaciones: "", id_incidencia: "", id_acuerdo: ""
  });

  const [reporteAEditar, setReporteAEditar] = useState(null);
  const [formEdicion, setFormEdicion] = useState(null);

  const fetchData = async () => {
    try {
      const [repRes, taxRes, taxisRes, incRes, acuRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/reportes`),
        fetch(`${import.meta.env.VITE_API_URL}/usuarios/taxistas`),
        fetch(`${import.meta.env.VITE_API_URL}/taxis`),
        fetch(`${import.meta.env.VITE_API_URL}/incidencias`),
        fetch(`${import.meta.env.VITE_API_URL}/acuerdos`)
      ]);
      setReportes(await repRes.json());
      setTaxistas(await taxRes.json());
      setTaxis(await taxisRes.json());
      setIncidencias(await incRes.json());
      setAcuerdos(await acuRes.json());
    } catch (error) { console.error("Error al cargar datos iniciales:", error); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reportes`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setForm({ no_lista: "", economico: "", fecha_reporte: "", observaciones: "", id_incidencia: "", id_acuerdo: "" });
      fetchData();
    } catch (error) { console.error("Error al crear reporte:", error); alert(`Error: ${error.message}`); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este reporte?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reportes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).message);
      fetchData();
    } catch (error) { console.error("Error al eliminar reporte:", error); alert(`Error: ${error.message}`); }
  };

  // ✅ CORREGIDO: Previene error de 'uncontrolled input'
  const handleEditClick = (reporte) => {
    setReporteAEditar(reporte);
    const fechaFormateada = reporte.fecha_reporte ? new Date(reporte.fecha_reporte).toISOString().split('T')[0] : '';
    setFormEdicion({
      no_lista: reporte.no_lista || '',
      economico: reporte.economico || '',
      fecha_reporte: fechaFormateada,
      observaciones: reporte.observaciones || '',
      id_incidencia: reporte.id_incidencia || '',
      id_acuerdo: reporte.id_acuerdo || '',
    });
  };

  const handleEditChange = (e) => {
    setFormEdicion({ ...formEdicion, [e.target.name]: e.target.value });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reportes/${reporteAEditar.id_reporte}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formEdicion)
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setReporteAEditar(null);
      fetchData();
    } catch (error) { console.error("Error al actualizar reporte:", error); alert(`Error: ${error.message}`); }
  };

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <h1 className="text-center fw-bold">Gestión de Reportes</h1>
        <div className="card p-3 my-4">
          <h2 className="fw-bold">Generar Nuevo Reporte</h2>
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-4"><label className="form-label">Conductor</label><select name="no_lista" value={form.no_lista} onChange={handleChange} className="inputTP" required><option value="">-- Seleccionar --</option>{taxistas.map(t => <option key={t.no_lista} value={t.no_lista}>{t.nombre} {t.apellido_p}</option>)}</select></div>
            <div className="col-md-4"><label className="form-label">Taxi (Económico)</label><select name="economico" value={form.economico} onChange={handleChange} className="inputTP" required><option value="">-- Seleccionar --</option>{taxis.map(t => <option key={t.economico} value={t.economico}>#{t.economico} - {t.placa}</option>)}</select></div>
            <div className="col-md-4"><label className="form-label">Fecha del Reporte</label><input type="date" name="fecha_reporte" value={form.fecha_reporte} onChange={handleChange} className="inputTP" required /></div>
            <div className="col-md-6"><label className="form-label">Incidencia</label><select name="id_incidencia" value={form.id_incidencia} onChange={handleChange} className="inputTP" required><option value="">-- Seleccionar --</option>{incidencias.map(i => <option key={i.id_incidencia} value={i.id_incidencia}>{i.descripcion}</option>)}</select></div>
            <div className="col-md-6"><label className="form-label">Acuerdo</label><select name="id_acuerdo" value={form.id_acuerdo} onChange={handleChange} className="inputTP" required><option value="">-- Seleccionar --</option>{acuerdos.map(a => <option key={a.id_acuerdo} value={a.id_acuerdo}>{(a.descripcion || '').substring(0, 50)}...</option>)}</select></div>
            <div className="col-12"><label className="form-label">Observaciones</label><textarea name="observaciones" value={form.observaciones} onChange={handleChange} className="inputTP" rows="3"></textarea></div>
            <div className="col-12"><button type="submit" className="btn btn-green-general w-25">Guardar Reporte</button></div>
          </form>
        </div>
        <h2 className="fw-bold">Historial de Reportes</h2>
        <div className="table-responsive my-5">
          <table className="table table-bordered table-hover align-middle text-center">
            <thead>
              <tr><th>ID</th><th>Fecha</th><th>Conductor</th><th>Taxi (Placa)</th><th>Incidencia</th><th>Observaciones</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {reportes.map((rep) => (
                <tr key={rep.id_reporte}>
                  <td>{rep.id_reporte}</td>
                  <td>{rep.fecha_reporte ? new Date(rep.fecha_reporte).toLocaleDateString() : 'N/A'}</td>
                  <td>{rep.nombre_conductor}</td>
                  <td>{rep.placa_taxi}</td>
                  <td>{rep.incidencia_descripcion}</td>
                  <td>{(rep.observaciones || '').substring(0, 40)}...</td>
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
      {reporteAEditar && formEdicion && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Editando Reporte #{reporteAEditar.id_reporte}</h5><button type="button" className="btn-close" onClick={() => setReporteAEditar(null)}></button></div>
              <form onSubmit={handleUpdateSubmit}>
                <div className="modal-body row g-3">
                  <div className="col-md-6"><label className="form-label">Conductor</label><select name="no_lista" value={formEdicion.no_lista} onChange={handleEditChange} className="form-select" required><option value="">-- Seleccionar --</option>{taxistas.map(t => <option key={t.no_lista} value={t.no_lista}>{t.nombre} {t.apellido_p}</option>)}</select></div>
                  <div className="col-md-6"><label className="form-label">Taxi (Económico)</label><select name="economico" value={formEdicion.economico} onChange={handleEditChange} className="form-select" required><option value="">-- Seleccionar --</option>{taxis.map(t => <option key={t.economico} value={t.economico}>#{t.economico} - {t.placa}</option>)}</select></div>
                  <div className="col-md-6"><label className="form-label">Fecha del Reporte</label><input type="date" name="fecha_reporte" value={formEdicion.fecha_reporte} onChange={handleEditChange} className="form-control" required /></div>
                  <div className="col-md-6"><label className="form-label">Incidencia</label><select name="id_incidencia" value={formEdicion.id_incidencia} onChange={handleEditChange} className="form-select" required><option value="">-- Seleccionar --</option>{incidencias.map(i => <option key={i.id_incidencia} value={i.id_incidencia}>{i.descripcion}</option>)}</select></div>
                  <div className="col-md-12"><label className="form-label">Acuerdo</label><select name="id_acuerdo" value={formEdicion.id_acuerdo} onChange={handleEditChange} className="form-select" required><option value="">-- Seleccionar --</option>{acuerdos.map(a => <option key={a.id_acuerdo} value={a.id_acuerdo}>{(a.descripcion || '').substring(0, 70)}...</option>)}</select></div>
                  <div className="col-12"><label className="form-label">Observaciones</label><textarea name="observaciones" value={formEdicion.observaciones} onChange={handleEditChange} className="form-control" rows="3"></textarea></div>
                </div>
                <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setReporteAEditar(null)}>Cancelar</button><button type="submit" className="btn btn-primary">Guardar Cambios</button></div>
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