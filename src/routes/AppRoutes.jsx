import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import RecuperarContrasena from "../pages/RecuperarContraseña";
import Dashboard from "../pages/Dashboard";
import GestionUsuarios from "../pages/GestionUsuarios";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/gestion-usuarios" element={<GestionUsuarios />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
