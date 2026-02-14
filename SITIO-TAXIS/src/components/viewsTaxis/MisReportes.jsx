import React, { useState, useEffect } from 'react';
import { useAuth } from '../secure/AuthContext';
import TaxistaNavbar from '../Nabvars/TaxistaNavbar';

function MisReportes() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReporte, setSelectedReporte] = useState(null);
  const [filterMonth, setFilterMonth] = useState("");
  const { user } = useAuth();

  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (user?.no_lista) {
      fetch(`${baseUrl}/reportes/taxista/${user.no_lista}`)
        .then(res => res.json())
        .then(data => setReportes(Array.isArray(data) ? data : []))
        .catch(err => console.error("Error al cargar mis reportes:", err))
        .finally(() => setLoading(false));
    }
  }, [user, baseUrl]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateLong = (dateString) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get unique months from reportes
  const getUniqueMonths = () => {
    const months = reportes
      .filter(r => r.fecha_reporte)
      .map(r => {
        const date = new Date(r.fecha_reporte);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      });
    return [...new Set(months)].sort().reverse();
  };

  // Filter reportes by month
  const filteredReportes = filterMonth
    ? reportes.filter(r => {
      if (!r.fecha_reporte) return false;
      const date = new Date(r.fecha_reporte);
      const repMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return repMonth === filterMonth;
    })
    : reportes;

  // Stats
  const reportesThisMonth = reportes.filter(r => {
    if (!r.fecha_reporte) return false;
    const date = new Date(r.fecha_reporte);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="taxista-dashboard" style={{ minHeight: '100vh' }}>
      <TaxistaNavbar />

      <div className="page-container">
        {/* Header */}
        <header className="page-header" style={{ textAlign: 'center' }}>
          <h1 className="page-title">📋 Mis Reportes</h1>
          <p className="page-subtitle">Historial de reportes generados sobre tu actividad</p>
        </header>

        {/* Stats Summary */}
        <div className="grid-3 mb-3">
          <div className="glass-card animate-fade-in" style={{ textAlign: 'center' }}>
            <div className="empty-state-icon" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Total de Reportes</p>
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

        {/* Filter Bar */}
        {reportes.length > 0 && (
          <div className="glass-card mb-3 animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'end', gap: 'var(--spacing-md)' }}>
              <div className="form-group mb-0" style={{ flex: 1 }}>
                <label className="form-label">📅 Filtrar por Mes</label>
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="form-control form-select"
                >
                  <option value="">Todos los meses</option>
                  {getUniqueMonths().map(month => {
                    const [year, monthNum] = month.split('-');
                    const monthName = new Date(year, parseInt(monthNum) - 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
                    return <option key={month} value={month}>{monthName}</option>;
                  })}
                </select>
              </div>
              {filterMonth && (
                <button
                  onClick={() => setFilterMonth("")}
                  className="btn btn-secondary btn-sm"
                >
                  🔄 Limpiar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Reports Table */}
        <div className="glass-card animate-fade-in">
          <div className="glass-card-header">
            <h3 className="glass-card-title">📜 Historial</h3>
            <span className="badge badge-info">{filteredReportes.length} reportes</span>
          </div>

          {loading ? (
            <div className="animate-stagger">
              {[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-table-row"></div>)}
            </div>
          ) : filteredReportes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">{filterMonth ? "🔍" : "✅"}</div>
              <p className="empty-state-title">
                {filterMonth ? "No hay reportes en este período" : "Sin reportes"}
              </p>
              <p className="empty-state-text">
                {filterMonth ? "Intenta con otro mes" : "No tienes reportes generados. ¡Sigue así!"}
              </p>
            </div>
          ) : (
            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
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
                      <td><span className="text-accent">{rep.placa_taxi}</span></td>
                      <td>{rep.incidencia_descripcion}</td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedReporte(rep)}
                          title="Ver detalles completos"
                        >
                          👁️ Ver Detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReporte && (
        <div className="modal-overlay" onClick={() => setSelectedReporte(null)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">📋 Detalles del Reporte #{selectedReporte.id_reporte}</h3>
              <button className="modal-close" onClick={() => setSelectedReporte(null)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Date Highlight */}
              <div style={{
                padding: '1rem',
                background: 'var(--color-accent-bg, rgba(244, 211, 94, 0.1))',
                borderRadius: 'var(--border-radius-md)',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Fecha del Reporte</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-accent)', margin: 0 }}>
                  {formatDateLong(selectedReporte.fecha_reporte)}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid-2">
                <div>
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>🚕 Taxi</p>
                  <p style={{ fontWeight: 600, marginBottom: '1rem' }}>{selectedReporte.placa_taxi || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>⚠️ Incidencia</p>
                  <p style={{ fontWeight: 600, marginBottom: '1rem' }}>{selectedReporte.incidencia_descripcion || 'No especificada'}</p>
                </div>
              </div>

              {/* Acuerdo */}
              {selectedReporte.acuerdo_descripcion && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  background: 'var(--color-bg-tertiary)',
                  borderRadius: 'var(--border-radius-md)',
                  border: '1px solid var(--border-color)'
                }}>
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>🤝 Acuerdo Relacionado</p>
                  <p style={{ fontWeight: 600, marginBottom: 0 }}>{selectedReporte.acuerdo_descripcion}</p>
                </div>
              )}

              {/* Observaciones */}
              {selectedReporte.observaciones && (
                <div>
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>📝 Observaciones</p>
                  <p style={{ fontWeight: 600, marginBottom: 0 }}>{selectedReporte.observaciones}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedReporte(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MisReportes;