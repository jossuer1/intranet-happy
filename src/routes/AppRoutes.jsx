import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import RecuperarContrasena from "../pages/RecuperarContraseña";
import Dashboard from "../pages/Dashboard";
import GestionUsuarios from "../pages/GestionUsuarios";
import MiPerfil from "../pages/usuario/MiPerfil";
import MisVacaciones from "../pages/usuario/MisVacaciones";
import GestionNovedades from "../pages/GestionNovedades";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />

        <Route path="/dashboard" element={<Dashboard />} />

        {/* RRHH - Se agregan ambas rutas para apuntar al mismo componente */}
        <Route path="/gestion-usuarios" element={<GestionUsuarios />} />
        <Route path="/gestion-usuarios/crear" element={<GestionUsuarios />} />

        <Route path="/gestion-novedades" element={<GestionNovedades />} />
        <Route
          path="/gestion-novedades/activos"
          element={<GestionNovedades />}
        />
        <Route
          path="/gestion-novedades/publicar"
          element={<GestionNovedades />}
        />

        {/* Usuario normal */}
        <Route path="/mi-perfil" element={<MiPerfil />} />
        <Route path="/mis-vacaciones" element={<MisVacaciones />} />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
