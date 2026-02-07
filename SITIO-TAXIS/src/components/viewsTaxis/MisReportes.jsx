import React, { useState, useEffect } from 'react';
import { useAuth } from '../secure/AuthContext';
import TaxistaNavbar from '../Nabvars/TaxistaNavbar';

function MisReportes() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
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
        <div className="glass-card mb-3 animate-fade-in" style={{ textAlign: 'center' }}>
          <div className="flex-center gap-3" style={{ flexWrap: 'wrap' }}>
            <div>
              <span className="text-muted" style={{ fontSize: '0.9rem' }}>Total de Reportes</span>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-accent)', margin: 0 }}>
                {reportes.length}
              </p>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="glass-card animate-fade-in">
          {loading ? (
            <div className="animate-stagger">
              {[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-table-row"></div>)}
            </div>
          ) : reportes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✅</div>
              <p className="empty-state-title">Sin reportes</p>
              <p className="empty-state-text">No tienes reportes generados. ¡Sigue así!</p>
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
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody className="animate-stagger">
                  {reportes.map((rep) => (
                    <tr key={rep.id_reporte}>
                      <td><strong>#{rep.id_reporte}</strong></td>
                      <td>{formatDate(rep.fecha_reporte)}</td>
                      <td><span className="text-accent">{rep.placa_taxi}</span></td>
                      <td>{rep.incidencia_descripcion}</td>
                      <td className="text-muted">{rep.observaciones || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MisReportes;