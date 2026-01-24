import { useEffect, useState } from "react";
import Navbar from "../Nabvars/Nabvar";
import IndexFooter from "../Footers/IndexFooter";

function CentroControlAutomatizado() {
    const [tab, setTab] = useState("reportes");
    const [data, setData] = useState({
        reportes: [],
        incidencias: [],
        incidenciasResueltas: [],
        acuerdos: [],
        taxistas: [],
        taxis: []
    });

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(""); // 🔍 NUEVO: Estado para búsqueda



    const initialForm = {
        no_lista: "", economico: "", fecha_reporte: new Date().toISOString().split('T')[0],
        observaciones: "", id_incidencia: "", descripcion_incidencia: "", id_acuerdo: ""
    };
    const [form, setForm] = useState(initialForm);

    const fetchData = async () => {
        try {
            const url = import.meta.env.VITE_API_URL;

            const [rep, incPend, incRes, acu, taxist, tax] = await Promise.all([
                fetch(`${url}/reportes`),
                fetch(`${url}/incidencias?estado=PENDIENTE`),
                fetch(`${url}/incidencias?estado=RESUELTA`),
                fetch(`${url}/acuerdos`),
                fetch(`${url}/usuarios/taxistas`),
                fetch(`${url}/taxis`)
            ]);

            setData({
                reportes: await rep.json(),
                incidencias: await incPend.json(),
                incidenciasResueltas: await incRes.json(),
                acuerdos: await acu.json(),
                taxistas: await taxist.json(),
                taxis: await tax.json()
            });

            setLoading(false);
        } catch (e) {
            console.error("Error de carga", e);
        }
    };


    useEffect(() => { fetchData(); }, []);

    // 🔍 FILTRO PROTEGIDO: Evita el error "Cannot read properties of null"
    const filteredData = (list, type) => {
        if (!Array.isArray(list)) return []; // Seguridad extra si la lista no es array

        return list.filter(item => {
            const val = searchTerm.toLowerCase();

            // Usamos el operador ?. y || "" para convertir null en un texto vacío
            if (type === 'reportes') {
                const nombre = (item.nombre_conductor || "").toLowerCase();
                const economico = (item.economico || "").toString().toLowerCase();
                return nombre.includes(val) || economico.includes(val);
            }

            const descripcion = (item.descripcion || "").toLowerCase();
            const nombreInc = (item.nombre_conductor || "").toLowerCase();
            return descripcion.includes(val) || nombreInc.includes(val);
        });
    };

    // 🔥 AUTOMATIZACIÓN: Conductor -> Taxi
    useEffect(() => {
        if (form.no_lista) {
            const taxiAsignado = data.taxis.find(t => t.no_lista == form.no_lista);
            if (taxiAsignado) setForm(prev => ({ ...prev, economico: taxiAsignado.economico }));
            else setForm(prev => ({ ...prev, economico: "" }));
        }
    }, [form.no_lista, data.taxis]);

    const handleSubmitMaster = async (e) => {
        e.preventDefault();
        const url = import.meta.env.VITE_API_URL;
        try {
            let currentIncidenciaId = form.id_incidencia;
            if (!currentIncidenciaId && form.descripcion_incidencia) {
                const resInc = await fetch(`${url}/incidencias`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ descripcion: form.descripcion_incidencia, no_lista: form.no_lista })
                });
                const newInc = await resInc.json();
                currentIncidenciaId = newInc.id_incidencia;
            }
            await fetch(`${url}/reportes`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, id_incidencia: currentIncidenciaId })
            });
            setForm(initialForm);
            fetchData();
            alert("✅ Registro procesado");
        } catch (e) { alert("Error"); }
    };

    const autoResolver = async (incidencia) => {
        const url = import.meta.env.VITE_API_URL;

        if (!window.confirm("¿Marcar incidencia como resuelta?")) return;

        try {
            await fetch(`${url}/incidencias/${incidencia.id_incidencia}/resolver`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    descripcion: `Resuelto: ${incidencia.descripcion}`
                })
            });

            fetchData(); // 🔄 refresca todo
            alert("✅ Incidencia resuelta");

        } catch (e) {
            alert("❌ Error al resolver");
        }
    };


    if (loading) return <div className="text-center mt-5">Cargando Sistema Operativo...</div>;

    return (
        <div>
            <Navbar />
            <div className="container mt-4">
                {/* 📊 NUEVO: KPI Cards */}
                <div className="row mb-4">
                    <div className="col-md-4">
                        <div className="card bg-primary text-white shadow-sm border-0 p-3">
                            <h6 className="small text-uppercase fw-bold opacity-75">Taxis Activos</h6>
                            <h2 className="m-0">{data.taxis.length}</h2>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card bg-danger text-white shadow-sm border-0 p-3">
                            <h6 className="small text-uppercase fw-bold opacity-75">Reportes Hoy</h6>
                            <h2 className="m-0">{data.reportes.filter(r =>
                                (r.fecha_reporte || "").includes(
                                    new Date().toISOString().split('T')[0]
                                )
                            ).length}</h2>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card bg-warning text-dark shadow-sm border-0 p-3">
                            <h6 className="small text-uppercase fw-bold opacity-75">Fallas Pendientes</h6>
                            <h2 className="m-0">{data.incidencias.length}</h2>
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="btn-group shadow-sm">
                        <button
                            className={`btn ${tab === 'reportes' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setTab('reportes')}
                        >
                            Reportes Rápidos
                        </button>

                        <button
                            className={`btn ${tab === 'incidencias' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setTab('incidencias')}
                        >
                            Pendientes
                        </button>

                        <button
                            className={`btn ${tab === 'resueltas' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setTab('resueltas')}
                        >
                            Resueltas
                        </button>
                    </div>

                    {/* 🔍 Barra de Búsqueda */}
                    <div className="w-25">
                        <input type="text" className="form-control" placeholder="🔍 Buscar por nombre..."
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                {/* Formulario */}
                <div className="card shadow-sm border-0 mb-4 bg-light">
                    <div className="card-body">
                        <h5 className="fw-bold mb-3">🚀 Registro de Operaciones</h5>
                        <form onSubmit={handleSubmitMaster} className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label small fw-bold">1. Conductor</label>
                                <select className="form-select border-primary" value={form.no_lista} onChange={e => setForm({ ...form, no_lista: e.target.value })} required>
                                    <option value="">-- Buscar Conductor --</option>
                                    {data.taxistas.map(t => <option key={t.no_lista} value={t.no_lista}>{t.nombre}</option>)}
                                </select>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label small fw-bold">2. Taxi (Auto)</label>
                                <input type="text" className="form-control bg-white text-center border-success fw-bold" value={form.economico ? `#${form.economico}` : "S/A"} readOnly />
                            </div>
                            {tab === 'reportes' && (
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-danger">3. ¿Qué sucedió? (Crea incidencia)</label>
                                    <input type="text" className="form-control border-danger shadow-sm" placeholder="Ej: Rayón en puerta derecha"
                                        value={form.descripcion_incidencia} onChange={e => setForm({ ...form, descripcion_incidencia: e.target.value })} />
                                </div>
                            )}
                            <div className="col-12 d-flex justify-content-end border-top pt-3 mt-2">
                                <button type="submit" className="btn btn-dark px-5">Procesar Ahora</button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Tabla con Filtro de Búsqueda Aplicado */}
                <div className="table-responsive">
                    <table className="table table-hover bg-white shadow-sm rounded overflow-hidden">
                        <thead className="table-dark">
                            {tab === 'reportes' ? (
                                // <tr><th>Fecha</th><th>Conductor</th><th>Unidad</th><th>Incidencia</th><th>Acciones</th></tr>
                                <></>
                            ) : (
                                <tr><th>ID</th><th>Descripción</th><th>Conductor</th><th>Estado</th><th>Acciones</th></tr>
                            )}
                        </thead>
                        <tbody className="align-middle">
                            {tab === 'incidencias' &&
                                filteredData(data.incidencias, 'incidencias').map(i => (
                                    <tr key={i.id_incidencia}>
                                        <td>#{i.id_incidencia}</td>
                                        <td>{i.descripcion}</td>
                                        <td>{i.nombre_conductor}</td>
                                        <td>
                                            <span className="badge bg-info">{i.estado}</span>
                                        </td>
                                        <td>
                                            <button className="btn btn-sm btn-success" onClick={() => autoResolver(i)}>
                                                ✅ Resolver
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                            {tab === 'resueltas' &&
                                filteredData(data.incidenciasResueltas, 'incidencias').map(i => (
                                    <tr key={i.id_incidencia}>
                                        <td>#{i.id_incidencia}</td>
                                        <td>{i.descripcion}</td>
                                        <td>{i.nombre_conductor}</td>
                                        <td>
                                            <span className="badge bg-success">{i.estado}</span>
                                        </td>
                                        <td>
                                            <span className="text-muted">✔ Cerrada</span>
                                        </td>
                                    </tr>
                                ))}

                        </tbody>


                    </table>
                </div>
            </div>
            <IndexFooter />
        </div>
    );
}

export default CentroControlAutomatizado;