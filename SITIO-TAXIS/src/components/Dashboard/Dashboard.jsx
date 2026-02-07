import { Bar, Pie, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Filler,
    Title,
    Tooltip,
    Legend
);

import { useState, useEffect } from "react";
// Navigation handled by AdminLayout's Sidebar
import "./Dashboard.css";

// Iconos inline para evitar dependencias extra
const Icons = {
    trips: "🚕",
    income: "💰",
    drivers: "👤",
    cars: "🚗",
    chart: "📊",
    up: "↑",
    down: "↓",
    empty: "📭"
};

function Dashboard() {
    const [datos, setDatos] = useState([]);
    const [totalesMensuales, setTotalesMensuales] = useState(null);
    const [kpis, setKpis] = useState(null);
    const [modulo, setModulo] = useState("ingresos_top");
    const [loading, setLoading] = useState(true);
    const [kpisLoading, setKpisLoading] = useState(true);

    const baseUrl = import.meta.env.VITE_API_URL;

    // Fetch KPIs consolidados
    const fetchKPIs = async () => {
        setKpisLoading(true);
        try {
            // Hacemos múltiples llamadas para simular el endpoint de KPIs
            const [resumenRes, ingresosRes] = await Promise.all([
                fetch(`${baseUrl}/dashboard/analisis/resumen_30_dias`),
                fetch(`${baseUrl}/dashboard/ingresos-mensuales`)
            ]);

            const resumen = await resumenRes.json();
            const ingresos = await ingresosRes.json();

            setKpis({
                total_viajes: ingresos?.total_viajes || 0,
                total_ingresos: ingresos?.total_ingreso || 0,
                total_km: ingresos?.total_km || 0,
                total_taxistas: resumen[0]?.total_taxistas || 0,
                total_taxis: resumen[0]?.total_taxis || 0,
                total_reportes: resumen[0]?.total_reportes || 0
            });
        } catch (error) {
            console.error("Error al obtener KPIs:", error);
        } finally {
            setKpisLoading(false);
        }
    };

    const fetchAnalisis = async () => {
        setLoading(true);
        try {
            const endpoint =
                modulo === "ingresos_mensuales"
                    ? "ingresos-mensuales"
                    : modulo === "viajes_top"
                        ? "viajes-top"
                        : "analisis/" + modulo;

            const res = await fetch(`${baseUrl}/dashboard/${endpoint}`);
            const data = await res.json();

            if (modulo === "ingresos_mensuales") {
                setTotalesMensuales(data);
                setDatos([]);
            } else {
                setDatos(Array.isArray(data) ? data : []);
                setTotalesMensuales(null);
            }
        } catch (error) {
            console.error(`Error al obtener análisis de ${modulo}:`, error);
            setDatos([]);
        } finally {
            setLoading(false);
        }
    };

    // Configuración de gráficas con estilo premium
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                labels: {
                    color: "#8892b0",
                    font: { size: 12, weight: "500" }
                }
            },
            tooltip: {
                backgroundColor: "rgba(26, 31, 46, 0.95)",
                titleColor: "#F4D35E",
                bodyColor: "#ffffff",
                borderColor: "rgba(244, 211, 94, 0.3)",
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8
            }
        },
        scales: {
            x: {
                ticks: { color: "#8892b0" },
                grid: { color: "rgba(255, 255, 255, 0.05)" }
            },
            y: {
                ticks: { color: "#8892b0" },
                grid: { color: "rgba(255, 255, 255, 0.05)" }
            }
        }
    };

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
                backgroundColor: [
                    "rgba(102, 126, 234, 0.8)",
                    "rgba(240, 147, 251, 0.8)",
                    "rgba(79, 172, 254, 0.8)",
                    "rgba(67, 233, 123, 0.8)",
                    "rgba(244, 211, 94, 0.8)"
                ],
                borderColor: [
                    "rgba(102, 126, 234, 1)",
                    "rgba(240, 147, 251, 1)",
                    "rgba(79, 172, 254, 1)",
                    "rgba(67, 233, 123, 1)",
                    "rgba(244, 211, 94, 1)"
                ],
                borderWidth: 2,
                borderRadius: 8
            }
        ]
    };

    const getTableHeaders = () => {
        switch (modulo) {
            case "ingresos_top":
                return ["#", "Chofer", "Ingresos"];
            case "viajes_top":
                return ["#", "Chofer", "Viajes"];
            case "choferes_reportados":
                return ["#", "Chofer", "Reportes"];
            case "ingresos_mensuales":
                return ["Total Viajes", "Total KM", "Total Ingresos"];
            default:
                return ["#", "Nombre", "Valor"];
        }
    };

    const getRankBadgeClass = (index) => {
        if (index === 0) return "gold";
        if (index === 1) return "silver";
        if (index === 2) return "bronze";
        return "default";
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat('es-MX').format(value);
    };

    useEffect(() => {
        fetchKPIs();
    }, []);

    useEffect(() => {
        fetchAnalisis();
    }, [modulo]);

    return (
        <div className="dashboard-container">

            <div className="container mt-4">
                {/* Header */}
                <header className="dashboard-header">
                    <h1 className="dashboard-title">Dashboard Operativo</h1>
                    <p className="dashboard-subtitle">Resumen del mes actual • Datos en tiempo real</p>
                </header>

                {/* KPI Cards */}
                <section className="kpi-grid">
                    {kpisLoading ? (
                        <>
                            <div className="skeleton skeleton-card animate-in"></div>
                            <div className="skeleton skeleton-card animate-in"></div>
                            <div className="skeleton skeleton-card animate-in"></div>
                            <div className="skeleton skeleton-card animate-in"></div>
                        </>
                    ) : (
                        <>
                            <div className="kpi-card animate-in">
                                <div className="kpi-icon">{Icons.trips}</div>
                                <p className="kpi-label">Viajes del Mes</p>
                                <h2 className="kpi-value">{formatNumber(kpis?.total_viajes || 0)}</h2>
                                <span className="kpi-trend positive">{Icons.up} Activo</span>
                            </div>

                            <div className="kpi-card animate-in">
                                <div className="kpi-icon">{Icons.income}</div>
                                <p className="kpi-label">Ingresos del Mes</p>
                                <h2 className="kpi-value">{formatCurrency(kpis?.total_ingresos || 0)}</h2>
                                <span className="kpi-trend positive">{Icons.up} MXN</span>
                            </div>

                            <div className="kpi-card animate-in">
                                <div className="kpi-icon">{Icons.drivers}</div>
                                <p className="kpi-label">Taxistas Activos</p>
                                <h2 className="kpi-value">{formatNumber(kpis?.total_taxistas || 0)}</h2>
                                <span className="kpi-trend positive">Registrados</span>
                            </div>

                            <div className="kpi-card animate-in">
                                <div className="kpi-icon">{Icons.cars}</div>
                                <p className="kpi-label">Taxis en Flota</p>
                                <h2 className="kpi-value">{formatNumber(kpis?.total_taxis || 0)}</h2>
                                <span className="kpi-trend positive">Operando</span>
                            </div>
                        </>
                    )}
                </section>

                {/* Module Selector */}
                <div className="row justify-content-center mb-4">
                    <div className="col-md-8 col-lg-6">
                        <div className="module-selector animate-in">
                            <label className="module-selector-label">
                                {Icons.chart} Selecciona el análisis
                            </label>
                            <select
                                className="module-select"
                                value={modulo}
                                onChange={(e) => setModulo(e.target.value)}
                            >
                                <option value="ingresos_top">🏆 Ranking: Ingresos por Chofer</option>
                                <option value="viajes_top">🚕 Ranking: Más Viajes Realizados</option>
                                <option value="choferes_reportados">⚠️ Ranking: Choferes más Reportados</option>
                                <option value="ingresos_mensuales">📊 Resumen: Ingresos Mensuales</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="data-table-container animate-in">
                    {loading ? (
                        <div className="skeleton skeleton-table"></div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    {getTableHeaders().map((header, idx) => (
                                        <th key={idx}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {modulo === "ingresos_mensuales" ? (
                                    totalesMensuales ? (
                                        <tr>
                                            <td className="value-highlight">{formatNumber(totalesMensuales.total_viajes || 0)}</td>
                                            <td className="value-highlight">{formatNumber(totalesMensuales.total_km || 0)} km</td>
                                            <td className="value-highlight">{formatCurrency(totalesMensuales.total_ingreso || 0)}</td>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="empty-state">
                                                <div className="empty-state-icon">{Icons.empty}</div>
                                                <p className="empty-state-text">No hay datos disponibles para el mes actual</p>
                                            </td>
                                        </tr>
                                    )
                                ) : datos.length > 0 ? (
                                    datos.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <span className={`rank-badge ${getRankBadgeClass(index)}`}>
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td>{item.nombre || "N/A"}</td>
                                            <td className="value-highlight">
                                                {modulo === "ingresos_top"
                                                    ? formatCurrency(item.total_ingreso || 0)
                                                    : modulo === "viajes_top"
                                                        ? formatNumber(item.total_viajes || 0)
                                                        : formatNumber(item.total_reportes || 0)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="empty-state">
                                            <div className="empty-state-icon">{Icons.empty}</div>
                                            <p className="empty-state-text">No hay datos disponibles en los últimos 30 días</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Chart */}
                {!loading && modulo !== "ingresos_mensuales" && datos.length > 0 && (
                    <div className="chart-container animate-in">
                        <h3 className="chart-title">
                            {Icons.chart} Visualización: {modulo.replace(/_/g, " ").toUpperCase()}
                        </h3>
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                )}

                {!loading && modulo === "ingresos_mensuales" && totalesMensuales && (
                    <div className="chart-container animate-in">
                        <h3 className="chart-title">
                            {Icons.chart} Distribución de Totales Mensuales
                        </h3>
                        <Pie
                            data={{
                                labels: ["Viajes", "Kilómetros", "Ingresos"],
                                datasets: [{
                                    data: [
                                        Number(totalesMensuales.total_viajes || 0),
                                        Number(totalesMensuales.total_km || 0),
                                        Number(totalesMensuales.total_ingreso || 0) / 1000
                                    ],
                                    backgroundColor: [
                                        "rgba(102, 126, 234, 0.8)",
                                        "rgba(79, 172, 254, 0.8)",
                                        "rgba(67, 233, 123, 0.8)"
                                    ],
                                    borderColor: [
                                        "rgba(102, 126, 234, 1)",
                                        "rgba(79, 172, 254, 1)",
                                        "rgba(67, 233, 123, 1)"
                                    ],
                                    borderWidth: 2
                                }]
                            }}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: "bottom",
                                        labels: { color: "#8892b0" }
                                    }
                                }
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
