import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthContainer from "../pages/AuthContainer";
import Dashboard from "../pages/Dashboard";
import GestionUsuarios from "../pages/GestionUsuarios";
import MiPerfil from "../pages/usuario/MiPerfil";
import MisVacaciones from "../pages/usuario/MisVacaciones";
import RegistroAsistencia from "../pages/usuario/RegistroAsistencia";
import GestionNovedades from "../pages/GestionNovedades";
import GestionVacaciones from "../pages/GestionVacaciones";
import SaldosPersonal from "../pages/SaldosPersonales"; // Importar la nueva página

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthContainer />} />
        {/* Compatibilidad con enlaces antiguos: ahora la recuperación vive dentro de /login */}
        <Route path="/recuperar-contrasena" element={<Navigate to="/login" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* RRHH - Gestión de Usuarios */}
        <Route path="/gestion-usuarios" element={<GestionUsuarios />} />
        <Route path="/gestion-usuarios/crear" element={<GestionUsuarios />} />

        {/* RRHH - Gestión de Novedades */}
        <Route path="/gestion-novedades" element={<GestionNovedades />} />
        <Route
          path="/gestion-novedades/activos"
          element={<GestionNovedades />}
        />
        <Route
          path="/gestion-novedades/publicar"
          element={<GestionNovedades />}
        />

        {/* RRHH - Gestión de Vacaciones */}
        <Route path="/gestion-vacaciones" element={<GestionVacaciones />} />
        {/* AHORA APUNTA A LA NUEVA VISTA DE SALDOS */}
        <Route path="/gestion-vacaciones/saldos" element={<SaldosPersonal />} />

        {/* Autogestión Empleado */}
        <Route path="/mi-perfil" element={<MiPerfil />} />
        <Route path="/mis-vacaciones" element={<MisVacaciones />} />
        <Route path="/registro-asistencia" element={<RegistroAsistencia />} />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;