import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../secure/AuthContext";
import "./Sidebar.css";

function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [pendingIncidencias, setPendingIncidencias] = useState(0);

    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const baseUrl = import.meta.env.VITE_API_URL;

    // Fetch pending incidencias count for badge
    useEffect(() => {
        const fetchPendientes = async () => {
            try {
                const res = await fetch(`${baseUrl}/incidencias`);
                if (res.ok) {
                    const data = await res.json();
                    // Count all incidencias (could filter by estado if available)
                    setPendingIncidencias(Array.isArray(data) ? data.length : 0);
                }
            } catch (error) {
                console.error("Error fetching incidencias:", error);
            }
        };

        fetchPendientes();
        // Refresh every 30 seconds
        const interval = setInterval(fetchPendientes, 30000);
        return () => clearInterval(interval);
    }, [baseUrl]);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const closeMobile = () => setMobileOpen(false);

    const navItems = [
        {
            section: "Principal",
            items: [
                { path: "/dashbor", icon: "📊", label: "Dashboard", tooltip: "Dashboard" },
                { path: "/gestion", icon: "🎛️", label: "Centro de Control", tooltip: "Control" },
            ]
        },
        {
            section: "Gestión",
            items: [
                { path: "/incidencias", icon: "⚠️", label: "Incidencias", tooltip: "Incidencias", badge: pendingIncidencias || null },
                { path: "/reports", icon: "📋", label: "Reportes", tooltip: "Reportes" },
                { path: "/acuerdo", icon: "🤝", label: "Acuerdos", tooltip: "Acuerdos" },
            ]
        }
    ];

    const isActive = (path) => location.pathname === path;

    const getInitials = (name) => {
        if (!name) return "AD";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`sidebar-overlay ${mobileOpen ? 'visible' : ''}`}
                onClick={closeMobile}
            />

            {/* Mobile Toggle Button */}
            <button
                className="mobile-menu-btn"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
            >
                {mobileOpen ? "✕" : "☰"}
            </button>

            {/* Sidebar */}
            <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
                {/* Toggle Button */}
                <button
                    className="sidebar-toggle"
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label="Toggle sidebar"
                >
                    {collapsed ? "→" : "←"}
                </button>

                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">🚕</div>
                    <div className="sidebar-logo-text">
                        <span className="sidebar-logo-title">TaxiControl</span>
                        <span className="sidebar-logo-subtitle">Panel Admin</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {navItems.map((section, idx) => (
                        <div key={idx} className="sidebar-section">
                            <div className="sidebar-section-title">{section.section}</div>
                            {section.items.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`sidebar-nav-item ${isActive(item.path) ? 'active' : ''}`}
                                    data-tooltip={item.tooltip}
                                    onClick={closeMobile}
                                >
                                    <span className="sidebar-nav-icon">{item.icon}</span>
                                    <span className="sidebar-nav-text">{item.label}</span>
                                    {item.badge && (
                                        <span className="sidebar-badge">{item.badge}</span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* User Section */}
                <div className="sidebar-user">
                    <div className="sidebar-user-avatar">
                        {getInitials(user?.nombre)}
                    </div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{user?.nombre || "Administrador"}</div>
                        <div className="sidebar-user-role">{user?.rol || "Admin"}</div>
                    </div>
                    <button
                        className="sidebar-logout"
                        onClick={handleLogout}
                        title="Cerrar sesión"
                    >
                        🚪
                    </button>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
