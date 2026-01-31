import React, { useState } from "react";
import { useAuth } from "../secure/AuthContext";
import TaxistaNavbar from "../Nabvars/TaxistaNavbar";
import IndexFooter from "../Footers/IndexFooter";

function RegistrarIngresos() {
    const { user } = useAuth();

    const [numeroViajes, setNumeroViajes] = useState("");
    const [kilometraje, setKilometraje] = useState("");
    const tarifa = 25; // MXN por km (puede venir del backend)
    const fecha = new Date().toISOString().split("T")[0];

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            no_lista: user.no_lista,
            numero_viajes: Number(numeroViajes),
            kilometraje_recorrido: Number(kilometraje),
            tarifa_aplicada: tarifa,
            fecha
        };

        const res = await fetch(`${import.meta.env.VITE_API_URL}/ingresos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Ingresos registrados correctamente");
            setNumeroViajes("");
            setKilometraje("");
        } else {
            alert("Error al guardar ingresos");
        }
    };

    return (
        <div>
            <TaxistaNavbar />
            <div className="container mt-4">
                <h2 className="text-center fw-bold">Registrar Ingresos</h2>

                <form onSubmit={handleSubmit} className="card p-4 mt-4">
                    <div className="mb-3">
                        <label>Número de viajes</label>
                        <input
                            type="number"
                            className="form-control"
                            required
                            value={numeroViajes}
                            onChange={(e) => setNumeroViajes(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label>Kilometraje recorrido (km)</label>
                        <input
                            type="number"
                            step="0.1"
                            className="form-control"
                            required
                            value={kilometraje}
                            onChange={(e) => setKilometraje(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label>Tarifa aplicada</label>
                        <input
                            type="text"
                            className="form-control"
                            value={`$${tarifa} MXN / km`}
                            disabled
                        />
                    </div>

                    <button className="btn btn-success w-100">
                        Guardar ingresos
                    </button>
                </form>
            </div>
            <IndexFooter />
        </div>
    );
}

export default RegistrarIngresos;
