// src/pages/TaxisPage.jsx
import { useEffect, useState } from "react";
import Navbar from "../Nabvars/Nabvar";
import IndexFooter from "../Footers/IndexFooter";

function TaxisPage() {
  const [taxis, setTaxis] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

const [form, setForm] = useState({
  marca: "",
  modelo: "",
  año: "", 
  placa: "",
  no_lista: "",
});

  const [taxiAEditar, setTaxiAEditar] = useState(null);
  const [formEdicion, setFormEdicion] = useState(null);

  const fetchTaxis = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/taxis`);
      if (!res.ok) throw new Error("Error al obtener taxis");
      const data = await res.json();
      setTaxis(data);
    } catch (err) {
      console.error("Error al obtener taxis:", err);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/taxistas`);
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
  if (name === "año") { 
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/taxis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al crear taxi");
      }
      setForm({ marca: "", modelo: "", año: "", placa: "", no_lista: "" });
      fetchTaxis();
    } catch (err) {
      console.error("Error al crear taxi:", err);
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/taxis/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar taxi");
      fetchTaxis();
    } catch (err) {
      console.error("Error al eliminar taxi:", err);
    }
  };

  const handleEditClick = (taxi) => {
  setTaxiAEditar(taxi);
  setFormEdicion({
    marca: taxi.marca || '',
    modelo: taxi.modelo || '',
    año: taxi.año || '', 
    placa: taxi.placa || '',
    no_lista: taxi.no_lista || '',
  });
};

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === "año" && !/^\d{0,4}$/.test(value)) return;
    setFormEdicion({ ...formEdicion, [name]: value });
  };
  
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const id = taxiAEditar.economico;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/taxis/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formEdicion),
      });
      if (!res.ok) throw new Error("Error al actualizar el taxi");
      
      setTaxiAEditar(null);
      fetchTaxis();
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
              <input type="text" className="inputTP" name="marca" placeholder="Marca" value={form.marca} onChange={handleChange} required />
            </div>
            <div className="col-md-2">
              <input type="text" className="inputTP" name="modelo" placeholder="Modelo" value={form.modelo} onChange={handleChange} required />
            </div>
            <div className="col-md-2">
              <input type="number" className="inputTP" name="año" placeholder="Año (ej. 2023)" value={form.año} onChange={handleChange} min="2000" max="2025" required />
            </div>
            <div className="col-md-2">
              <input type="text" className="inputTP" name="placa" placeholder="Placa" value={form.placa} onChange={handleChange} required />
            </div>
            <div className="col-md-2">
              <select className="inputTP" name="no_lista" value={form.no_lista} onChange={handleChange} required>
                <option value="">-- Selecciona un Conductor --</option>
                {usuarios.map((u) => (
                  <option key={u.no_lista} value={u.no_lista}>{u.nombre} {u.apellido_p}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-green" type="submit">Agregar</button>
            </div>
          </div>
        </form>
      </div>

      <div className="mb-5 container">
        <h2>Económicos disponibles:</h2>
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle text-center">
            <thead>
              <tr>
                <th scope="col">Económico</th>
                <th scope="col">Marca</th>
                <th scope="col">Modelo</th>
                <th scope="col">Año</th>
                <th scope="col">Placa</th>
                <th scope="col">Conductor Asignado</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {taxis.map((t) => (
              <tr key={t.economico}>
                <td>{t.economico}</td>
                <td>{t.marca}</td>
                <td>{t.modelo}</td>
                <td>{t.año}</td>
                <td>{t.placa}</td>
                <td>{t.nombre_conductor || "Sin asignar"}</td>
                <td>
                  <button className="btn btn-sm btn-info me-2 mb-3" onClick={() => handleEditClick(t)}>Editar</button>
                  <button className="btn btn-sm btn-danger mb-3" onClick={() => handleDelete(t.economico)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {taxiAEditar && formEdicion && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editando Taxi Económico #{taxiAEditar.economico}</h5>
                <button type="button" className="btn-close" onClick={() => setTaxiAEditar(null)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdateSubmit}>
                  <div className="mb-3"><label className="form-label">Marca</label><input type="text" name="marca" value={formEdicion.marca} onChange={handleEditChange} className="form-control" required/></div>
                  <div className="mb-3"><label className="form-label">Modelo</label><input type="text" name="modelo" value={formEdicion.modelo} onChange={handleEditChange} className="form-control" required/></div>
                  <div className="mb-3"><label className="form-label">Año</label><input type="number" name="año" value={formEdicion.año} onChange={handleEditChange} className="form-control" min="2000" max="2025" required/></div>
                  <div className="mb-3"><label className="form-label">Placa</label><input type="text" name="placa" value={formEdicion.placa} onChange={handleEditChange} className="form-control" required/></div>
                  <div className="mb-3">
                    <label className="form-label">Conductor Asignado</label>
                    <select name="no_lista" value={formEdicion.no_lista} onChange={handleEditChange} className="form-select" required>
                      <option value="">-- Reasignar Conductor --</option>
                      {usuarios.map((u) => (
                        <option key={u.no_lista} value={u.no_lista}>{u.nombre} {u.apellido_p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setTaxiAEditar(null)}>Cancelar</button>
                    <button type="submit" className="btn btn-green-general">Guardar Cambios</button>
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