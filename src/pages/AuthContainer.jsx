import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuthStore } from "../store/useAuthStore";
import { authService } from "../services/authService";
import logoHappyPay from "../assets/images/logo_happy.jpg"; // Ajusta la ruta a tu logo
import "./AuthContainer.css";

function AuthContainer() {
  const [panelActivo, setPanelActivo] = useState(false);

  const [cedula, setCedula] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [requiereCambioPassword, setRequiereCambioPassword] = useState(false);
  const [idUsuarioTemp, setIdUsuarioTemp] = useState(null);
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [procesandoCambio, setProcesandoCambio] = useState(false);

  const [mostrarPasswordLogin, setMostrarPasswordLogin] = useState(false);
  const [mostrarNuevaPassword, setMostrarNuevaPassword] = useState(false);
  const [mostrarConfirmarPassword, setMostrarConfirmarPassword] =
    useState(false);

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
  });

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
        title: "¡Bienvenido a HappyPay!",
      });
      navigate("/dashboard");
    } else {
      Toast.fire({
        icon: "error",
        title: resultado.mensaje,
      });
    }
  };

  const manejarCambioObligatorio = async (e) => {
    e.preventDefault();

    const regexPassword =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

    if (!regexPassword.test(nuevaContrasena)) {
      Toast.fire({
        icon: "error",
        title: "La contraseña no cumple con los requisitos de seguridad",
      });
      return;
    }

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
      <div className={`auth-container ${panelActivo ? "panel-active" : ""}`}>
        {/* MODAL DE CAMBIO OBLIGATORIO DE CONTRASEÑA */}
        {requiereCambioPassword && (
          <div className="change-password-overlay">
            <div className="text-center mb-3">
              <span className="badge bg-warning text-dark px-3 py-2 rounded-pill mb-2">
                ⚠️ Primer ingreso detectado
              </span>
              <h4 className="fw-bold mb-1">Actualiza tu contraseña</h4>
              <p className="text-muted small">
                Establece una contraseña segura para continuar.
              </p>
              <div
                className="text-start bg-light border rounded-3 p-3 mt-2"
                style={{ fontSize: "0.82rem" }}
              >
                <p className="mb-1 fw-bold text-dark">
                  La contraseña debe incluir:
                </p>
                <ul className="mb-0 ps-3 text-muted">
                  <li>Mínimo 8 caracteres</li>
                  <li>Al menos una letra mayúscula</li>
                  <li>Al menos un número</li>
                  <li>Al menos un carácter especial (@$!%*?&)</li>
                </ul>
              </div>
            </div>

            <form onSubmit={manejarCambioObligatorio}>
              <div className="password-input-wrapper">
                <i className="bi bi-lock input-field-icon"></i>
                <input
                  type={mostrarNuevaPassword ? "text" : "password"}
                  placeholder="Nueva contraseña"
                  value={nuevaContrasena}
                  onChange={(e) => setNuevaContrasena(e.target.value)}
                  required
                  disabled={procesandoCambio}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setMostrarNuevaPassword(!mostrarNuevaPassword)}
                  disabled={procesandoCambio}
                >
                  <i
                    className={`bi ${mostrarNuevaPassword ? "bi-eye-slash" : "bi-eye"}`}
                  ></i>
                </button>
              </div>

              <div className="password-input-wrapper">
                <i className="bi bi-shield-lock input-field-icon"></i>
                <input
                  type={mostrarConfirmarPassword ? "text" : "password"}
                  placeholder="Confirmar contraseña"
                  value={confirmarContrasena}
                  onChange={(e) => setConfirmarContrasena(e.target.value)}
                  required
                  disabled={procesandoCambio}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() =>
                    setMostrarConfirmarPassword(!mostrarConfirmarPassword)
                  }
                  disabled={procesandoCambio}
                >
                  <i
                    className={`bi ${mostrarConfirmarPassword ? "bi-eye-slash" : "bi-eye"}`}
                  ></i>
                </button>
              </div>

              <button
                type="submit"
                className="btn-submit"
                disabled={procesandoCambio}
              >
                {procesandoCambio ? "Guardando..." : "GUARDAR CONTRASEÑA"}
              </button>

              <a
                href="#"
                className="switch-link mt-3"
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

        {/* FORMULARIO DE LOGIN */}
        <div className="form-container login-container">
          <form onSubmit={manejarLogin}>
            <div className="auth-brand-header">
              <img
                src={logoHappyPay}
                alt="HappyPay"
                className="auth-brand-logo"
              />
              <span className="auth-brand-name">HappyPay</span>
            </div>

            <h1>Iniciar sesión</h1>
            <p className="auth-subtext">
              Ingresa tus credenciales para acceder a la intranet
            </p>

            <div className="input-field-group">
              <i className="bi bi-card-heading input-field-icon"></i>
              <input
                type="text"
                placeholder="Número de Cédula"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                required
                disabled={cargando}
              />
            </div>

            <div className="password-input-wrapper">
              <i className="bi bi-lock input-field-icon"></i>
              <input
                type={mostrarPasswordLogin ? "text" : "password"}
                placeholder="Contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                disabled={cargando}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setMostrarPasswordLogin(!mostrarPasswordLogin)}
                disabled={cargando}
              >
                <i
                  className={`bi ${mostrarPasswordLogin ? "bi-eye-slash" : "bi-eye"}`}
                ></i>
              </button>
            </div>

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

            <button type="submit" className="btn-submit" disabled={cargando}>
              {cargando ? "Iniciando sesión..." : "INICIAR SESIÓN"}
            </button>
          </form>
        </div>

        {/* FORMULARIO DE RECUPERACIÓN */}
        <div className="form-container recuperar-container">
          <form onSubmit={manejarRecuperacion}>
            <div className="auth-brand-header">
              <img
                src={logoHappyPay}
                alt="HappyPay"
                className="auth-brand-logo"
              />
              <span className="auth-brand-name">HappyPay</span>
            </div>

            <h1>Recuperar clave</h1>
            <p className="auth-subtext">
              Ingresa tu correo institucional y te enviaremos las instrucciones
              de restablecimiento.
            </p>

            <div className="input-field-group">
              <i className="bi bi-envelope input-field-icon"></i>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                disabled={cargandoRecuperacion}
              />
            </div>

            <button
              type="submit"
              className="btn-submit"
              disabled={cargandoRecuperacion}
            >
              {cargandoRecuperacion ? "Enviando..." : "ENVIAR INSTRUCCIONES"}
            </button>

            <a
              href="#"
              className="switch-link mt-3"
              onClick={(e) => {
                e.preventDefault();
                setPanelActivo(false);
              }}
            >
              ← Volver al inicio de sesión
            </a>
          </form>
        </div>

        {/* OVERLAY INSTITUCIONAL VERDE */}
        <div className="auth-overlay-container">
          <div className="auth-overlay">
            <div className="overlay-panel overlay-left">
              <h1>¿Recordaste tu clave?</h1>
              <p>
                Inicia sesión normalmente para acceder a tu panel y gestionar
                tus solicitudes.
              </p>
              <button
                type="button"
                className="ghost"
                onClick={() => setPanelActivo(false)}
              >
                INICIAR SESIÓN
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>¡Hola de nuevo!</h1>
              <p>
                Bienvenido a la plataforma centralizada de HappyPay. ¿Tienes
                problemas para ingresar?
              </p>
              <button
                type="button"
                className="ghost"
                onClick={() => setPanelActivo(true)}
              >
                RECUPERAR CLAVE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthContainer;
