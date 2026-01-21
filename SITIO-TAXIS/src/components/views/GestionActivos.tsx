import { useState, useEffect } from "react";
import Navbar from "../Nabvars/Nabvar";
import IndexFooter from "../Footers/IndexFooter";

interface Usuario {
    no_lista: number;
    nombre: string;
    apellido_p: string;
    rol: string;
}

interface Taxi {
    economico: number;
    marca: string;
    modelo: string;
    placa: string;
    no_lista: number;
    nombre_conductor?: string;
    estatus?: string;
}

function GestionActivos() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [taxis, setTaxis] = useState<Taxi[]>([]);
    const [tabActual, setTabActual] = useState<"usuarios" | "taxis">("usuarios");

    // Estado para edición/reasignación
    const [seleccionado, setSeleccionado] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);

    const fetchData = async () => {
        try {
            const baseUrl = (import.meta as any).env.VITE_API_URL;
            const [resUsers, resTaxis] = await Promise.all([
                fetch(`${baseUrl}/usuarios`),
                fetch(`${baseUrl}/taxis`)
            ]);
            setUsuarios(await resUsers.json());
            setTaxis(await resTaxis.json());
        } catch (error) { console.error("Error:", error); }
    };

    useEffect(() => { fetchData(); }, []);

    // --- FUNCIONES DE ACCIÓN ---

    const handleBaja = async (id: number, tipo: 'usuario' | 'taxi') => {
        if (!window.confirm(`¿Seguro que deseas dar de baja este ${tipo}?`)) return;
        try {
            const baseUrl = (import.meta as any).env.VITE_API_URL;
            const endpoint = tipo === 'usuario' ? `usuarios/${id}` : `taxis/${id}`;
            const res = await fetch(`${baseUrl}/${endpoint}`, { method: "DELETE" });
            if (res.ok) fetchData();
        } catch (error) { console.error("Error en baja:", error); }
    };

    const handleMantenimiento = async (economico: number, estatusActual: string) => {
        const nuevoEstatus = estatusActual === "Mantenimiento" ? "Activo" : "Mantenimiento";
        try {
            const baseUrl = (import.meta as any).env.VITE_API_URL;
            // Reutilizamos tu endpoint de PUT taxis
            await fetch(`${baseUrl}/taxis/${economico}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estatus: nuevoEstatus })
            });
            fetchData();
        } catch (error) { console.error("Error mantenimiento:", error); }
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
                            <table className="table table-hover">
                                <thead><tr><th>Nombre</th><th>Rol</th><th>Acciones</th></tr></thead>
                                <tbody>
                                    {usuarios.map(u => (
                                        <tr key={u.no_lista}>
                                            <td>{u.nombre} {u.apellido_p}</td>
                                            <td><span className="badge bg-secondary">{u.rol}</span></td>
                                            <td>
                                                <button className="btn btn-sm btn-info me-2">Editar</button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleBaja(u.no_lista, 'usuario')}>Baja</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead><tr><th>Eco</th><th>Placa</th><th>Conductor</th><th>Estado</th><th>Acciones</th></tr></thead>
                                <tbody>
                                    {taxis.map(t => (
                                        <tr key={t.economico}>
                                            <td className="fw-bold">#{t.economico}</td>
                                            <td>{t.placa}</td>
                                            <td>{t.nombre_conductor || "S/A"}</td>
                                            <td>
                                                <span className={`badge ${t.estatus === 'Mantenimiento' ? 'bg-warning text-dark' : 'bg-success'}`}>
                                                    {t.estatus || 'Activo'}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleMantenimiento(t.economico, t.estatus || 'Activo')}>
                                                    {t.estatus === "Mantenimiento" ? "Listo" : "Taller"}
                                                </button>
                                                <button className="btn btn-sm btn-outline-primary me-2">Reasignar</button>
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
            <IndexFooter />
        </div>
    );
}

export default GestionActivos;