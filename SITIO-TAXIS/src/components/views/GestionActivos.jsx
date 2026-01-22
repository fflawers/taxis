import { useState, useEffect } from "react";
import Navbar from "../Nabvars/Nabvar";
import IndexFooter from "../Footers/IndexFooter";

function GestionActivos() {
    const [usuarios, setUsuarios] = useState([]);
    const [taxis, setTaxis] = useState([]);
    const [tabActual, setTabActual] = useState("usuarios");

    // Estados para el Modal de Usuario
    const [showModal, setShowModal] = useState(false);
    const [editando, setEditando] = useState(false);
    const [formUser, setFormUser] = useState({
        no_lista: "",
        nombre: "",
        apellido_p: "",
        rol: "Taxista",
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
            console.error("Error al cargar activos:", error);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // --- LÓGICA DE USUARIOS ---

    const abrirModal = (user = null) => {
        if (user) {
            setFormUser(user);
            setEditando(true);
        } else {
            setFormUser({ no_lista: "", nombre: "", apellido_p: "", rol: "Taxista", estatus: "Activo" });
            setEditando(false);
        }
        setShowModal(true);
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        const baseUrl = import.meta.env.VITE_API_URL;
        const metodo = editando ? "PUT" : "POST";
        const url = editando ? `${baseUrl}/usuarios/${formUser.no_lista}` : `${baseUrl}/usuarios`;

        try {
            const res = await fetch(url, {
                method: metodo,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formUser)
            });

            if (res.ok) {
                alert(editando ? "Usuario actualizado con éxito" : "Usuario creado con éxito");
                setShowModal(false);
                fetchData();
            }
        } catch (error) { console.error("Error al guardar:", error); }
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
                                <button className="btn btn-primary" onClick={() => abrirModal()}>+ Nuevo Usuario</button>
                            </div>
                            <table className="table table-hover align-middle">
                                <thead className="table-dark">
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre Completo</th>
                                        <th>Rol</th>
                                        <th>Estatus</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios.map(u => (
                                        <tr key={u.no_lista}>
                                            <td>{u.no_lista}</td>
                                            <td>{u.nombre} {u.apellido_p}</td>
                                            <td><span className="badge bg-secondary">{u.rol}</span></td>
                                            <td>
                                                <span className={`badge ${u.estatus === 'Activo' ? 'bg-success' : 'bg-danger'}`}>
                                                    {u.estatus || 'Activo'}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn btn-sm btn-info me-2 text-white" onClick={() => abrirModal(u)}>Editar</button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleBaja(u.no_lista, 'usuario')}>Baja</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            {/* Aquí va tu tabla de taxis existente */}
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL PARA AGREGAR/EDITAR USUARIO */}
            {showModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header bg-dark text-white">
                                <h5 className="modal-title">{editando ? "Editar Usuario" : "Registrar Nuevo Usuario"}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleGuardar}>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label fw-bold">Número de Lista (ID)</label>
                                            <input type="number" className="form-control" value={formUser.no_lista} onChange={(e) => setFormUser({ ...formUser, no_lista: e.target.value })} required disabled={editando} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Nombre</label>
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
                                <div className="modal-footer bg-light">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary">{editando ? "Guardar Cambios" : "Crear Usuario"}</button>
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