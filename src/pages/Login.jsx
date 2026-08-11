import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  const navigate = useNavigate();

  // Configuración de la notificación flotante (Toast)
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end", // Esquina superior derecha (puedes usar 'top', 'top-start', etc.)
    showConfirmButton: false, // Quita el botón de "Aceptar / Continuar"
    timer: 2000, // Se cierra automáticamente en 2 segundos (2000 ms)
    timerProgressBar: true, // Muestra una barra de tiempo abajo
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });

  const manejarLogin = (e) => {
    e.preventDefault();

    // Datos quemados temporalmente
    const correoCorrecto = "admin@empresa.com";
    const contrasenaCorrecta = "123456";

    // Comprobar credenciales
    if (correo === correoCorrecto && contrasena === contrasenaCorrecta) {
      // Muestra la notificación flotante y redirige inmediatamente o al terminar
      Toast.fire({
        icon: "success",
        title: "¡Bienvenido al sistema!",
      });

      // Redirige al dashboard
      navigate("/dashboard");
    } else {
      // Notificación flotante para error de credenciales
      Toast.fire({
        icon: "error",
        title: "Correo o contraseña incorrectos",
      });
    }
  };

  return (
    <div className="login-page">
      <div className="card login-card shadow">
        <div className="card-body p-4 p-md-5">
          {/* Logo */}
          <div className="text-center mb-4">
            <div className="logo-placeholder">LOGO</div>

            <h3 className="mt-3 mb-2">Iniciar sesión</h3>

            <p className="text-muted">Ingresa tus datos para continuar</p>
          </div>

          {/* Formulario */}
          <form onSubmit={manejarLogin}>
            {/* Correo */}
            <div className="mb-3">
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
              />
            </div>

            {/* Contraseña */}
            <div className="mb-3">
              <label htmlFor="contrasena" className="form-label">
                Contraseña
              </label>

              <input
                type="password"
                id="contrasena"
                className="form-control"
                placeholder="Ingresa tu contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
            </div>

            {/* Recuperar contraseña */}
            <div className="text-end mb-4">
              <Link to="/recuperar-contrasena" className="text-decoration-none">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Botón */}
            <button type="submit" className="btn btn-primary w-100 mb-3">
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
