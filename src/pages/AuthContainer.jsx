import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuthStore } from "../store/useAuthStore";
import { authService } from "../services/authService";
import "./AuthContainer.css";


const IMAGEN_OVERLAY =
  "";

function AuthContainer() {
 
  const [panelActivo, setPanelActivo] = useState(false); 

  const [cedula, setCedula] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [requiereCambioPassword, setRequiereCambioPassword] = useState(false);
  const [idUsuarioTemp, setIdUsuarioTemp] = useState(null);
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [procesandoCambio, setProcesandoCambio] = useState(false);

  // ---------- Estados de Recuperar Contraseña ----------
  const [correo, setCorreo] = useState("");
  const [cargandoRecuperacion, setCargandoRecuperacion] = useState(false);

  const login = useAuthStore((state) => state.login);
  const cargando = useAuthStore((state) => state.cargando);

  const navigate = useNavigate();

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });

  // 1. Login normal
  const manejarLogin = async (e) => {
    e.preventDefault();

    const resultado = await login(cedula, contrasena);

    if (resultado.success) {
      if (resultado.data?.debeCambiarContrasena) {
        setRequiereCambioPassword(true);
        setIdUsuarioTemp(resultado.data.idUsuario);
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

  // 2. Cambio obligatorio de contraseña (primer ingreso)
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
      await authService.cambiarContrasena(
        idUsuarioTemp,
        contrasena,
        nuevaContrasena,
      );

      Toast.fire({
        icon: "success",
        title: "¡Contraseña actualizada! Inicia sesión con tu nueva clave.",
      });

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

  // 3. Recuperar contraseña
  const manejarRecuperacion = async (e) => {
    e.preventDefault();
    setCargandoRecuperacion(true);

    try {
      await authService.solicitarRecuperacion(correo);

      Toast.fire({
        icon: "success",
        title: "Instrucciones enviadas al correo registrado",
      });

      setCorreo("");
      // Regresa automáticamente al panel de login luego de enviar
      setTimeout(() => setPanelActivo(false), 1800);
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error.message || "No se pudo procesar la solicitud",
      });
    } finally {
      setCargandoRecuperacion(false);
    }
  };

  return (
    <div className="auth-page">
      <div
        className={`auth-container ${panelActivo ? "panel-active" : ""}`}
      >
        {/* OVERLAY DE CAMBIO OBLIGATORIO (primer ingreso) */}
        {requiereCambioPassword && (
          <div className="change-password-overlay">
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
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                required
                disabled={procesandoCambio}
              />
              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                required
                disabled={procesandoCambio}
              />

              <button type="submit" disabled={procesandoCambio}>
                {procesandoCambio ? "Guardando..." : "Guardar contraseña"}
              </button>

              <a
                href="#"
                className="switch-link"
                onClick={(e) => {
                  e.preventDefault();
                  setRequiereCambioPassword(false);
                  setNuevaContrasena("");
                  setConfirmarContrasena("");
                }}
              >
                Cancelar
              </a>
            </form>
          </div>
        )}

        {/* PANEL: LOGIN */}
        <div className="form-container login-container">
          <form onSubmit={manejarLogin}>
            <h1>Iniciar sesión</h1>

            <input
              type="text"
              placeholder="Cédula"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              required
              disabled={cargando}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              disabled={cargando}
            />

            <a
              href="#"
              className="switch-link"
              onClick={(e) => {
                e.preventDefault();
                setPanelActivo(true);
              }}
            >
              ¿Olvidaste tu contraseña?
            </a>

            <button type="submit" disabled={cargando}>
              {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>
        </div>

        {/* PANEL: RECUPERAR CONTRASEÑA */}
        <div className="form-container recuperar-container">
          <form onSubmit={manejarRecuperacion}>
            <h1>Recuperar contraseña</h1>
            <p className="auth-subtext">
              Ingresa tu correo y te enviaremos las instrucciones.
            </p>

            <input
              type="email"
              placeholder="Correo electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              disabled={cargandoRecuperacion}
            />

            <a
              href="#"
              className="switch-link"
              onClick={(e) => {
                e.preventDefault();
                setPanelActivo(false);
              }}
            >
              Volver al inicio de sesión
            </a>

            <button type="submit" disabled={cargandoRecuperacion}>
              {cargandoRecuperacion ? "Enviando..." : "Enviar instrucciones"}
            </button>
          </form>
        </div>

        {/* OVERLAY CON IMAGEN */}
        <div
          className="auth-overlay-container"
          style={{ "--overlay-img": `url(${IMAGEN_OVERLAY})` }}
        >
          <div className="auth-overlay">
            <div className="overlay-panel overlay-left">
              <h1>¿Ya la recordaste?</h1>
              <p>Inicia sesión con tu contraseña actual</p>
              <button
                type="button"
                className="ghost"
                onClick={() => setPanelActivo(false)}
              >
                Iniciar sesión
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>¿Olvidaste tu contraseña?</h1>
              <p>Te ayudamos a recuperarla en segundos</p>
              <button
                type="button"
                className="ghost"
                onClick={() => setPanelActivo(true)}
              >
                Recuperar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthContainer;
