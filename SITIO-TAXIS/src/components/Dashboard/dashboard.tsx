import { useState, useEffect } from "react";
import Navbar from "../Nabvars/Nabvar";
import IndexFooter from "../Footers/IndexFooter";

interface DashboardAnalytics {
  total_reportes?: number;
  total_taxistas?: number;
  total_taxis?: number;
  nombre?: string;
  total_ingreso?: number;
  total_viajes?: number;
  total_km?: number;
}

function Dashboard() {
  const [datos, setDatos] = useState<DashboardAnalytics[]>([]);
  const [modulo, setModulo] = useState<string>("resumen_30_dias");

  const fetchAnalisis = async () => {
    try {
      const baseUrl = (import.meta as any).env.VITE_API_URL;
      const endpoint =
        modulo === "ingresos_mensuales"
          ? "ingresos-mensuales"
          : "analisis/" + modulo;
      const res = await fetch(`${baseUrl}/dashboard/${endpoint}`);
      const data = await res.json();
      setDatos(data);
    } catch (error) {
      console.error(`Error al obtener análisis de ${modulo}:`, error);
    }
  };

  useEffect(() => {
    fetchAnalisis();
  }, [modulo]);

  return (
    <div>
      <Navbar />
      <div className="container mt-4 mb-5">
        <h1 className="text-center fw-bold mb-4">Dashboard Operativo (Últimos 30 días)</h1>

        {/* Selector de Módulos */}
        <div className="row justify-content-center mb-5">
          <div className="col-md-6">
            <div className="card p-3 shadow-sm">
              <label className="form-label fw-bold">Selecciona el módulo a analizar:</label>
              <select
                className="form-select"
                value={modulo}
                onChange={(e) => setModulo(e.target.value)}
              >
                <option value="resumen_30_dias">Resumen General</option>
                <option value="ingresos_top">Ranking: Ingresos por Chofer</option>
                <option value="choferes_reportados">Ranking: Choferes más Reportados</option>
                <option value="viajes_top">Ranking: Más viajes realizados</option>
                <option value="ingresos_mensuales">Resumen Ingresos Mensuales</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover table-bordered align-middle text-center">
            <thead className="table-dark">
              {modulo === "resumen_30_dias" && (
                <tr>
                  <th>Total Reportes</th>
                  <th>Taxistas Activos</th>
                  <th>Total Taxis</th>
                </tr>
              )}

              {(modulo === "ingresos_top" || modulo === "choferes_reportados" || modulo === "viajes_top") && (
                <tr>
                  <th>Posición</th>
                  <th>Nombre del Chofer</th>
                  <th>
                    {modulo === "ingresos_top"
                      ? "Monto Total"
                      : modulo === "viajes_top"
                        ? "Total Viajes"
                        : "Total Reportes"}
                  </th>
                </tr>
              )}

              {modulo === "ingresos_mensuales" && (
                <tr>
                  <th>Posición</th>
                  <th>Nombre del Chofer</th>
                  <th>Total Viajes</th>
                  <th>Total KM</th>
                  <th>Ingresos MXN</th>
                </tr>
              )}
            </thead>

            <tbody>
              {datos.length > 0 ? (
                datos.map((item, index) => (
                  <tr key={index}>
                    {modulo === "resumen_30_dias" && (
                      <>
                        <td>{item.total_reportes || 0}</td>
                        <td>{item.total_taxistas || 0}</td>
                        <td>{item.total_taxis || 0}</td>
                      </>
                    )}

                    {(modulo === "ingresos_top" || modulo === "choferes_reportados" || modulo === "viajes_top") && (
                      <>
                        <td>{index + 1}</td>
                        <td>{item.nombre || "N/A"}</td>
                        <td className="fw-bold text-primary">
                          {modulo === "ingresos_top"
                            ? `$${Number(item.total_ingreso || 0).toFixed(2)}`
                            : modulo === "viajes_top"
                              ? item.total_viajes || 0
                              : item.total_reportes || 0}
                        </td>
                      </>
                    )}

                    {modulo === "ingresos_mensuales" && (
                      <>
                        <td>{index + 1}</td>
                        <td>{item.nombre || "N/A"}</td>
                        <td>{item.total_viajes || 0}</td>
                        <td>{item.total_km || 0}</td>
                        <td className="fw-bold text-primary">
                          ${Number(item.total_ingreso || 0).toFixed(2)}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={modulo === "ingresos_mensuales" ? 5 : 3}>
                    Cargando datos o no hay registros en los últimos 30 días...
                  </td>
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

export default Dashboard;
