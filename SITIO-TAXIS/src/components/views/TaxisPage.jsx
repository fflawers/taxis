// src/pages/TaxisPage.jsx
import { useEffect, useState } from "react";
import Navbar from "../Nabvars/Nabvar";
import IndexFooter from "../Footers/IndexFooter";

function TaxisPage() {
  const [taxis, setTaxis] = useState([]);
  const [usuarios, setUsuarios] = useState([]); // <-- Para el selector de conductor
  const [form, setForm] = useState({
    Marca: "",
    Modelo: "",
    Año: "",
    Placa: "",
    no_lista: "", // <-- El ID del usuario seleccionado
  });

  const fetchTaxis = async () => {
    try {
      const res = await fetch("http://localhost:3000/taxis");
      if (!res.ok) throw new Error("Error al obtener taxis");
      const data = await res.json();
      setTaxis(data);
    } catch (err) {
      console.error("Error al obtener taxis:", err);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const res = await fetch("http://localhost:3000/usuarios");
      if (!res.ok) throw new Error("Error al obtener usuarios");
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
    }
  };

  useEffect(() => {
    fetchTaxis();
    fetchUsuarios();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "Año") {
      if (/^\d{0,4}$/.test(value)) {
        setForm({ ...form, [name]: value });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.no_lista) {
      alert("Por favor, selecciona un conductor.");
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/taxis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error al crear taxi");

      setForm({ Marca: "", Modelo: "", Año: "", Placa: "", no_lista: "" });
      fetchTaxis();
    } catch (err) {
      console.error("Error al crear taxi:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/taxis/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar taxi");

      fetchTaxis();
    } catch (err) {
      console.error("Error al eliminar taxi:", err);
    }
  };

  return (
    <div>
      <Navbar />
      <h1 className="container text-center mt-4 fw-bold">Administrar Taxis</h1>
      <div className="container">
        <h2 className="justify-content-center">Agregar Taxi:</h2>
        <form onSubmit={handleSubmit} className="container text-center my-4">
          <div className="row g-3 justify-content-center">
            <div className="col-md-2">
              <input
                type="text"
                className="inputTP"
                name="Marca"
                placeholder="Marca"
                value={form.Marca}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-2">
              <input
                type="text"
                className="inputTP"
                name="Modelo"
                placeholder="Modelo"
                value={form.Modelo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-2">
              <input
                type="number"
                className="inputTP"
                name="Año"
                placeholder="Año (ej. 2023)"
                value={form.Año}
                onChange={handleChange}
                min="2000"
                max="2025"
                required
              />
            </div>

            <div className="col-md-2">
              <input
                type="text"
                className="inputTP"
                name="Placa"
                placeholder="Placa"
                value={form.Placa}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-2">
              <select
                className="inputTP"
                name="no_lista"
                value={form.no_lista}
                onChange={handleChange}
                required
              >
                <option value="">-- Selecciona un Conductor --</option>
                {usuarios.map((u) => (
                  <option key={u.no_lista} value={u.no_lista}>
                    {u.nombre} {u.apellido_P}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <button className="btn btn-green" type="submit">
                Agregar
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Tabla de taxis */}
      <div className="mb-5 container">
        <div>
          <h2>Economicos desponibles:</h2>
        </div>
        <div className=" table-responsive">
          <table className="table table-bordered table-hover align-middle text-center">
            <thead className="table">
              <tr>
                <th scope="col">Económico</th>
                <th scope="col">Marca</th>
                <th scope="col">Modelo</th>
                <th scope="col">Placa</th>
                <th scope="col">Conductor Asignado</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {taxis.map((t) => (
                <tr key={t.economico}>
                  <td>{t.economico}</td>
                  <td>{t.Marca}</td>
                  <td>{t.Modelo}</td>
                  <td>{t.Placa}</td>
                  <td>{t.nombre_conductor || "Sin asignar"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(t.economico)}
                    >
                      Eliminar
                    </button>
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

export default TaxisPage;
