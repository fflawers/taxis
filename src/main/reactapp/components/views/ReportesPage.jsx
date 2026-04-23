import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function ReportesPage() {
  const [reportes, setReportes] = useState([]);
  const [taxistas, setTaxistas] = useState([]);
  const [taxis, setTaxis] = useState([]);
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabs state
  const [activeTab, setActiveTab] = useState("ver"); // "ver" or "nuevo"

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterConductor, setFilterConductor] = useState("");
  const [filterIncidencia, setFilterIncidencia] = useState("");

  const [form, setForm] = useState({
    no_lista: "", economico: "", fecha_reporte: "",
    observaciones: "", id_incidencia: ""
    // ❌ Eliminado: id_acuerdo
  });

  const [reporteAEditar, setReporteAEditar] = useState(null);
  const [formEdicion, setFormEdicion] = useState(null);
  const [selectedReporteDetail, setSelectedReporteDetail] = useState(null);

  const baseUrl = import.meta.env.VITE_API_URL;
  const location = useLocation();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [repRes, taxRes, taxisRes, incRes] = await Promise.all([
        fetch(`${baseUrl}/reportes`),
        fetch(`${baseUrl}/usuarios/taxistas`),
        fetch(`${baseUrl}/taxis`),
        fetch(`${baseUrl}/incidencias`)
      ]);
      setReportes(await repRes.json());
      setTaxistas(await taxRes.json());
      setTaxis(await taxisRes.json());
      setIncidencias(await incRes.json());
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Check if we should open new report tab with pre-selected incidencia
    if (location.state?.openNewReport) {
      setActiveTab("nuevo");
      if (location.state?.selectedIncidencia) {
        setForm(prev => ({ ...prev, id_incidencia: location.state.selectedIncidencia.toString() }));
      }
    }
  }, [location.state]);

  // 🎯 AUTO-FILL: Cuando se selecciona incidencia, auto-rellenar datos
  useEffect(() => {
    if (form.id_incidencia && incidencias.length > 0 && taxis.length > 0) {
      const selectedInc = incidencias.find(i => i.id_incidencia === parseInt(form.id_incidencia));

      if (selectedInc) {
        // Auto-seleccionar conductor de la incidencia
        const conductorAutoFilled = selectedInc.no_lista || '';

        // Auto-rellenar observaciones de la incidencia (editables)
        const observacionesAutoFilled = selectedInc.observaciones || '';

        // Intentar auto-seleccionar taxi del conductor
        let taxiAutoFilled = '';
        if (selectedInc.no_lista) {
          const taxisDelConductor = taxis.filter(t => t.no_lista === selectedInc.no_lista);
          if (taxisDelConductor.length === 1) {
            // Solo 1 taxi asignado → auto-seleccionarlo
            taxiAutoFilled = taxisDelConductor[0].economico;
          }
        }

        setForm(prev => ({
          ...prev,
          no_lista: conductorAutoFilled,
          observaciones: observacionesAutoFilled,
          economico: taxiAutoFilled
        }));
      }
    }
  }, [form.id_incidencia, incidencias, taxis]);

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
      setForm({ no_lista: "", economico: "", fecha_reporte: "", observaciones: "", id_incidencia: "" });
      fetchData();
      setActiveTab("ver"); // Switch back to view tab
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
      id_incidencia: reporte.id_incidencia || ''
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

  // Get selected incidencia details for preview
  const selectedIncidencia = incidencias.find(i => i.id_incidencia === parseInt(form.id_incidencia));

  // Check if taxi was auto-filled
  const taxisDelConductor = form.no_lista ? taxis.filter(t => t.no_lista === form.no_lista) : [];
  const taxiAutoFilled = taxisDelConductor.length === 1;

  // Filter reportes
  const filteredReportes = reportes.filter(rep => {
    const matchesSearch = !searchTerm ||
      rep.nombre_conductor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.placa_taxi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.incidencia_descripcion?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesConductor = !filterConductor || rep.no_lista === filterConductor;
    const matchesIncidencia = !filterIncidencia || rep.id_incidencia === parseInt(filterIncidencia);

    return matchesSearch && matchesConductor && matchesIncidencia;
  });

  // Stats
  const reportesThisMonth = reportes.filter(r => {
    if (!r.fecha_reporte) return false;
    const date = new Date(r.fecha_reporte);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="page-container">
      {/* Page Header */}
      <header className="page-header">
        <h1 className="page-title">📋 Gestión de Reportes</h1>
        <p className="page-subtitle">Registro y seguimiento de reportes de incidentes</p>
      </header>

      {/* Tabs Navigation */}
      <div className="glass-card mb-3 animate-fade-in" style={{ padding: 0 }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveTab("ver")}
            className={`tab-button ${activeTab === "ver" ? "active" : ""}`}
            style={{
              flex: 1,
              padding: '1rem 1.5rem',
              background: activeTab === "ver" ? 'var(--color-bg-tertiary)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === "ver" ? '3px solid var(--color-accent)' : '3px solid transparent',
              color: activeTab === "ver" ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'all var(--transition-base)',
            }}
          >
            📋 Ver Reportes
          </button>
          <button
            onClick={() => setActiveTab("nuevo")}
            className={`tab-button ${activeTab === "nuevo" ? "active" : ""}`}
            style={{
              flex: 1,
              padding: '1rem 1.5rem',
              background: activeTab === "nuevo" ? 'var(--color-bg-tertiary)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === "nuevo" ? '3px solid var(--color-accent)' : '3px solid transparent',
              color: activeTab === "nuevo" ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'all var(--transition-base)',
            }}
          >
            ➕ Nuevo Reporte
          </button>
        </div>
      </div>

      {/* Tab Content: Ver Reportes */}
      {activeTab === "ver" && (
        <>
          {/* Statistics Cards */}
          <div className="grid-3 mb-3">
            <div className="glass-card animate-fade-in" style={{ textAlign: 'center' }}>
              <div className="empty-state-icon" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
              <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Total Reportes</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-accent)', margin: 0 }}>
                {reportes.length}
              </p>
            </div>
            <div className="glass-card animate-fade-in" style={{ textAlign: 'center' }}>
              <div className="empty-state-icon" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
              <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Este Mes</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-info)', margin: 0 }}>
                {reportesThisMonth}
              </p>
            </div>
            <div className="glass-card animate-fade-in" style={{ textAlign: 'center' }}>
              <div className="empty-state-icon" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
              <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Filtrados</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-success)', margin: 0 }}>
                {filteredReportes.length}
              </p>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="glass-card mb-3 animate-fade-in">
            <div className="grid-3" style={{ alignItems: 'end' }}>
              <div className="form-group mb-0">
                <label className="form-label">🔍 Buscar</label>
                <input
                  type="text"
                  placeholder="Buscar por conductor, taxi o incidencia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">👤 Filtrar por Conductor</label>
                <select
                  value={filterConductor}
                  onChange={(e) => setFilterConductor(e.target.value)}
                  className="form-control form-select"
                >
                  <option value="">Todos</option>
                  {taxistas.map((t) => (
                    <option key={t.no_lista} value={t.no_lista}>{t.nombre} {t.apellido_p}</option>
                  ))}
                </select>
              </div>
              <div className="form-group mb-0">
                <label className="form-label">⚠️ Filtrar por Incidencia</label>
                <select
                  value={filterIncidencia}
                  onChange={(e) => setFilterIncidencia(e.target.value)}
                  className="form-control form-select"
                >
                  <option value="">Todas</option>
                  {incidencias.map((i) => (
                    <option key={i.id_incidencia} value={i.id_incidencia}>
                      #{i.id_incidencia} - {i.descripcion?.substring(0, 40)}...
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {(searchTerm || filterConductor || filterIncidencia) && (
              <div className="mt-2">
                <button
                  onClick={() => { setSearchTerm(""); setFilterConductor(""); setFilterIncidencia(""); }}
                  className="btn btn-secondary btn-sm"
                >
                  🔄 Limpiar Filtros
                </button>
              </div>
            )}
          </div>

          {/* Reports Table */}
          <div className="glass-card animate-fade-in">
            <div className="glass-card-header">
              <h3 className="glass-card-title">📜 Historial de Reportes</h3>
              <span className="badge badge-info">{filteredReportes.length} registros</span>
            </div>

            {loading ? (
              <div className="animate-stagger">
                {[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-table-row"></div>)}
              </div>
            ) : filteredReportes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  {searchTerm || filterConductor || filterIncidencia ? "🔍" : "📋"}
                </div>
                <p className="empty-state-title">
                  {searchTerm || filterConductor || filterIncidencia
                    ? "No se encontraron reportes"
                    : "No hay reportes registrados"}
                </p>
                <p className="empty-state-text">
                  {searchTerm || filterConductor || filterIncidencia
                    ? "Intenta con otros criterios de búsqueda"
                    : "Crea tu primer reporte para comenzar"}
                </p>
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
                    {filteredReportes.map((rep) => (
                      <tr key={rep.id_reporte}>
                        <td><strong>#{rep.id_reporte}</strong></td>
                        <td>{formatDate(rep.fecha_reporte)}</td>
                        <td>{rep.nombre_conductor}</td>
                        <td><span className="text-accent">{rep.placa_taxi}</span></td>
                        <td>{rep.incidencia_descripcion}</td>
                        <td>
                          <div className="flex gap-1">
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setSelectedReporteDetail(rep)}
                              title="Ver detalles completos"
                            >
                              👁️
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleEditClick(rep)}>
                              ✏️
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
        </>
      )}

      {/* Tab Content: Nuevo Reporte */}
      {activeTab === "nuevo" && (
        <form onSubmit={handleSubmit}>
          {/* Step 1: Select Incidencia */}
          <div className="glass-card mb-3 animate-fade-in">
            <div className="glass-card-header">
              <h3 className="glass-card-title">1️⃣ Seleccionar Incidencia</h3>
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Incidencia a Reportar *</label>
              <select
                name="id_incidencia"
                value={form.id_incidencia}
                onChange={handleChange}
                className="form-control form-select"
                required
              >
                <option value="">-- Seleccionar Incidencia --</option>
                {incidencias.map(i => (
                  <option key={i.id_incidencia} value={i.id_incidencia}>
                    #{i.id_incidencia} - {i.descripcion} ({i.nombre_conductor})
                  </option>
                ))}
              </select>
            </div>

            {/* Preview of selected incidencia */}
            {selectedIncidencia && (
              <div className="mt-3" style={{
                padding: '1rem',
                background: 'var(--color-success-bg)',
                border: '1px solid var(--color-success)',
                borderRadius: 'var(--border-radius-md)'
              }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600, marginBottom: '0.5rem' }}>
                  ✨ Auto-Relleno Activado
                </p>
                <p style={{ marginBottom: '0.25rem' }}>
                  <strong>Descripción:</strong> {selectedIncidencia.descripcion}
                </p>
                <p style={{ marginBottom: '0.25rem' }}>
                  <strong>Conductor:</strong> {selectedIncidencia.nombre_conductor} ✅ <span className="text-muted">(auto-seleccionado)</span>
                </p>
                {selectedIncidencia.observaciones && (
                  <p style={{ marginBottom: 0 }}>
                    <strong>Observaciones:</strong> {selectedIncidencia.observaciones} ✅ <span className="text-muted">(pre-llenadas)</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Report Details (Simplified) */}
          <div className="glass-card mb-3 animate-fade-in">
            <div className="glass-card-header">
              <h3 className="glass-card-title">2️⃣ Detalles del Reporte</h3>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Conductor *</label>
                <select
                  name="no_lista"
                  value={form.no_lista}
                  onChange={handleChange}
                  className="form-control form-select"
                  required
                  disabled={!!selectedIncidencia}
                  style={{
                    opacity: selectedIncidencia ? 0.7 : 1,
                    cursor: selectedIncidencia ? 'not-allowed' : 'pointer'
                  }}
                >
                  <option value="">-- Seleccionar --</option>
                  {taxistas.map(t => (
                    <option key={t.no_lista} value={t.no_lista}>{t.nombre} {t.apellido_p}</option>
                  ))}
                </select>
                {selectedIncidencia && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-success)', marginTop: '0.25rem', marginBottom: 0 }}>
                    ✨ Auto-seleccionado desde incidencia
                  </p>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Fecha del Reporte *</label>
                <input
                  type="date"
                  name="fecha_reporte"
                  value={form.fecha_reporte}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Taxi (Económico) *</label>
              <select
                name="economico"
                value={form.economico}
                onChange={handleChange}
                className="form-control form-select"
                required
              >
                <option value="">-- Seleccionar --</option>
                {taxis.map(t => (
                  <option key={t.economico} value={t.economico}>#{t.economico} - {t.placa}</option>
                ))}
              </select>
              {taxiAutoFilled && form.economico && (
                <p style={{ fontSize: '0.75rem', color: 'var(--color-success)', marginTop: '0.25rem', marginBottom: 0 }}>
                  ✨ Auto-seleccionado (conductor tiene solo 1 taxi asignado)
                </p>
              )}
              {form.no_lista && taxisDelConductor.length === 0 && (
                <p style={{ fontSize: '0.75rem', color: 'var(--color-warning)', marginTop: '0.25rem', marginBottom: 0 }}>
                  ⚠️ El conductor no tiene taxi asignado
                </p>
              )}
              {form.no_lista && taxisDelConductor.length > 1 && (
                <p style={{ fontSize: '0.75rem', color: 'var(--color-info)', marginTop: '0.25rem', marginBottom: 0 }}>
                  ℹ️ Conductor tiene {taxisDelConductor.length} taxis asignados
                </p>
              )}
            </div>

            <div className="form-group mb-0">
              <label className="form-label">Observaciones Adicionales</label>
              <textarea
                name="observaciones"
                value={form.observaciones}
                onChange={handleChange}
                className="form-control"
                rows="4"
                placeholder="Añade observaciones adicionales o edita las pre-llenadas..."
                style={{ resize: 'vertical' }}
              />
              {selectedIncidencia && selectedIncidencia.observaciones && (
                <p style={{ fontSize: '0.75rem', color: 'var(--color-success)', marginTop: '0.25rem', marginBottom: 0 }}>
                  ✨ Pre-llenadas desde incidencia (puedes editarlas)
                </p>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="glass-card animate-fade-in" style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setActiveTab("ver")} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              ✅ Guardar Reporte
            </button>
          </div>
        </form>
      )}

      {/* Detail Modal */}
      {selectedReporteDetail && (
        <div className="modal-overlay" onClick={() => setSelectedReporteDetail(null)}>
          <div className="modal-content" style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">📋 Detalles del Reporte #{selectedReporteDetail.id_reporte}</h3>
              <button className="modal-close" onClick={() => setSelectedReporteDetail(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div>
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Fecha</p>
                  <p style={{ fontWeight: 600, marginBottom: '1rem' }}>{formatDate(selectedReporteDetail.fecha_reporte)}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Conductor</p>
                  <p style={{ fontWeight: 600, marginBottom: '1rem' }}>{selectedReporteDetail.nombre_conductor}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Taxi</p>
                  <p style={{ fontWeight: 600, marginBottom: '1rem' }}>{selectedReporteDetail.placa_taxi}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Incidencia</p>
                  <p style={{ fontWeight: 600, marginBottom: '1rem' }}>{selectedReporteDetail.incidencia_descripcion}</p>
                </div>
              </div>
              {selectedReporteDetail.observaciones && (
                <div>
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Observaciones</p>
                  <p style={{ fontWeight: 600, marginBottom: 0 }}>{selectedReporteDetail.observaciones}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedReporteDetail(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

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