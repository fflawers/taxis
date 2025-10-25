import React, { useState, useEffect } from 'react';
import { useAuth } from '../secure/AuthContext';
import TaxistaNavbar from '../Nabvars/TaxistaNavbar';
import IndexFooter from '../Footers/IndexFooter';

function MisAcuerdos() {
  const [acuerdos, setAcuerdos] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.no_lista) {
      fetch(`${import.meta.env.VITE_API_URL}/acuerdos/taxista/${user.no_lista}`)
        .then(res => res.json())
        .then(data => setAcuerdos(data))
        .catch(err => console.error("Error al cargar mis acuerdos:", err));
    }
  }, [user]);

  return (
    <div>
      <TaxistaNavbar />
      <div className="container mt-4">
        <h1 className="text-center fw-bold">Acuerdos de Mis Reportes</h1>
        <div className="table-responsive mt-4">
          <table className="table table-bordered table-hover align-middle text-center">
            <thead>
              <tr>
                <th>ID Acuerdo</th>
                <th>Incidencia</th>
                <th>Descripción del Acuerdo</th>
              </tr>
            </thead>
            <tbody>
              {acuerdos.length > 0 ? (
                // ✅ CORREGIDO: Propiedades en minúsculas
                acuerdos.map((ac) => (
                  <tr key={ac.id_acuerdo}>
                    <td>{ac.id_acuerdo}</td>
                    <td>{ac.incidencia_descripcion}</td>
                    <td>{ac.descripcion}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">No hay acuerdos asociados a tus reportes.</td>
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

export default MisAcuerdos;