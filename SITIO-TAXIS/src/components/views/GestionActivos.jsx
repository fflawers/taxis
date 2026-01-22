import { useState, useEffect } from "react";
import Navbar from "../Nabvars/Nabvar";
import IndexFooter from "../Footers/IndexFooter";

function GestionActivos() {
    const [usuarios, setUsuarios] = useState([]);
    const [taxis, setTaxis] = useState([]);
    const [tabActual, setTabActual] = useState("usuarios");

    // Estados para Modales
    const [showModalUser, setShowModalUser] = useState(false);
    const [showModalTaxi, setShowModalTaxi] = useState(false);
    const [editando, setEditando] = useState(false);

    // Formulario de Usuario
    const [formUser, setFormUser] = useState({
        no_lista: "",
        nombre: "",
        apellido_p: "",
        apellido_m: "",
        rol: "Taxista",
        estatus: "Activo",
        contrasena: "123456",
        edad: "25",
        fecha_de_nacimiento: "2000-01-01"
    });

    // Formulario de Taxi
    const [formTaxi, setFormTaxi] = useState({
        economico: "",
        marca: "",
        modelo: "",
        placa: "",
        no_lista: "", // ID del Conductor asignado
        estatus: "Activo"
    });

    const fetchData = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL;
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
            const baseUrl = import.meta.env.VITE_API_URL;
            const metodo = editando ? "PUT" : "POST";
            const url = editando ? `${baseUrl}/usuarios/${formUser.no_lista}` : `${baseUrl}/usuarios`;

            const res = await fetch(url, {
                method: metodo,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formUser)
            });

            if (res.ok) {
                alert(editando ? "Usuario actualizado" : "Usuario creado");
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
            const baseUrl = import.meta.env.VITE_API_URL;
            const metodo = editando ? "PUT" : "POST";
            const url = editando ? `${baseUrl}/taxis/${formTaxi.economico}` : `${baseUrl}/taxis`;

            const res = await fetch(url, {
                method: metodo,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formTaxi)
            });

            if (res.ok) {
                alert(editando ? "Unidad actualizada" : "Unidad registrada");
                setShowModalTaxi(false);
                fetchData();
            }
        } catch (error) { console.error("Error al guardar taxi:", error); }
    };

    // --- FUNCIÓN GENÉRICA DE BAJA ---
    const handleBaja = async (id, tipo) => {
        if (!window.confirm(`¿Seguro que deseas eliminar este ${tipo === 'usuario' ? 'usuario' : 'taxi'}?`)) return;
        try {
            const baseUrl = import.meta.env.VITE_API_URL;
            const endpoint = tipo === 'usuario' ? `usuarios/${id}` : `taxis/${id}`;
            const res = await fetch(`${baseUrl}/${endpoint}`, { method: "DELETE" });
            if (res.ok) {
                alert("Eliminado con éxito");
                fetchData();
            }
        } catch (error) { console.error("Error en baja:", error); }
    };

    return (
        <div>
            <Navbar />
            <div className="container mt-4 mb-5">
                <h1 className="text-center fw-bold mb-4">Centro de Control de Activos</h1>

                <ul className="nav nav-pills justify-content-center mb-4 p-2 bg-light rounded shadow-sm">
                    <li className="nav-item">
                        <button className={`nav-link ${tabActual === "usuarios" ? "active" : ""}`} onClick={() => setTabActual("usuarios")}>👥 Personal</button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link ${tabActual === "taxis" ? "active" : ""}`} onClick={() => setTabActual("taxis")}>🚖 Flota</button>
                    </li>
                </ul>

                <div className="card shadow border-0 p-4">
                    {tabActual === "usuarios" ? (
                        <div className="table-responsive">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h3 className="fw-bold m-0">Gestión de Personal</h3>
                                <button className="btn btn-primary" onClick={() => abrirModalUser()}>+ Nuevo Usuario</button>
                            </div>
                            <table className="table table-hover align-middle">
                                <thead className="table-dark text-center">
                                    <tr><th>ID</th><th>Nombre</th><th>Rol</th><th>Estatus</th><th>Acciones</th></tr>
                                </thead>
                                <tbody>
                                    {usuarios.map(u => (
                                        <tr key={u.no_lista} className="text-center">
                                            <td>{u.no_lista}</td>
                                            <td>{u.nombre} {u.apellido_p}</td>
                                            <td><span className="badge bg-secondary">{u.rol}</span></td>
                                            <td>
                                                <span className={`badge ${u.estatus === 'Activo' ? 'bg-success' : 'bg-danger'}`}>
                                                    {u.estatus || 'Activo'}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn btn-sm btn-info me-2 text-white" onClick={() => abrirModalUser(u)}>Editar</button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleBaja(u.no_lista, 'usuario')}>Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h3 className="fw-bold m-0">Gestión de Flota</h3>
                                <button className="btn btn-success" onClick={() => abrirModalTaxi()}>+ Registrar Taxi</button>
                            </div>
                            <table className="table table-hover align-middle text-center">
                                <thead className="table-dark">
                                    <tr><th>Eco</th><th>Placa</th><th>Conductor</th><th>Estado</th><th>Acciones</th></tr>
                                </thead>
                                <tbody>
                                    {taxis.map(t => (
                                        <tr key={t.economico}>
                                            <td className="fw-bold">#{t.economico}</td>
                                            <td>{t.placa}</td>
                                            <td>{t.nombre_conductor || "Sin asignar"}</td>
                                            <td>
                                                <span className={`badge ${t.estatus === 'Mantenimiento' ? 'bg-warning text-dark' : 'bg-success'}`}>
                                                    {t.estatus || 'Activo'}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn btn-sm btn-info me-2 text-white" onClick={() => abrirModalTaxi(t)}>Editar</button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleBaja(t.economico, 'taxi')}>Baja</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL USUARIO */}
            {showModalUser && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header bg-dark text-white">
                                <h5 className="modal-title">{editando ? "Editar Usuario" : "Registrar Personal"}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModalUser(false)}></button>
                            </div>
                            <form onSubmit={handleGuardarUser}>
                                <div className="modal-body p-4 text-start">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Nombre(s)</label>
                                            <input type="text" className="form-control" value={formUser.nombre} onChange={(e) => setFormUser({ ...formUser, nombre: e.target.value })} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Apellido Paterno</label>
                                            <input type="text" className="form-control" value={formUser.apellido_p} onChange={(e) => setFormUser({ ...formUser, apellido_p: e.target.value })} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Rol</label>
                                            <select className="form-select" value={formUser.rol} onChange={(e) => setFormUser({ ...formUser, rol: e.target.value })}>
                                                <option value="Taxista">Taxista</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Estatus</label>
                                            <select className="form-select" value={formUser.estatus} onChange={(e) => setFormUser({ ...formUser, estatus: e.target.value })}>
                                                <option value="Activo">Activo</option>
                                                <option value="Inactivo">Inactivo</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModalUser(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary">{editando ? "Guardar Cambios" : "Crear Usuario"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL TAXI */}
            {showModalTaxi && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header bg-success text-white">
                                <h5 className="modal-title">{editando ? "Editar Unidad" : "Nueva Unidad"}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModalTaxi(false)}></button>
                            </div>
                            <form onSubmit={handleGuardarTaxi}>
                                <div className="modal-body p-4 text-start">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Económico</label>
                                            <input type="number" className="form-control" value={formTaxi.economico} onChange={(e) => setFormTaxi({ ...formTaxi, economico: e.target.value })} required disabled={editando} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Placa</label>
                                            <input type="text" className="form-control" value={formTaxi.placa} onChange={(e) => setFormTaxi({ ...formTaxi, placa: e.target.value })} required />
                                        </div>
                                        <div className="col-md-6 text-start">
                                            <label className="form-label fw-bold">Asignar Conductor</label>
                                            <select className="form-select" value={formTaxi.no_lista} onChange={(e) => setFormTaxi({ ...formTaxi, no_lista: e.target.value })}>
                                                <option value="">-- Sin asignar --</option>
                                                {usuarios.filter(u => u.rol === 'Taxista').map(u => (
                                                    <option key={u.no_lista} value={u.no_lista}>{u.nombre} {u.apellido_p}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6 text-start">
                                            <label className="form-label fw-bold">Estado</label>
                                            <select className="form-select" value={formTaxi.estatus} onChange={(e) => setFormTaxi({ ...formTaxi, estatus: e.target.value })}>
                                                <option value="Activo">Activo</option>
                                                <option value="Mantenimiento">Mantenimiento</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModalTaxi(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-success">{editando ? "Guardar Cambios" : "Registrar Taxi"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <IndexFooter />
        </div>
    );
}

export default GestionActivos;