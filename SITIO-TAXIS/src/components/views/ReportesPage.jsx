import { useEffect, useState } from "react";
// Navigation handled by AdminLayout's Sidebar

function ReportesPage() {
  const [reportes, setReportes] = useState([]);
  const [taxistas, setTaxistas] = useState([]);
  const [taxis, setTaxis] = useState([]);
  const [incidencias, setIncidencias] = useState([]);
  const [acuerdos, setAcuerdos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    no_lista: "", economico: "", fecha_reporte: "",
    observaciones: "", id_incidencia: "", id_acuerdo: ""
  });

  const [reporteAEditar, setReporteAEditar] = useState(null);
  const [formEdicion, setFormEdicion] = useState(null);

  const baseUrl = import.meta.env.VITE_API_URL;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [repRes, taxRes, taxisRes, incRes, acuRes] = await Promise.all([
        fetch(`${baseUrl}/reportes`),
        fetch(`${baseUrl}/usuarios/taxistas`),
        fetch(`${baseUrl}/taxis`),
        fetch(`${baseUrl}/incidencias`),
        fetch(`${baseUrl}/acuerdos`)
      ]);
      setReportes(await repRes.json());
      setTaxistas(await taxRes.json());
      setTaxis(await taxisRes.json());
      setIncidencias(await incRes.json());
      setAcuerdos(await acuRes.json());
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${baseUrl}/reportes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setForm({ no_lista: "", economico: "", fecha_reporte: "", observaciones: "", id_incidencia: "", id_acuerdo: "" });
      fetchData();
    } catch (error) {
      console.error("Error al crear reporte:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este reporte?")) return;
    try {
      const res = await fetch(`${baseUrl}/reportes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).message);
      fetchData();
    } catch (error) {
      console.error("Error al eliminar reporte:", error);
      alert(`Error: ${error.message}`);
    }
  };

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
      const res = await fetch(`${baseUrl}/reportes/${reporteAEditar.id_reporte}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <header className="page-header">
        <h1 className="page-title">📋 Gestión de Reportes</h1>
        <p className="page-subtitle">Registro y seguimiento de reportes de incidentes</p>
      </header>

      {/* Form to create new report */}
      <div className="glass-card mb-3 animate-fade-in">
        <div className="glass-card-header">
          <h3 className="glass-card-title">➕ Nuevo Reporte</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Conductor</label>
              <select name="no_lista" value={form.no_lista} onChange={handleChange} className="form-control form-select" required>
                <option value="">-- Seleccionar --</option>
                {taxistas.map(t => (
                  <option key={t.no_lista} value={t.no_lista}>{t.nombre} {t.apellido_p}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Taxi (Económico)</label>
              <select name="economico" value={form.economico} onChange={handleChange} className="form-control form-select" required>
                <option value="">-- Seleccionar --</option>
                {taxis.map(t => (
                  <option key={t.economico} value={t.economico}>#{t.economico} - {t.placa}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Fecha del Reporte</label>
              <input type="date" name="fecha_reporte" value={form.fecha_reporte} onChange={handleChange} className="form-control" required />
            </div>
            <div className="form-group">
              <label className="form-label">Incidencia</label>
              <select name="id_incidencia" value={form.id_incidencia} onChange={handleChange} className="form-control form-select" required>
                <option value="">-- Seleccionar --</option>
                {incidencias.map(i => (
                  <option key={i.id_incidencia} value={i.id_incidencia}>{i.descripcion}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Acuerdo</label>
              <select name="id_acuerdo" value={form.id_acuerdo} onChange={handleChange} className="form-control form-select" required>
                <option value="">-- Seleccionar --</option>
                {acuerdos.map(a => (
                  <option key={a.id_acuerdo} value={a.id_acuerdo}>{(a.descripcion || '').substring(0, 50)}...</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Observaciones</label>
              <input type="text" name="observaciones" value={form.observaciones} onChange={handleChange} className="form-control" placeholder="Detalles adicionales..." />
            </div>
          </div>
          <div className="mt-2" style={{ textAlign: 'right' }}>
            <button type="submit" className="btn btn-primary">✅ Guardar Reporte</button>
          </div>
        </form>
      </div>

      {/* Reports Table */}
      <div className="glass-card animate-fade-in">
        <div className="glass-card-header">
          <h3 className="glass-card-title">📜 Historial de Reportes</h3>
          <span className="badge badge-info">{reportes.length} registros</span>
        </div>

        {loading ? (
          <div className="animate-stagger">
            {[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-table-row"></div>)}
          </div>
        ) : reportes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p className="empty-state-title">No hay reportes registrados</p>
            <p className="empty-state-text">Crea tu primer reporte para comenzar</p>
          </div>
        ) : (
          <div className="premium-table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Conductor</th>
                  <th>Taxi</th>
                  <th>Incidencia</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody className="animate-stagger">
                {reportes.map((rep) => (
                  <tr key={rep.id_reporte}>
                    <td><strong>#{rep.id_reporte}</strong></td>
                    <td>{formatDate(rep.fecha_reporte)}</td>
                    <td>{rep.nombre_conductor}</td>
                    <td><span className="text-accent">{rep.placa_taxi}</span></td>
                    <td>{rep.incidencia_descripcion}</td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEditClick(rep)}>
                          ✏️ Editar
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(rep.id_reporte)}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {reporteAEditar && formEdicion && (
        <div className="modal-overlay" onClick={() => setReporteAEditar(null)}>
          <div className="modal-content" style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">✏️ Editar Reporte #{reporteAEditar.id_reporte}</h3>
              <button className="modal-close" onClick={() => setReporteAEditar(null)}>✕</button>
            </div>
            <form onSubmit={handleUpdateSubmit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Conductor</label>
                    <select name="no_lista" value={formEdicion.no_lista} onChange={handleEditChange} className="form-control form-select" required>
                      <option value="">-- Seleccionar --</option>
                      {taxistas.map(t => (
                        <option key={t.no_lista} value={t.no_lista}>{t.nombre} {t.apellido_p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Taxi</label>
                    <select name="economico" value={formEdicion.economico} onChange={handleEditChange} className="form-control form-select" required>
                      <option value="">-- Seleccionar --</option>
                      {taxis.map(t => (
                        <option key={t.economico} value={t.economico}>#{t.economico} - {t.placa}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fecha</label>
                    <input type="date" name="fecha_reporte" value={formEdicion.fecha_reporte} onChange={handleEditChange} className="form-control" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Incidencia</label>
                    <select name="id_incidencia" value={formEdicion.id_incidencia} onChange={handleEditChange} className="form-control form-select" required>
                      <option value="">-- Seleccionar --</option>
                      {incidencias.map(i => (
                        <option key={i.id_incidencia} value={i.id_incidencia}>{i.descripcion}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Acuerdo</label>
                  <select name="id_acuerdo" value={formEdicion.id_acuerdo} onChange={handleEditChange} className="form-control form-select" required>
                    <option value="">-- Seleccionar --</option>
                    {acuerdos.map(a => (
                      <option key={a.id_acuerdo} value={a.id_acuerdo}>{(a.descripcion || '').substring(0, 70)}...</option>
                    ))}
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Observaciones</label>
                  <textarea
                    name="observaciones"
                    value={formEdicion.observaciones}
                    onChange={handleEditChange}
                    className="form-control"
                    rows="3"
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setReporteAEditar(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  💾 Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportesPage;