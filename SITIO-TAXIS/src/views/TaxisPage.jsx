// src/pages/TaxisPage.jsx
import { useEffect, useState } from "react";

function TaxisPage() {
  const [taxis, setTaxis] = useState([]);
  const [usuarios, setUsuarios] = useState([]); // <-- Para el selector de conductor
  const [form, setForm] = useState({
    Marca: "",
    Modelo: "",
    Año: "",
    Placa: "",
    no_lista: "" // <-- El ID del usuario seleccionado
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
    setForm({ ...form, [e.target.name]: e.target.value });
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
      <h1>Administrar Taxis</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          name="Marca"
          placeholder="Marca"
          value={form.Marca}
          onChange={handleChange}
          required
        />
        <input
          name="Modelo"
          placeholder="Modelo"
          value={form.Modelo}
          onChange={handleChange}
          required
        />
        <input
          name="Año"
          type="date"
          value={form.Año}
          onChange={handleChange}
          required
        />
        <input
          name="Placa"
          placeholder="Placa"
          value={form.Placa}
          onChange={handleChange}
          required
        />

        {/* Selector para asignar conductor */}
        <select
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

        <button type="submit">Agregar Taxi</button>
      </form>

      {/* Tabla de taxis */}
      <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Económico</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Placa</th>
            <th>Conductor Asignado</th>
            <th>Acciones</th>
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
                <button onClick={() => handleDelete(t.economico)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TaxisPage;
