import { useEffect, useState } from "react";

function AcuerdosPage() {
  const [acuerdos, setAcuerdos] = useState([]);
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterIncidencia, setFilterIncidencia] = useState("");

  const [form, setForm] = useState({ descripcion: "", id_incidencia: "" });
  const [acuerdoAEditar, setAcuerdoAEditar] = useState(null);
  const [formEdicion, setFormEdicion] = useState(null);
  const [selectedAcuerdoDetail, setSelectedAcuerdoDetail] = useState(null);

  const baseUrl = import.meta.env.VITE_API_URL;

  const fetchAcuerdos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/acuerdos`);
      const data = await res.json();
      setAcuerdos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener acuerdos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIncidencias = async () => {
    try {
      const res = await fetch(`${baseUrl}/incidencias`);
      const data = await res.json();
      setIncidencias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener incidencias:", error);
    }
  };

  useEffect(() => {
    fetchAcuerdos();
    fetchIncidencias();
  }, []);

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
      const res = await fetch(`${baseUrl}/acuerdos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error al crear el acuerdo");
      setForm({ descripcion: "", id_incidencia: "" });
      fetchAcuerdos();
    } catch (error) {
      console.error("Error al crear acuerdo:", error);
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este acuerdo?")) return;
    try {
      const res = await fetch(`${baseUrl}/acuerdos/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      fetchAcuerdos();
    } catch (error) {
      console.error("Error al eliminar acuerdo:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleEditClick = (acuerdo) => {
    setAcuerdoAEditar(acuerdo);
    setFormEdicion({
      descripcion: acuerdo.descripcion || '',
      id_incidencia: acuerdo.id_incidencia || ''
    });
  };

  const handleEditChange = (e) => {
    setFormEdicion({ ...formEdicion, [e.target.name]: e.target.value });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const id = acuerdoAEditar.id_acuerdo;
    try {
      const res = await fetch(`${baseUrl}/acuerdos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formEdicion),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      setAcuerdoAEditar(null);
      fetchAcuerdos();
    } catch (error) {
      console.error("Error al actualizar acuerdo:", error);
      alert(error.message);
    }
  };

  // Filter acuerdos
  const filteredAcuerdos = acuerdos.filter(ac => {
    const matchesSearch = !searchTerm ||
      ac.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ac.incidencia?.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesIncidencia = !filterIncidencia || ac.id_incidencia === parseInt(filterIncidencia);

    return matchesSearch && matchesIncidencia;
  });

  return (
    <div className="page-container">
      {/* Page Header */}
      <header className="page-header">
        <h1 className="page-title">🤝 Gestión de Acuerdos</h1>
        <p className="page-subtitle">Resoluciones y acuerdos de incidencias</p>
      </header>

      {/* Statistics Cards */}
      <div className="grid-2 mb-3">
        <div className="glass-card animate-fade-in" style={{ textAlign: 'center' }}>
          <div className="empty-state-icon" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Total de Acuerdos</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-success)', margin: 0 }}>
            {acuerdos.length}
          </p>
        </div>
        <div className="glass-card animate-fade-in" style={{ textAlign: 'center' }}>
          <div className="empty-state-icon" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Filtrados</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-info)', margin: 0 }}>
            {filteredAcuerdos.length}
          </p>
        </div>
      </div>

      {/* New Acuerdo Form */}
      <div className="glass-card mb-3 animate-fade-in">
        <div className="glass-card-header">
          <h3 className="glass-card-title">➕ Registrar Nuevo Acuerdo</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Descripción del Acuerdo *</label>
              <textarea
                name="descripcion"
                placeholder="Describe el acuerdo o la resolución..."
                value={form.descripcion}
                onChange={handleChange}
                className="form-control"
                rows="3"
                style={{ resize: 'vertical' }}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Incidencia Relacionada *</label>
              <select
                name="id_incidencia"
                value={form.id_incidencia}
                onChange={handleChange}
                className="form-control form-select"
                required
              >
                <option value="">-- Seleccionar Incidencia --</option>
                {incidencias.map((inc) => (
                  <option key={inc.id_incidencia} value={inc.id_incidencia}>
                    #{inc.id_incidencia} - {inc.descripcion}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <button type="submit" className="btn btn-primary">
              ✅ Registrar Acuerdo
            </button>
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
              placeholder="Buscar por descripción o incidencia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
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
        {(searchTerm || filterIncidencia) && (
          <div className="mt-2">
            <button
              onClick={() => { setSearchTerm(""); setFilterIncidencia(""); }}
              className="btn btn-secondary btn-sm"
            >
              🔄 Limpiar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Acuerdos Table */}
      <div className="glass-card animate-fade-in">
        <div className="glass-card-header">
          <h3 className="glass-card-title">📜 Acuerdos Existentes</h3>
          <span className="badge badge-info">{filteredAcuerdos.length} registros</span>
        </div>

        {loading ? (
          <div className="animate-stagger">
            {[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-table-row"></div>)}
          </div>
        ) : filteredAcuerdos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              {searchTerm || filterIncidencia ? "🔍" : "📭"}
            </div>
            <p className="empty-state-title">
              {searchTerm || filterIncidencia
                ? "No se encontraron acuerdos"
                : "No hay acuerdos registrados"}
            </p>
            <p className="empty-state-text">
              {searchTerm || filterIncidencia
                ? "Intenta con otros criterios de búsqueda"
                : "Crea tu primer acuerdo para comenzar"}
            </p>
          </div>
        ) : (
          <div className="premium-table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Descripción del Acuerdo</th>
                  <th>Incidencia Relacionada</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody className="animate-stagger">
                {filteredAcuerdos.map((ac) => (
                  <tr key={ac.id_acuerdo}>
                    <td><strong>#{ac.id_acuerdo}</strong></td>
                    <td>{ac.descripcion}</td>
                    <td>
                      <span className="badge badge-warning">
                        {ac.incidencia?.descripcion || "No especificada"}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedAcuerdoDetail(ac)}
                          title="Ver detalles"
                        >
                          👁️
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEditClick(ac)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(ac.id_acuerdo)}
                        >
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

      {/* Detail Modal */}
      {selectedAcuerdoDetail && (
        <div className="modal-overlay" onClick={() => setSelectedAcuerdoDetail(null)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🤝 Detalles del Acuerdo #{selectedAcuerdoDetail.id_acuerdo}</h3>
              <button className="modal-close" onClick={() => setSelectedAcuerdoDetail(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{
                padding: '1rem',
                background: 'var(--color-success-bg)',
                borderRadius: 'var(--border-radius-md)',
                marginBottom: '1.5rem'
              }}>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>⚠️ Incidencia Relacionada</p>
                <p style={{ fontWeight: 600, marginBottom: 0 }}>
                  {selectedAcuerdoDetail.incidencia?.descripcion || 'No especificada'}
                </p>
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>📝 Descripción del Acuerdo</p>
                <p style={{ fontWeight: 600, marginBottom: 0 }}>{selectedAcuerdoDetail.descripcion}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedAcuerdoDetail(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {acuerdoAEditar && formEdicion && (
        <div className="modal-overlay" onClick={() => setAcuerdoAEditar(null)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">✏️ Editar Acuerdo #{acuerdoAEditar.id_acuerdo}</h3>
              <button className="modal-close" onClick={() => setAcuerdoAEditar(null)}>✕</button>
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
                    style={{ resize: 'vertical' }}
                    required
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Incidencia Relacionada</label>
                  <select
                    name="id_incidencia"
                    value={formEdicion.id_incidencia}
                    onChange={handleEditChange}
                    className="form-control form-select"
                    required
                  >
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
                <button type="button" className="btn btn-secondary" onClick={() => setAcuerdoAEditar(null)}>
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

export default AcuerdosPage;