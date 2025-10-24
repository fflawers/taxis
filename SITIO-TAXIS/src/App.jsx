import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/secure/AuthContext"; // Importa el Provider
import ProtectedRoute from "./components/secure/ProtectedRoute";

import UsuariosPage from "./components/views/UsuariosPage";
import TaxisPage from "./components/views/TaxisPage";
import Index from "./components/Index/Index";
import Usuarios from "./components/views/Usuarios";
import TaxistasPage from "./components/viewsTaxis/TaxistasPage";
import IncidenciasPage from "./components/views/IncidenciasPage";
import AcuerdosPage from "./components/views/AcuerdosPage";
import ReportesPage from "./components/views/ReportesPage";
import MisReportes from "./components/viewsTaxis/MisReportes";
import MisAcuerdos from "./components/viewsTaxis/MisAcuerdos";












function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          <Route element={<ProtectedRoute rolRequerido="admin" />}>
            <Route path="/inicio" element={<Usuarios />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/taxis" element={<TaxisPage />} />
            <Route path="/incidencias" element={<IncidenciasPage />} />
            <Route path="/acuerdo" element={<AcuerdosPage />} />
            <Route path="/reports" element={<ReportesPage />} />
          </Route>

          {/* Rutas Protegidas para Taxistas */}
          <Route element={<ProtectedRoute rolRequerido="taxista" />}>
            <Route path="/taxistas" element={<TaxistasPage />} />
            <Route path="/reportes" element={<MisReportes />} />
            <Route path="/resolution" element={<MisAcuerdos />} />


          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;