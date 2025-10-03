import { BrowserRouter, Routes, Route } from "react-router-dom";
import UsuariosPage from "./components/views/UsuariosPage";
import TaxisPage from "./components/views/TaxisPage";
import Index from "./components";













function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index/>}/>
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/taxis" element={<TaxisPage />} />
          {/* Aquí añadirás más rutas */}
        </Routes>
    </BrowserRouter>
  );
}

export default App;
