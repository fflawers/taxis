import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../secure/AuthContext";
import TaxistaNavbar from "../Nabvars/TaxistaNavbar";
import IndexFooter from "../Footers/IndexFooter";
import "./TaxistaDashboard.css";

function TaxistaDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const baseUrl = import.meta.env.VITE_API_URL;

    // Calculate level based on total income
    const calculateLevel = (totalIncome) => {
        if (totalIncome >= 100000) return { name: "PLATINO", icon: "💎", progress: 100, color: "platinum" };
        if (totalIncome >= 50000) return { name: "ORO", icon: "🥇", progress: (totalIncome / 100000) * 100, color: "gold" };
        if (totalIncome >= 20000) return { name: "PLATA", icon: "🥈", progress: (totalIncome / 50000) * 100, color: "silver" };
        return { name: "BRONCE", icon: "🥉", progress: (totalIncome / 20000) * 100, color: "bronze" };
    };

    // Achievements system
    const getAchievements = (stats) => [
        {
            id: 1,
            icon: "🚗",
            name: "Primer Viaje",
            desc: "Completa tu primer viaje",
            unlocked: stats?.total_viajes >= 1
        },
        {
            id: 2,
            icon: "🔟",
            name: "10 Viajes",
            desc: "Completa 10 viajes",
            unlocked: stats?.total_viajes >= 10
        },
        {
            id: 3,
            icon: "💯",
            name: "100 Viajes",
            desc: "Completa 100 viajes",
            unlocked: stats?.total_viajes >= 100
        },
        {
            id: 4,
            icon: "🛣️",
            name: "Explorador",
            desc: "Recorre 500 km",
            unlocked: stats?.km_totales >= 500
        },
        {
            id: 5,
            icon: "💰",
            name: "Primer Sueldo",
            desc: "Genera $5,000 MXN",
            unlocked: stats?.ingresos_totales >= 5000
        },
        {
            id: 6,
            icon: "⭐",
            name: "Estrella",
            desc: "Sin reportes activos",
            unlocked: stats?.reportes_activos === 0
        }
    ];

    useEffect(() => {
        const fetchStats = async () => {
            if (!user?.no_lista) return;

            try {
                const now = new Date();
                const mes = now.getMonth() + 1;
                const anio = now.getFullYear();

                // Fetch monthly stats
                const [ingresosRes, reportesRes] = await Promise.all([
                    fetch(`${baseUrl}/ingresos/taxista/${user.no_lista}?mes=${mes}&anio=${anio}`),
                    fetch(`${baseUrl}/reportes/taxista/${user.no_lista}`)
                ]);

                const ingresos = await ingresosRes.json();
                const reportes = await reportesRes.json();

                setStats({
                    total_viajes: Number(ingresos?.total_viajes || 0),
                    ingresos_totales: Number(ingresos?.ingresos_totales || 0),
                    km_totales: Number(ingresos?.km_totales || 0),
                    reportes_activos: Array.isArray(reportes) ? reportes.length : 0
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
                setStats({
                    total_viajes: 0,
                    ingresos_totales: 0,
                    km_totales: 0,
                    reportes_activos: 0
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user, baseUrl]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0
        }).format(value || 0);
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat('es-MX').format(value || 0);
    };

    if (loading) {
        return (
            <div className="taxista-dashboard">
                <TaxistaNavbar />
                <div className="taxista-loading">
                    <div className="loading-spinner"></div>
                    <p>Cargando tu información...</p>
                </div>
            </div>
        );
    }

    const level = calculateLevel(stats?.ingresos_totales || 0);
    const achievements = getAchievements(stats);
    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <div className="taxista-dashboard">
            <TaxistaNavbar />

            {/* Welcome Header */}
            <header className="taxista-header">
                <div className="taxista-welcome">
                    <div className="taxista-avatar">👤</div>
                    <div className="taxista-greeting">
                        <h1>¡Hola, {user?.nombre || "Conductor"}! 👋</h1>
                        <p>Bienvenido de vuelta. Aquí está tu progreso de este mes.</p>

                        {/* Level Progress */}
                        <div className="taxista-level">
                            <span className={`level-badge ${level.color}`}>
                                {level.icon} Nivel {level.name}
                            </span>
                            <div className="level-progress">
                                <div className="level-progress-bar">
                                    <div
                                        className="level-progress-fill"
                                        style={{ width: `${Math.min(level.progress, 100)}%` }}
                                    ></div>
                                </div>
                                <span className="level-progress-text">
                                    {level.progress.toFixed(0)}% para el siguiente nivel
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <section className="taxista-stats-grid">
                <div className="taxista-stat-card">
                    <span className="stat-icon">🚕</span>
                    <div className="stat-value">{formatNumber(stats?.total_viajes)}</div>
                    <div className="stat-label">Viajes Este Mes</div>
                    <span className="stat-trend positive">↑ Activo</span>
                </div>

                <div className="taxista-stat-card">
                    <span className="stat-icon">💰</span>
                    <div className="stat-value">{formatCurrency(stats?.ingresos_totales)}</div>
                    <div className="stat-label">Ingresos del Mes</div>
                    <span className="stat-trend positive">MXN</span>
                </div>

                <div className="taxista-stat-card">
                    <span className="stat-icon">🛣️</span>
                    <div className="stat-value">{formatNumber(stats?.km_totales)} km</div>
                    <div className="stat-label">Kilómetros Recorridos</div>
                    <span className="stat-trend neutral">Este mes</span>
                </div>

                <div className="taxista-stat-card">
                    <span className="stat-icon">📋</span>
                    <div className="stat-value">{stats?.reportes_activos || 0}</div>
                    <div className="stat-label">Reportes Activos</div>
                    <span className={`stat-trend ${stats?.reportes_activos > 0 ? 'neutral' : 'positive'}`}>
                        {stats?.reportes_activos > 0 ? 'Pendientes' : '✓ Sin reportes'}
                    </span>
                </div>
            </section>

            {/* Achievements */}
            <section className="taxista-achievements">
                <h2 className="section-title">
                    🏆 Logros ({unlockedCount}/{achievements.length})
                </h2>
                <div className="achievements-grid">
                    {achievements.map((achievement) => (
                        <div
                            key={achievement.id}
                            className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                        >
                            {!achievement.unlocked && <span className="achievement-lock">🔒</span>}
                            <span className="achievement-icon">{achievement.icon}</span>
                            <div className="achievement-name">{achievement.name}</div>
                            <div className="achievement-desc">{achievement.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Quick Actions */}
            <section className="taxista-actions">
                <h2 className="section-title">⚡ Acciones Rápidas</h2>
                <div className="actions-grid">
                    <Link to="/ingresos" className="action-btn">
                        <div className="action-icon">📝</div>
                        <div className="action-text">
                            <div className="action-title">Registrar Ingresos</div>
                            <div className="action-desc">Añade tus viajes del día</div>
                        </div>
                    </Link>

                    <Link to="/reportes" className="action-btn">
                        <div className="action-icon">📋</div>
                        <div className="action-text">
                            <div className="action-title">Mis Reportes</div>
                            <div className="action-desc">Ver historial de reportes</div>
                        </div>
                    </Link>

                    <Link to="/resolution" className="action-btn">
                        <div className="action-icon">✅</div>
                        <div className="action-text">
                            <div className="action-title">Mis Acuerdos</div>
                            <div className="action-desc">Resoluciones de incidencias</div>
                        </div>
                    </Link>
                </div>
            </section>

            <IndexFooter />
        </div>
    );
}

export default TaxistaDashboard;
