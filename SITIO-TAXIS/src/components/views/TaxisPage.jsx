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

  // ✅ --- NUEVOS ESTADOS PARA LA EDICIÓN ---
  const [taxiAEditar, setTaxiAEditar] = useState(null);
  const [formEdicion, setFormEdicion] = useState(null);

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
    // ✅ APUNTAMOS AL ENDPOINT QUE SOLO TRAE TAXISTAS
    const res = await fetch("http://localhost:3000/usuarios/taxistas");
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

// ✅ ---  FUNCIONES PARA LA EDICIÓN ---

  // 1. Abre el modal y carga los datos del taxi seleccionado
  const handleEditClick = (taxi) => {
    setTaxiAEditar(taxi);
    // Pre-cargamos el formulario de edición con los datos actuales del taxi
    setFormEdicion({
      Marca: taxi.Marca,
      Modelo: taxi.Modelo,
      Año: taxi.Año,
      Placa: taxi.Placa,
      no_lista: taxi.no_lista, // Importante para el <select> del conductor
    });
  };

  // 2. Maneja los cambios en los inputs del formulario de edición
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === "Año" && !/^\d{0,4}$/.test(value)) return; // Validacion para año
    setFormEdicion({ ...formEdicion, [name]: value });
  };
  
  // 3. Envía los datos actualizados al backend
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const id = taxiAEditar.economico; // El ID del taxi que estamos editando

    try {
      const res = await fetch(`http://localhost:3000/taxis/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formEdicion),
      });

      if (!res.ok) throw new Error("Error al actualizar el taxi");

      await res.json();
      setTaxiAEditar(null); // Cierra el modal
      fetchTaxis(); // Recarga la lista de taxis para ver los cambios
    } catch (err) {
      console.error("Error al actualizar taxi:", err);
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
                  {/* ✅ --- NUEVO BOTÓN DE EDITAR --- */}
                  <button
                    className="btn btn-sm btn-info me-2"
                    onClick={() => handleEditClick(t)}
                  >
                    Editar
                  </button>
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

      {/* ✅ --- MODAL DE EDICIÓN --- */}
      {taxiAEditar && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editando Taxi Económico #{taxiAEditar.economico}</h5>
                <button type="button" className="btn-close" onClick={() => setTaxiAEditar(null)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdateSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Marca</label>
                    <input type="text" name="Marca" value={formEdicion.Marca} onChange={handleEditChange} className="form-control" required/>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Modelo</label>
                    <input type="text" name="Modelo" value={formEdicion.Modelo} onChange={handleEditChange} className="form-control" required/>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Año</label>
                    <input type="number" name="Año" value={formEdicion.Año} onChange={handleEditChange} className="form-control" min="2000" max="2025" required/>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Placa</label>
                    <input type="text" name="Placa" value={formEdicion.Placa} onChange={handleEditChange} className="form-control" required/>
                  </div>
                   <div className="mb-3">
                    <label className="form-label">Conductor Asignado</label>
                    <select name="no_lista" value={formEdicion.no_lista} onChange={handleEditChange} className="form-select" required>
                      <option value="">-- Reasignar Conductor --</option>
                      {usuarios.map((u) => (
                        <option key={u.no_lista} value={u.no_lista}>
                          {u.nombre} {u.apellido_P}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setTaxiAEditar(null)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      <IndexFooter/>
    </div>
  );
}

export default TaxisPage;