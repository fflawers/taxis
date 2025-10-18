import { BrowserRouter, Routes, Route } from "react-router-dom";
import UsuariosPage from "./components/views/UsuariosPage";
import TaxisPage from "./components/views/TaxisPage";
import Index from "./components";
import Usuarios from "./components/views/Usuarios";
import TaxistasPage from "./components/viewsTaxis/TaxistasPage";
import IncidenciasPage from "./components/views/IncidenciasPage";
import AcuerdosPage from "./components/views/AcuerdosPage";
import ReportesPage from "./components/views/ReportesPage";













function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index/>}/>
          <Route path="/inicio" element={<Usuarios/>}/> 
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/taxis" element={<TaxisPage />} />
          <Route path="/taxistas" element={<TaxistasPage />} />
          <Route path="/incidencias" element={<IncidenciasPage />} />
          <Route path="/acuerdo" element={<AcuerdosPage />} />
          <Route path="/reports" element={<ReportesPage />} />


          
        </Routes>
    </BrowserRouter>
  );
}

export default App;
