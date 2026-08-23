import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuthStore } from "../store/useAuthStore";
import { cambiarContrasenaObligatoria } from "../services/apiService";

function Login() {
  const [cedula, setCedula] = useState("");
  const [contrasena, setContrasena] = useState("");

  // Estados para el flujo de cambio obligatorio superpuesto
  const [requiereCambioPassword, setRequiereCambioPassword] = useState(false);
  const [idUsuarioTemp, setIdUsuarioTemp] = useState(null);
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [procesandoCambio, setProcesandoCambio] = useState(false);

  const login = useAuthStore((state) => state.login);
  const cargando = useAuthStore((state) => state.cargando);

  const navigate = useNavigate();

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });

  // 1. Manejador del Login Normal
  const manejarLogin = async (e) => {
    e.preventDefault();

    const resultado = await login(cedula, contrasena);

    if (resultado.success) {
      if (resultado.data?.debeCambiarContrasena) {
        setRequiereCambioPassword(true);
        setIdUsuarioTemp(resultado.data.idUsuario); // Guardamos el ID que manda el backend
        Toast.fire({
          icon: "info",
          title: "Primer ingreso: Cambia tu contraseña",
        });
        return;
      }

      Toast.fire({
        icon: "success",
        title: "¡Bienvenido al sistema!",
      });
      navigate("/dashboard");
    } else {
      Toast.fire({
        icon: "error",
        title: resultado.mensaje,
      });
    }
  };

  // 2. Manejador del Cambio Obligatorio (Se ejecuta una sola vez)
  const manejarCambioObligatorio = async (e) => {
    e.preventDefault();

    if (nuevaContrasena !== confirmarContrasena) {
      Toast.fire({
        icon: "error",
        title: "Las contraseñas no coinciden",
      });
      return;
    }

    setProcesandoCambio(true);
    try {
      // Llamada única a tu apiService
      await cambiarContrasenaObligatoria(
        idUsuarioTemp,
        contrasena, // La contraseña temporal con la que ingresó
        nuevaContrasena,
      );

      Toast.fire({
        icon: "success",
        title: "¡Contraseña actualizada! Inicia sesión con tu nueva clave.",
      });

      // Limpiamos y regresamos al login normal
      setRequiereCambioPassword(false);
      setContrasena("");
      setNuevaContrasena("");
      setConfirmarContrasena("");
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error.message || "No se pudo actualizar la contraseña",
      });
    } finally {
      setProcesandoCambio(false);
    }
  };

  return (
    <div className="login-page">
      <div className="card login-card shadow position-relative">
        {/* TARJETA SUPERPUESTA (ENCIMA DEL LOGIN) SI REQUIERE CAMBIO */}
        {requiereCambioPassword && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 bg-white p-4 p-md-5 d-flex flex-column justify-content-center rounded"
            style={{ zIndex: 10 }}
          >
            <div className="text-center mb-3">
              <div className="alert alert-warning py-2 mb-2" role="alert">
                <small className="fw-bold">⚠️ Primer ingreso detectado</small>
              </div>
              <h4 className="mb-1">Actualiza tu contraseña</h4>
              <p className="text-muted small">
                Establece una nueva contraseña para continuar.
              </p>
            </div>

            <form onSubmit={manejarCambioObligatorio}>
              <div className="mb-3">
                <label className="form-label">Nueva contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Ingresa tu nueva contraseña"
                  value={nuevaContrasena}
                  onChange={(e) => setNuevaContrasena(e.target.value)}
                  required
                  disabled={procesandoCambio}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Confirmar contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Repite tu nueva contraseña"
                  value={confirmarContrasena}
                  onChange={(e) => setConfirmarContrasena(e.target.value)}
                  required
                  disabled={procesandoCambio}
                />
              </div>

              <button
                type="submit"
                className="btn btn-warning w-100 mb-2 fw-bold"
                disabled={procesandoCambio}
              >
                {procesandoCambio ? "Guardando..." : "Guardar contraseña"}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary w-100 btn-sm"
                onClick={() => {
                  setRequiereCambioPassword(false);
                  setNuevaContrasena("");
                  setConfirmarContrasena("");
                }}
                disabled={procesandoCambio}
              >
                Cancelar
              </button>
            </form>
          </div>
        )}

        {/* VISTA NORMAL DEL LOGIN DE FONDO */}
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <div className="logo-placeholder">LOGO</div>
            <h3 className="mt-3 mb-2">Iniciar sesión</h3>
            <p className="text-muted">Ingresa tus datos para continuar</p>
          </div>

          <form onSubmit={manejarLogin}>
            <div className="mb-3">
              <label htmlFor="cedula" className="form-label">
                Cédula
              </label>
              <input
                type="text"
                id="cedula"
                className="_form-control form-control"
                placeholder="Ingresa tu cédula"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                required
                disabled={cargando}
              />
            </div>

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
                disabled={cargando}
              />
            </div>

            <div className="text-end mb-4">
              <Link to="/recuperar-contrasena" className="text-decoration-none">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mb-3"
              disabled={cargando}
            >
              {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
