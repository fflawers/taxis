import { useState, useEffect } from "react";
// Navigation handled by AdminLayout's Sidebar

function GestionActivos() {
    const [usuarios, setUsuarios] = useState([]);
    const [taxis, setTaxis] = useState([]);
    const [tabActual, setTabActual] = useState("usuarios");
    const [loading, setLoading] = useState(true);

    // Estados para Modales
    const [showModalUser, setShowModalUser] = useState(false);
    const [showModalTaxi, setShowModalTaxi] = useState(false);
    const [editando, setEditando] = useState(false);

    // Formulario de Usuario
    const [formUser, setFormUser] = useState({
        no_lista: "", nombre: "", apellido_p: "", apellido_m: "",
        rol: "Taxista", estatus: "Activo", contrasena: "123456",
        edad: "25", fecha_de_nacimiento: "2000-01-01"
    });

    // Formulario de Taxi
    const [formTaxi, setFormTaxi] = useState({
        economico: "", marca: "", modelo: "", placa: "",
        no_lista: "", estatus: "Activo"
    });

    const baseUrl = import.meta.env.VITE_API_URL;

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resUsers, resTaxis] = await Promise.all([
                fetch(`${baseUrl}/usuarios`),
                fetch(`${baseUrl}/taxis`)
            ]);
            const dataUsers = await resUsers.json();
            const dataTaxis = await resTaxis.json();

            setUsuarios(Array.isArray(dataUsers) ? dataUsers : []);
            setTaxis(Array.isArray(dataTaxis) ? dataTaxis : []);
        } catch (error) {
            console.error("Error al cargar datos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // --- LÓGICA DE USUARIOS ---
    const abrirModalUser = (user = null) => {
        if (user) {
            setFormUser({ ...user, contrasena: "" });
            setEditando(true);
        } else {
            setFormUser({
                no_lista: "", nombre: "", apellido_p: "", apellido_m: "",
                rol: "Taxista", estatus: "Activo", contrasena: "123456",
                edad: "25", fecha_de_nacimiento: "2000-01-01"
            });
            setEditando(false);
        }
        setShowModalUser(true);
    };

    const handleGuardarUser = async (e) => {
        e.preventDefault();
        try {
            const metodo = editando ? "PUT" : "POST";
            const url = editando ? `${baseUrl}/usuarios/${formUser.no_lista}` : `${baseUrl}/usuarios`;

            const res = await fetch(url, {
                method: metodo,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formUser)
            });

            if (res.ok) {
                setShowModalUser(false);
                fetchData();
            }
        } catch (error) { console.error("Error al guardar usuario:", error); }
    };

    // --- LÓGICA DE TAXIS ---
    const abrirModalTaxi = (taxi = null) => {
        if (taxi) {
            setFormTaxi(taxi);
            setEditando(true);
        } else {
            setFormTaxi({ economico: "", marca: "", modelo: "", placa: "", no_lista: "", estatus: "Activo" });
            setEditando(false);
        }
        setShowModalTaxi(true);
    };

    const handleGuardarTaxi = async (e) => {
        e.preventDefault();
        try {
            const metodo = editando ? "PUT" : "POST";
            const url = editando ? `${baseUrl}/taxis/${formTaxi.economico}` : `${baseUrl}/taxis`;

            const res = await fetch(url, {
                method: metodo,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formTaxi)
            });

            if (res.ok) {
                setShowModalTaxi(false);
                fetchData();
            }
        } catch (error) { console.error("Error al guardar taxi:", error); }
    };

    // --- FUNCIÓN GENÉRICA DE BAJA ---
    const handleBaja = async (id, tipo) => {
        if (!window.confirm(`¿Seguro que deseas eliminar este ${tipo === 'usuario' ? 'usuario' : 'taxi'}?`)) return;
        try {
            const endpoint = tipo === 'usuario' ? `usuarios/${id}` : `taxis/${id}`;
            const res = await fetch(`${baseUrl}/${endpoint}`, { method: "DELETE" });
            if (res.ok) { fetchData(); }
        } catch (error) { console.error("Error en baja:", error); }
    };

    const getStatusBadge = (status, type = 'user') => {
        if (type === 'taxi') {
            if (status === 'Mantenimiento') return 'badge-warning';
            return 'badge-success';
        }
        return status === 'Activo' ? 'badge-success' : 'badge-danger';
    };

    return (
        <div className="page-container">
            {/* Page Header */}
            <header className="page-header">
                <h1 className="page-title">🎛️ Centro de Control</h1>
                <p className="page-subtitle">Gestión de personal y flota de taxis</p>
            </header>

            {/* Tab Selector */}
            <div className="glass-card mb-3" style={{ padding: '0.5rem' }}>
                <div className="flex gap-2">
                    <button
                        className={`btn ${tabActual === 'usuarios' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setTabActual("usuarios")}
                    >
                        👥 Personal
                    </button>
                    <button
                        className={`btn ${tabActual === 'taxis' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setTabActual("taxis")}
                    >
                        🚖 Flota
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="glass-card animate-fade-in">
                {tabActual === "usuarios" ? (
                    <>
                        <div className="glass-card-header">
                            <h3 className="glass-card-title">👥 Gestión de Personal</h3>
                            <button className="btn btn-primary" onClick={() => abrirModalUser()}>
                                + Nuevo Usuario
                            </button>
                        </div>

                        {loading ? (
                            <div className="animate-stagger">
                                {[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-table-row"></div>)}
                            </div>
                        ) : usuarios.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">👥</div>
                                <p className="empty-state-title">No hay personal registrado</p>
                                <p className="empty-state-text">Agrega tu primer usuario para comenzar</p>
                            </div>
                        ) : (
                            <div className="premium-table-container">
                                <table className="premium-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Nombre</th>
                                            <th>Rol</th>
                                            <th>Estatus</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="animate-stagger">
                                        {usuarios.map(u => (
                                            <tr key={u.no_lista}>
                                                <td><strong>#{u.no_lista}</strong></td>
                                                <td>{u.nombre} {u.apellido_p}</td>
                                                <td><span className="badge badge-info">{u.rol}</span></td>
                                                <td>
                                                    <span className={`badge ${getStatusBadge(u.estatus)}`}>
                                                        {u.estatus || 'Activo'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="flex gap-1">
                                                        <button className="btn btn-secondary btn-sm" onClick={() => abrirModalUser(u)}>
                                                            ✏️ Editar
                                                        </button>
                                                        <button className="btn btn-danger btn-sm" onClick={() => handleBaja(u.no_lista, 'usuario')}>
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className="glass-card-header">
                            <h3 className="glass-card-title">🚖 Gestión de Flota</h3>
                            <button className="btn btn-success" onClick={() => abrirModalTaxi()}>
                                + Registrar Taxi
                            </button>
                        </div>

                        {loading ? (
                            <div className="animate-stagger">
                                {[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-table-row"></div>)}
                            </div>
                        ) : taxis.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">🚖</div>
                                <p className="empty-state-title">No hay taxis registrados</p>
                                <p className="empty-state-text">Agrega tu primer taxi para comenzar</p>
                            </div>
                        ) : (
                            <div className="premium-table-container">
                                <table className="premium-table">
                                    <thead>
                                        <tr>
                                            <th>Económico</th>
                                            <th>Placa</th>
                                            <th>Conductor</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="animate-stagger">
                                        {taxis.map(t => (
                                            <tr key={t.economico}>
                                                <td><strong className="text-accent">#{t.economico}</strong></td>
                                                <td>{t.placa}</td>
                                                <td>{t.nombre_conductor || <span className="text-muted">Sin asignar</span>}</td>
                                                <td>
                                                    <span className={`badge ${getStatusBadge(t.estatus, 'taxi')}`}>
                                                        {t.estatus || 'Activo'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="flex gap-1">
                                                        <button className="btn btn-secondary btn-sm" onClick={() => abrirModalTaxi(t)}>
                                                            ✏️ Editar
                                                        </button>
                                                        <button className="btn btn-danger btn-sm" onClick={() => handleBaja(t.economico, 'taxi')}>
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* MODAL USUARIO */}
            {showModalUser && (
                <div className="modal-overlay" onClick={() => setShowModalUser(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editando ? "✏️ Editar Usuario" : "➕ Nuevo Usuario"}
                            </h3>
                            <button className="modal-close" onClick={() => setShowModalUser(false)}>✕</button>
                        </div>
                        <form onSubmit={handleGuardarUser}>
                            <div className="modal-body">
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Nombre(s)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formUser.nombre}
                                            onChange={(e) => setFormUser({ ...formUser, nombre: e.target.value })}
                                            placeholder="Juan"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Apellido Paterno</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formUser.apellido_p}
                                            onChange={(e) => setFormUser({ ...formUser, apellido_p: e.target.value })}
                                            placeholder="Pérez"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Rol</label>
                                        <select
                                            className="form-control form-select"
                                            value={formUser.rol}
                                            onChange={(e) => setFormUser({ ...formUser, rol: e.target.value })}
                                        >
                                            <option value="Taxista">Taxista</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Estatus</label>
                                        <select
                                            className="form-control form-select"
                                            value={formUser.estatus}
                                            onChange={(e) => setFormUser({ ...formUser, estatus: e.target.value })}
                                        >
                                            <option value="Activo">Activo</option>
                                            <option value="Inactivo">Inactivo</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModalUser(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editando ? "💾 Guardar Cambios" : "✅ Crear Usuario"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL TAXI */}
            {showModalTaxi && (
                <div className="modal-overlay" onClick={() => setShowModalTaxi(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editando ? "✏️ Editar Unidad" : "🚖 Nueva Unidad"}
                            </h3>
                            <button className="modal-close" onClick={() => setShowModalTaxi(false)}>✕</button>
                        </div>
                        <form onSubmit={handleGuardarTaxi}>
                            <div className="modal-body">
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Económico</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={formTaxi.economico}
                                            onChange={(e) => setFormTaxi({ ...formTaxi, economico: e.target.value })}
                                            placeholder="001"
                                            required
                                            disabled={editando}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Placa</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formTaxi.placa}
                                            onChange={(e) => setFormTaxi({ ...formTaxi, placa: e.target.value })}
                                            placeholder="ABC-123"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Asignar Conductor</label>
                                        <select
                                            className="form-control form-select"
                                            value={formTaxi.no_lista}
                                            onChange={(e) => setFormTaxi({ ...formTaxi, no_lista: e.target.value })}
                                        >
                                            <option value="">-- Sin asignar --</option>
                                            {usuarios.filter(u => u.rol === 'Taxista').map(u => (
                                                <option key={u.no_lista} value={u.no_lista}>
                                                    {u.nombre} {u.apellido_p}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Estado</label>
                                        <select
                                            className="form-control form-select"
                                            value={formTaxi.estatus}
                                            onChange={(e) => setFormTaxi({ ...formTaxi, estatus: e.target.value })}
                                        >
                                            <option value="Activo">Activo</option>
                                            <option value="Mantenimiento">Mantenimiento</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModalTaxi(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-success">
                                    {editando ? "💾 Guardar Cambios" : "✅ Registrar Taxi"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GestionActivos;