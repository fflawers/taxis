import React, { useState } from "react";
import { useAuth } from "../secure/AuthContext";
import TaxistaNavbar from "../Nabvars/TaxistaNavbar";

function RegistrarIngresos() {
    const { user } = useAuth();

    const [numeroViajes, setNumeroViajes] = useState("");
    const [kilometraje, setKilometraje] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const tarifa = 25;
    const fecha = new Date().toISOString().split("T")[0];

    const baseUrl = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        const payload = {
            no_lista: user.no_lista,
            numero_viajes: Number(numeroViajes),
            kilometraje_recorrido: Number(kilometraje),
            tarifa_aplicada: tarifa,
            fecha
        };

        try {
            const res = await fetch(`${baseUrl}/ingresos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setSuccess(true);
                setNumeroViajes("");
                setKilometraje("");
                setTimeout(() => setSuccess(false), 3000);
            } else {
                alert("Error al guardar ingresos");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const estimatedIncome = numeroViajes && kilometraje
        ? (Number(kilometraje) * tarifa).toLocaleString('es-MX')
        : '0';

    return (
        <div className="taxista-dashboard" style={{ minHeight: '100vh' }}>
            <TaxistaNavbar />

            <div className="page-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                {/* Header */}
                <header className="page-header" style={{ textAlign: 'center' }}>
                    <h1 className="page-title">📝 Registrar Ingresos</h1>
                    <p className="page-subtitle">Registra tus viajes y kilometraje del día</p>
                </header>

                {/* Success Alert */}
                {success && (
                    <div className="glass-card mb-3 animate-fade-in" style={{
                        background: 'var(--color-success-bg)',
                        borderColor: 'var(--color-success)',
                        textAlign: 'center',
                        padding: '1rem'
                    }}>
                        <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                            ✅ ¡Ingresos registrados correctamente!
                        </span>
                    </div>
                )}

                {/* Form Card */}
                <div className="glass-card animate-fade-in">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">🚕 Número de Viajes</label>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Ej: 15"
                                required
                                min="1"
                                value={numeroViajes}
                                onChange={(e) => setNumeroViajes(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">🛣️ Kilometraje Recorrido (km)</label>
                            <input
                                type="number"
                                step="0.1"
                                className="form-control"
                                placeholder="Ej: 45.5"
                                required
                                min="0.1"
                                value={kilometraje}
                                onChange={(e) => setKilometraje(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">💵 Tarifa por km</label>
                            <input
                                type="text"
                                className="form-control"
                                value={`$${tarifa} MXN / km`}
                                disabled
                            />
                        </div>

                        {/* Estimated Income Preview */}
                        <div className="glass-card mb-3" style={{
                            background: 'rgba(244, 211, 94, 0.1)',
                            border: '1px solid rgba(244, 211, 94, 0.3)',
                            textAlign: 'center',
                            padding: '1.5rem'
                        }}>
                            <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                                Ingreso Estimado
                            </p>
                            <p style={{
                                color: 'var(--color-accent)',
                                fontSize: '2rem',
                                fontWeight: 700,
                                margin: 0
                            }}>
                                ${estimatedIncome} MXN
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={loading}
                            style={{ width: '100%' }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <span className="loading-spinner" style={{
                                        width: '18px',
                                        height: '18px',
                                        border: '2px solid var(--color-bg-primary)',
                                        borderTopColor: 'transparent',
                                        borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite'
                                    }}></span>
                                    Guardando...
                                </span>
                            ) : (
                                "💾 Guardar Ingresos"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RegistrarIngresos;
