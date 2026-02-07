import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/secure/AuthContext";
import ProtectedRoute from "./components/secure/ProtectedRoute";

// Layouts
import AdminLayout from "./components/Layout/AdminLayout";

// Admin Views
import UsuariosPage from "./components/views/UsuariosPage";
import TaxisPage from "./components/views/TaxisPage";
import Index from "./components/Index/Index";
import Usuarios from "./components/views/Usuarios";
import IncidenciasPage from "./components/views/IncidenciasPage";
import AcuerdosPage from "./components/views/AcuerdosPage";
import ReportesPage from "./components/views/ReportesPage";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import GestionActivos from "./components/views/GestionActivos";
import Reports from "./components/views/Reports";

// Taxista Views
import TaxistaDashboard from "./components/viewsTaxis/TaxistaDashboard";
import MisReportes from "./components/viewsTaxis/MisReportes";
import MisAcuerdos from "./components/viewsTaxis/MisAcuerdos";
import RegistrarIngresos from "./components/viewsTaxis/RegistrarIngresos";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Index />} />

          {/* Admin Routes with Sidebar Layout */}
          <Route element={<ProtectedRoute rolRequerido="admin" />}>
            <Route element={<AdminLayout />}>
              <Route path="/inicio" element={<Usuarios />} />
              <Route path="/dashbor" element={<Dashboard />} />
              <Route path="/gestion" element={<GestionActivos />} />
              <Route path="/usuarios" element={<UsuariosPage />} />
              <Route path="/taxis" element={<TaxisPage />} />
              <Route path="/incidencias" element={<IncidenciasPage />} />
              <Route path="/acuerdo" element={<AcuerdosPage />} />
              <Route path="/reports" element={<ReportesPage />} />
              <Route path="/reporte" element={<Reports />} />
            </Route>
          </Route>

          {/* Taxista Routes with Gamified Dashboard */}
          <Route element={<ProtectedRoute rolRequerido="taxista" />}>
            <Route path="/taxistas" element={<TaxistaDashboard />} />
            <Route path="/reportes" element={<MisReportes />} />
            <Route path="/resolution" element={<MisAcuerdos />} />
            <Route path="/ingresos" element={<RegistrarIngresos />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;