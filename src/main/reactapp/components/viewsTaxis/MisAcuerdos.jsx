import React, { useState, useEffect } from 'react';
import { useAuth } from '../secure/AuthContext';
import TaxistaNavbar from '../Nabvars/TaxistaNavbar';

function MisAcuerdos() {
  const [acuerdos, setAcuerdos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAcuerdo, setSelectedAcuerdo] = useState(null);
  const { user } = useAuth();

  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (user?.no_lista) {
      fetch(`${baseUrl}/acuerdos/taxista/${user.no_lista}`)
        .then(res => res.json())
        .then(data => setAcuerdos(Array.isArray(data) ? data : []))
        .catch(err => console.error("Error al cargar mis acuerdos:", err))
        .finally(() => setLoading(false));
    }
  }, [user, baseUrl]);

  return (
    <div className="taxista-dashboard" style={{ minHeight: '100vh' }}>
      <TaxistaNavbar />

      <div className="page-container">
        {/* Header */}
        <header className="page-header" style={{ textAlign: 'center' }}>
          <h1 className="page-title">🤝 Mis Acuerdos</h1>
          <p className="page-subtitle">Resoluciones y acuerdos de tus incidencias</p>
        </header>

        {/* Stats Summary */}
        <div className="grid-2 mb-3">
          <div className="glass-card animate-fade-in" style={{ textAlign: 'center' }}>
            <div className="empty-state-icon" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Total de Acuerdos</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-success)', margin: 0 }}>
              {acuerdos.length}
            </p>
          </div>
          <div className="glass-card animate-fade-in" style={{ textAlign: 'center' }}>
            <div className="empty-state-icon" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Incidencias Resueltas</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-info)', margin: 0 }}>
              {acuerdos.length}
            </p>
          </div>
        </div>

        {/* Agreements Table */}
        <div className="glass-card animate-fade-in">
          <div className="glass-card-header">
            <h3 className="glass-card-title">📜 Historial de Acuerdos</h3>
            <span className="badge badge-success">{acuerdos.length} acuerdos</span>
          </div>

          {loading ? (
            <div className="animate-stagger">
              {[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-table-row"></div>)}
            </div>
          ) : acuerdos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✅</div>
              <p className="empty-state-title">Sin acuerdos</p>
              <p className="empty-state-text">No hay acuerdos asociados a tus reportes</p>
            </div>
          ) : (
            <div className="premium-table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Incidencia</th>
                    <th>Descripción del Acuerdo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody className="animate-stagger">
                  {acuerdos.map((ac) => (
                    <tr key={ac.id_acuerdo}>
                      <td><strong>#{ac.id_acuerdo}</strong></td>
                      <td>
                        <span className="badge badge-warning">
                          {ac.incidencia_descripcion || 'N/A'}
                        </span>
                      </td>
                      <td>{ac.descripcion}</td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedAcuerdo(ac)}
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
      {selectedAcuerdo && (
        <div className="modal-overlay" onClick={() => setSelectedAcuerdo(null)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🤝 Detalles del Acuerdo #{selectedAcuerdo.id_acuerdo}</h3>
              <button className="modal-close" onClick={() => setSelectedAcuerdo(null)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Incidencia Highlight */}
              <div style={{
                padding: '1rem',
                background: 'var(--color-warning-bg, rgba(255, 193, 7, 0.1))',
                borderRadius: 'var(--border-radius-md)',
                marginBottom: '1.5rem',
                border: '1px solid var(--color-warning)'
              }}>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>⚠️ Incidencia Relacionada</p>
                <p style={{ fontWeight: 600, color: 'var(--color-warning)', marginBottom: 0 }}>
                  {selectedAcuerdo.incidencia_descripcion || 'No especificada'}
                </p>
              </div>

              {/* Acuerdo Description */}
              <div style={{
                padding: '1rem',
                background: 'var(--color-success-bg, rgba(40, 167, 69, 0.1))',
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid var(--color-success)'
              }}>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>✅ Resolución del Acuerdo</p>
                <p style={{ fontWeight: 600, marginBottom: 0 }}>{selectedAcuerdo.descripcion}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedAcuerdo(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MisAcuerdos;