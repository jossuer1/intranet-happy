import React, { useState, useEffect } from "react";
import SidebarOpciones from "./SidebarOpciones";
import TablaUsuarios from "./TablaUsuarios";
import CrearUsuarioWizard from "./CrearUsuarioWizard";
import EditarUsuarioCard from "./EditarUsuarioCard";
import {
  getUsuarios,
  crearUsuario,
  actualizarUsuario,
} from "../services/usuarioService";

const PaginaUsuarios = () => {
  const [opcionActiva, setOpcionActiva] = useState("ver_usuarios");
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cargar usuarios al montar y cuando se active "ver_usuarios"
  useEffect(() => {
    if (opcionActiva === "ver_usuarios") {
      cargarUsuarios();
    }
  }, [opcionActiva]);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (err) {
      setError("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleCrearUsuario = async (payload) => {
    try {
      await crearUsuario(payload);
      await cargarUsuarios(); // Recargar tabla
      setOpcionActiva("ver_usuarios"); // Volver a la tabla
    } catch (err) {
      throw err;
    }
  };

  const handleEditarUsuario = async (idUsuario, payload) => {
    try {
      await actualizarUsuario(idUsuario, payload);
      await cargarUsuarios();
      setOpcionActiva("ver_usuarios");
      setUsuarioSeleccionado(null);
    } catch (err) {
      throw err;
    }
  };

  const handleCancelarEdicion = () => {
    setOpcionActiva("ver_usuarios");
    setUsuarioSeleccionado(null);
  };

  const handleCancelarCreacion = () => {
    setOpcionActiva("ver_usuarios");
  };

  return (
    <div className="container-fluid py-4">
      <div className="row g-4">
        {/* Sidebar */}
        <div className="col-12 col-md-3 col-lg-2">
          <SidebarOpciones
            opcionActiva={opcionActiva}
            setOpcionActiva={setOpcionActiva}
          />
        </div>

        {/* Contenido principal */}
        <div className="col-12 col-md-9 col-lg-10">
          {error && (
            <div
              className="alert alert-danger alert-dismissible fade show"
              role="alert"
            >
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError("")}
              />
            </div>
          )}

          {opcionActiva === "ver_usuarios" && (
            <TablaUsuarios
              usuarios={usuarios}
              onEditar={(usuario) => {
                setUsuarioSeleccionado(usuario);
                setOpcionActiva("editar_usuario");
              }}
            />
          )}

          {opcionActiva === "crear_usuario" && (
            <CrearUsuarioWizard
              onCrear={handleCrearUsuario}
              onCancelar={handleCancelarCreacion}
            />
          )}

          {opcionActiva === "editar_usuario" && usuarioSeleccionado && (
            <EditarUsuarioCard
              usuarioOriginal={usuarioSeleccionado}
              onGuardar={handleEditarUsuario}
              onCancelar={handleCancelarEdicion}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PaginaUsuarios;
