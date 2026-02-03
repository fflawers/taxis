import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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

interface TotalesMensuales {
  total_viajes: number;
  total_km: number;
  total_ingreso: number;
}

function Dashboard() {
  const [datos, setDatos] = useState<DashboardAnalytics[]>([]);
  const [totalesMensuales, setTotalesMensuales] = useState<TotalesMensuales | null>(null);
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

      if (modulo === "ingresos_mensuales") {
        setTotalesMensuales(data);  // Es un objeto con totales
        setDatos([]);               // Limpiar listado para evitar renderizaciones erróneas
      } else {
        setDatos(data);
        setTotalesMensuales(null);
      }
    } catch (error) {
      console.error(`Error al obtener análisis de ${modulo}:`, error);
    }
  };


  // Datos para gráficas
  const chartData = {
    labels: datos.map(d => d.nombre || "N/A"),
    datasets: [
      {
        label:
          modulo === "ingresos_top"
            ? "Ingresos MXN"
            : modulo === "viajes_top"
              ? "Total Viajes"
              : "Total Reportes",
        data: datos.map(d =>
          modulo === "ingresos_top"
            ? Number(d.total_ingreso || 0)
            : modulo === "viajes_top"
              ? Number(d.total_viajes || 0)
              : Number(d.total_reportes || 0)
        ),
        backgroundColor: "rgba(54, 162, 235, 0.6)"
      }
    ]
  };

  const totalesMensualesData = {
    labels: ["Total Viajes", "Total KM", "Total Ingresos"],
    datasets: [
      {
        label: "Totales Mes Actual",
        data: totalesMensuales
          ? [
            Number(totalesMensuales.total_viajes),
            Number(totalesMensuales.total_km),
            Number(totalesMensuales.total_ingreso)
          ]
          : [0, 0, 0],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(255, 99, 132, 0.6)"
        ]
      }
    ]
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
                {/* <option value="resumen_30_dias">Resumen General</option> */}
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
              {/* ...tus th según módulo... */}
            </thead>
            <tbody>
              {modulo === "ingresos_mensuales" ? (
                totalesMensuales ? (
                  <tr>
                    <td>{totalesMensuales.total_viajes}</td>
                    <td>{totalesMensuales.total_km}</td>
                    <td className="fw-bold text-primary">
                      ${Number(totalesMensuales.total_ingreso || 0).toFixed(2)}
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={3}>Cargando datos o no hay registros en el mes actual...</td>
                  </tr>
                )
              ) : datos.length > 0 ? (
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={modulo === "ingresos_mensuales" ? 3 : 3}>
                    Cargando datos o no hay registros en los últimos 30 días...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Gráficas */}
        {modulo !== "resumen_30_dias" && datos.length > 0 && modulo !== "ingresos_mensuales" && (
          <div className="mt-5">
            <h5 className="text-center">Gráfica {modulo.replace("_", " ")}</h5>
            <Bar data={chartData} options={{ responsive: true }} />
          </div>
        )}

        {modulo === "ingresos_mensuales" && totalesMensuales && (
          <div className="mt-5">
            <h5 className="text-center">Totales Mensuales</h5>
            <Bar data={totalesMensualesData} options={{ responsive: true }} />
          </div>
        )}

      </div>

      <IndexFooter />
    </div>
  );
}

export default Dashboard;
