import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { solicitarRecuperacion } from "../services/apiService";

function RecuperarContrasena() {
  const [correo, setCorreo] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });

  const manejarRecuperacion = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      // Llamada a la API (si existe el endpoint)
      const respuesta = await solicitarRecuperacion(correo);

      // Simulación exitosa por el momento
      Toast.fire({
        icon: "success",
        title: "Instrucciones enviadas al correo registrado",
      });

      // Redirigir al login después de un momento
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: "No se pudo procesar la solicitud",
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="card login-card shadow">
        <div className="card-body p-4 p-md-5">
          {/* Logo */}
          <div className="text-center mb-4">
            <div className="logo-placeholder">LOGO</div>

            <h3 className="mt-3 mb-2">Recuperar contraseña</h3>

            <p className="text-muted">
              Ingresa tu correo electrónico y te enviaremos las instrucciones
              para recuperar tu contraseña.
            </p>
          </div>

          <form onSubmit={manejarRecuperacion}>
            <div className="mb-4">
              <label htmlFor="correo" className="form-label">
                Correo electrónico
              </label>

              <input
                type="email"
                id="correo"
                className="form-control"
                placeholder="correo@empresa.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                disabled={cargando}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mb-3"
              disabled={cargando}
            >
              {cargando ? "Enviando..." : "Enviar instrucciones"}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-decoration-none">
                Volver al inicio de sesión
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RecuperarContrasena;
