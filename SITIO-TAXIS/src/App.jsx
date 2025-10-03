import { BrowserRouter, Routes, Route } from "react-router-dom";
import UsuariosPage from "./views/UsuariosPage";
import TaxisPage from "./views/TaxisPage"
import Navbar from "./components/Nabvar";













function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<h1>Panel de Administración de Taxis</h1>} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/taxis" element={<TaxisPage />} />
          {/* Aquí añadirás más rutas */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
