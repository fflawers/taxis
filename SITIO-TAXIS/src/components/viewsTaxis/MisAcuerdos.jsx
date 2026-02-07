import React, { useState, useEffect } from 'react';
import { useAuth } from '../secure/AuthContext';
import TaxistaNavbar from '../Nabvars/TaxistaNavbar';

function MisAcuerdos() {
  const [acuerdos, setAcuerdos] = useState([]);
  const [loading, setLoading] = useState(true);
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
          <h1 className="page-title">✅ Mis Acuerdos</h1>
          <p className="page-subtitle">Resoluciones y acuerdos de tus incidencias</p>
        </header>

        {/* Stats Summary */}
        <div className="glass-card mb-3 animate-fade-in" style={{ textAlign: 'center' }}>
          <div className="flex-center gap-3" style={{ flexWrap: 'wrap' }}>
            <div>
              <span className="text-muted" style={{ fontSize: '0.9rem' }}>Total de Acuerdos</span>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-success)', margin: 0 }}>
                {acuerdos.length}
              </p>
            </div>
          </div>
        </div>

        {/* Agreements Table */}
        <div className="glass-card animate-fade-in">
          {loading ? (
            <div className="animate-stagger">
              {[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-table-row"></div>)}
            </div>
          ) : acuerdos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
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
                  </tr>
                </thead>
                <tbody className="animate-stagger">
                  {acuerdos.map((ac) => (
                    <tr key={ac.id_acuerdo}>
                      <td><strong>#{ac.id_acuerdo}</strong></td>
                      <td><span className="badge badge-warning">{ac.incidencia_descripcion}</span></td>
                      <td>{ac.descripcion}</td>
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

export default MisAcuerdos;