import React, { useState, useEffect } from 'react';
import { useAuth } from '../secure/AuthContext';
import TaxistaNavbar from '../Nabvars/TaxistaNavbar';
import IndexFooter from '../Footers/IndexFooter';

function MisReportes() {
  const [reportes, setReportes] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.no_lista) {
      fetch(`${import.meta.env.VITE_API_URL}/reportes/taxista/${user.no_lista}`)
        .then(res => res.json())
        .then(data => setReportes(data))
        .catch(err => console.error("Error al cargar mis reportes:", err));
    }
  }, [user]);

  return (
    <div>
      <TaxistaNavbar />
      <div className="container mt-4">
        <h1 className="text-center fw-bold">Mis Reportes Generados</h1>
        <div className="table-responsive mt-4">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID Reporte</th>
                <th>Fecha</th>
                <th>Taxi (Placa)</th>
                <th>Incidencia</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {reportes.length > 0 ? (
                // ✅ CORREGIDO: Propiedades en minúsculas
                reportes.map((rep) => (
                  <tr key={rep.id_reporte}>
                    <td>{rep.id_reporte}</td>
                    <td>{rep.fecha_reporte ? new Date(rep.fecha_reporte).toLocaleDateString() : 'N/A'}</td>
                    <td>{rep.placa_taxi}</td>
                    <td>{rep.incidencia_descripcion}</td>
                    <td>{rep.observaciones || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">No has generado ningún reporte.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <IndexFooter />
    </div>
  );
}

export default MisReportes;