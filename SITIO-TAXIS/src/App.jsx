import { BrowserRouter, Routes, Route } from "react-router-dom";
import UsuariosPage from "./components/views/UsuariosPage";
import TaxisPage from "./components/views/TaxisPage";
import Index from "./components";
import Usuarios from "./components/views/Usuarios";













function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index/>}/>
          <Route path="/inicio" element={<Usuarios/>}/> 
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/taxis" element={<TaxisPage />} />
          {/* Aquí añadirás más rutas */}
        </Routes>
    </BrowserRouter>
  );
}

export default App;
