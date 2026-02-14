import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function IncidenciasPage() {
  const [incidencias, setIncidencias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterConductor, setFilterConductor] = useState("");

  const [form, setForm] = useState({ descripcion: "", observaciones: "", no_lista: "" });
  const [incidenciaAEditar, setIncidenciaAEditar] = useState(null);
  const [formEdicion, setFormEdicion] = useState(null);

  const baseUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const fetchIncidencias = async () => {
    try {
      const res = await fetch(`${baseUrl}/incidencias`);
      if (!res.ok) {
        setIncidencias([]);
        return;
      }
      const data = await res.json();
      setIncidencias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener incidencias:", error);
      setIncidencias([]);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`${baseUrl}/usuarios/taxistas`);
      if (!res.ok) {
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
    Promise.all([fetchIncidencias(), fetchUsuarios()]).finally(() => setLoading(false));
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
      const res = await fetch(`${baseUrl}/incidencias`, {
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
    if (!window.confirm("¿Estás seguro de eliminar esta incidencia?")) return;
    try {
      const res = await fetch(`${baseUrl}/incidencias/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
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

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const id = incidenciaAEditar.id_incidencia;
    if (!formEdicion.no_lista) {
      alert("Por favor, selecciona un conductor.");
      return;
    }
    try {
      const res = await fetch(`${baseUrl}/incidencias/${id}`, {
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

  const handleCreateReport = (incidencia) => {
    // Navigate to reports page with incidencia pre-selected
    navigate('/reports', { state: { selectedIncidencia: incidencia.id_incidencia, openNewReport: true } });
  };

  // Filter incidencias based on search and filters
  const filteredIncidencias = incidencias.filter(inc => {
    const matchesSearch = !searchTerm ||
      inc.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.observaciones?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.nombre_conductor?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesConductor = !filterConductor || inc.no_lista === filterConductor;

    return matchesSearch && matchesConductor;
  });

  return (
    <div className="page-container">
      {/* Page Header */}
      <header className="page-header">
        <h1 className="page-title">⚠️ Gestión de Incidencias</h1>
        <p className="page-subtitle">Registro y seguimiento de incidencias reportadas</p>
      </header>

      {/* Statistics Cards */}
      <div className="grid-3 mb-3">
        <div className="glass-card animate-fade-in" style={{ textAlign: 'center' }}>
          <div className="empty-state-icon" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Total Incidencias</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-accent)', margin: 0 }}>
            {incidencias.length}
          </p>
        </div>
        <div className="glass-card animate-fade-in" style={{ textAlign: 'center' }}>
          <div className="empty-state-icon" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Conductores Afectados</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-info)', margin: 0 }}>
            {new Set(incidencias.map(i => i.no_lista)).size}
          </p>
        </div>
        <div className="glass-card animate-fade-in" style={{ textAlign: 'center' }}>
          <div className="empty-state-icon" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Resultados Filtrados</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-success)', margin: 0 }}>
            {filteredIncidencias.length}
          </p>
        </div>
      </div>

      {/* Form to add new incident */}
      <div className="glass-card mb-3 animate-fade-in">
        <div className="glass-card-header">
          <h3 className="glass-card-title">➕ Nueva Incidencia</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group mb-0">
              <label className="form-label">Descripción *</label>
              <textarea
                name="descripcion"
                placeholder="Describe brevemente la incidencia..."
                value={form.descripcion}
                onChange={handleChange}
                className="form-control"
                rows="3"
                required
                style={{ resize: 'vertical' }}
              />
            </div>
            <div>
              <div className="form-group">
                <label className="form-label">Conductor *</label>
                <select
                  name="no_lista"
                  value={form.no_lista}
                  onChange={handleChange}
                  className="form-control form-select"
                  required
                >
                  <option value="">-- Seleccionar --</option>
                  {usuarios.map((u) => (
                    <option key={u.no_lista} value={u.no_lista}>{u.nombre} {u.apellido_p}</option>
                  ))}
                </select>
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Observaciones (Opcional)</label>
                <input
                  type="text"
                  name="observaciones"
                  placeholder="Detalles adicionales..."
                  value={form.observaciones}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>
          </div>
          <div className="mt-3" style={{ textAlign: 'right' }}>
            <button type="submit" className="btn btn-primary">✅ Registrar Incidencia</button>
          </div>
        </form>
      </div>

      {/* Search and Filter Bar */}
      <div className="glass-card mb-3 animate-fade-in">
        <div className="grid-2" style={{ alignItems: 'end' }}>
          <div className="form-group mb-0">
            <label className="form-label">🔍 Buscar</label>
            <input
              type="text"
              placeholder="Buscar por descripción, observaciones o conductor..."
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
              <option value="">Todos los conductores</option>
              {usuarios.map((u) => (
                <option key={u.no_lista} value={u.no_lista}>{u.nombre} {u.apellido_p}</option>
              ))}
            </select>
          </div>
        </div>
        {(searchTerm || filterConductor) && (
          <div className="mt-2">
            <button
              onClick={() => { setSearchTerm(""); setFilterConductor(""); }}
              className="btn btn-secondary btn-sm"
            >
              🔄 Limpiar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Incidents Table */}
      <div className="glass-card animate-fade-in">
        <div className="glass-card-header">
          <h3 className="glass-card-title">📋 Incidencias Registradas</h3>
          <span className="badge badge-info">{filteredIncidencias.length} registros</span>
        </div>

        {loading ? (
          <div className="animate-stagger">
            {[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-table-row"></div>)}
          </div>
        ) : filteredIncidencias.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              {searchTerm || filterConductor ? "🔍" : "✅"}
            </div>
            <p className="empty-state-title">
              {searchTerm || filterConductor
                ? "No se encontraron incidencias"
                : "No hay incidencias registradas"}
            </p>
            <p className="empty-state-text">
              {searchTerm || filterConductor
                ? "Intenta con otros criterios de búsqueda"
                : "Todo en orden por ahora"}
            </p>
          </div>
        ) : (
          <div className="premium-table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Descripción</th>
                  <th>Conductor</th>
                  <th>Observaciones</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody className="animate-stagger">
                {filteredIncidencias.map((inc) => (
                  <tr key={inc.id_incidencia}>
                    <td><strong>#{inc.id_incidencia}</strong></td>
                    <td>{inc.descripcion}</td>
                    <td>{inc.nombre_conductor || <span className="text-muted">No asignado</span>}</td>
                    <td className="text-muted">{inc.observaciones || '-'}</td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleCreateReport(inc)}
                          title="Crear reporte de esta incidencia"
                        >
                          📝 Reporte
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEditClick(inc)}>
                          ✏️
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(inc.id_incidencia)}>
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
      {incidenciaAEditar && formEdicion && (
        <div className="modal-overlay" onClick={() => setIncidenciaAEditar(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">✏️ Editar Incidencia #{incidenciaAEditar.id_incidencia}</h3>
              <button className="modal-close" onClick={() => setIncidenciaAEditar(null)}>✕</button>
            </div>
            <form onSubmit={handleUpdateSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea
                    name="descripcion"
                    value={formEdicion.descripcion}
                    onChange={handleEditChange}
                    className="form-control"
                    rows="3"
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Conductor</label>
                  <select
                    name="no_lista"
                    value={formEdicion.no_lista}
                    onChange={handleEditChange}
                    className="form-control form-select"
                    required
                  >
                    <option value="">-- Reasignar --</option>
                    {usuarios.map((u) => (
                      <option key={u.no_lista} value={u.no_lista}>{u.nombre} {u.apellido_p}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Observaciones</label>
                  <input
                    type="text"
                    name="observaciones"
                    value={formEdicion.observaciones}
                    onChange={handleEditChange}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIncidenciaAEditar(null)}>
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

export default IncidenciasPage;