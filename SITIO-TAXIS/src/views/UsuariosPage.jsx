import { useEffect, useState } from "react";

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({
    rol: "",
    contraseña: "",
    nombre: "",
    apellido_P: "",
    apellido_M: "",
    Edad: "",
    Fecha_de_nacimiento: ""
  });

  // ✅ Traer todos los usuarios
  const fetchUsuarios = () => {
    fetch("http://localhost:3000/usuarios")
      .then(res => res.json())
      .then(data => setUsuarios(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  //  Manejar cambios en el formulario
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  //  Crear usuario
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:3000/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(() => {
        setForm({
          rol: "",
          contraseña: "",
          nombre: "",
          apellido_P: "",
          apellido_M: "",
          Edad: "",
          Fecha_de_nacimiento: ""
        });
        fetchUsuarios(); 
      })
      .catch(err => console.error(err));
  };

  //  Eliminar usuario
  const handleDelete = (id) => {
    fetch(`http://localhost:3000/usuarios/${id}`, { method: "DELETE" })
      .then(res => res.json())
      .then(() => fetchUsuarios())
      .catch(err => console.error(err));
  };

  return (
    <div>
      <h1>Usuarios</h1>

      <form onSubmit={handleSubmit}>
        <input name="rol" placeholder="Rol" value={form.rol} onChange={handleChange} required />
        <input name="contraseña" placeholder="Contraseña" value={form.contraseña} onChange={handleChange} required />
        <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
        <input name="apellido_P" placeholder="Apellido P" value={form.apellido_P} onChange={handleChange} required />
        <input name="apellido_M" placeholder="Apellido M" value={form.apellido_M} onChange={handleChange} required />
        <input name="Edad" type="number" placeholder="Edad" value={form.Edad} onChange={handleChange} required />
        <input name="Fecha_de_nacimiento" type="date" value={form.Fecha_de_nacimiento} onChange={handleChange} required />
        <button type="submit">Agregar Usuario</button>
      </form>

      <ul>
        {usuarios.map(u => (
          <li key={u.no_lista}>
            {u.nombre} {u.apellido_P} {u.apellido_M} ({u.rol})
            <button onClick={() => handleDelete(u.no_lista)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UsuariosPage;
