import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuthStore } from "../store/useAuthStore";
import { authService } from "../services/authService";
import logoHappyPay from "../assets/images/logo_happy.jpg";
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
  const loginHeading = useRef(null);
  const recoveryHeading = useRef(null);
  const previousPanel = useRef(panelActivo);

  useEffect(() => {
    if (previousPanel.current === panelActivo) return;

    previousPanel.current = panelActivo;
    const heading = panelActivo ? recoveryHeading : loginHeading;
    heading.current?.focus({ preventScroll: true });
  }, [panelActivo]);

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
      /^(?=.*[A-ZÁÉÍÓÚÑ])(?=.*[a-záéíóúñ])(?=.*[0-9])(?=.*[^\p{L}\p{N}\s]).{8,}$/u;

    if (!regexPassword.test(nuevaContrasena) || new TextEncoder().encode(nuevaContrasena).length > 72) {
      Toast.fire({
        icon: "error",
        title: "Usa al menos 8 caracteres, mayúscula, minúscula, número y símbolo; máximo 72 bytes",
      });
      return;
    }

    if (nuevaContrasena === contrasena) {
      Toast.fire({ icon: "error", title: "La nueva contraseña debe ser diferente a la actual" });
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
        <section className="auth-intro" aria-label="Portal del colaborador">
          <div className="auth-brand">
            <img src={logoHappyPay} alt="" />
            <span><strong>HappyPay</strong> · Portal del colaborador</span>
          </div>

          <p className="auth-headline">
            Todo tu día a día en HappyPay, en un solo lugar.
          </p>
          <p className="auth-description">
            Un espacio exclusivo para el equipo de HappyPay. Gestiona tus
            vacaciones, consulta tu perfil y mantente al día.
          </p>

          <ul className="auth-features">
            <li><i className="bi bi-calendar2-week" aria-hidden="true" />Vacaciones</li>
            <li><i className="bi bi-person" aria-hidden="true" />Mi perfil</li>
            <li><i className="bi bi-info-circle" aria-hidden="true" />Información</li>
          </ul>
        </section>

        <div className="auth-card-stack">
          {/* MODAL DE CAMBIO OBLIGATORIO DE CONTRASEÑA */}
          {requiereCambioPassword && (
            <div className="auth-card change-password-overlay">
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
                <label htmlFor="new-password">Nueva contraseña</label>
                <div className="password-input-wrapper">
                  <i className="bi bi-lock input-field-icon"></i>
                  <input
                    id="new-password"
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
                    aria-label={mostrarNuevaPassword ? "Ocultar nueva contraseña" : "Mostrar nueva contraseña"}
                    onClick={() => setMostrarNuevaPassword(!mostrarNuevaPassword)}
                    disabled={procesandoCambio}
                  >
                    <i
                      className={`bi ${mostrarNuevaPassword ? "bi-eye-slash" : "bi-eye"}`}
                    ></i>
                  </button>
                </div>

                <label htmlFor="confirm-password">Confirmar contraseña</label>
                <div className="password-input-wrapper">
                  <i className="bi bi-shield-lock input-field-icon"></i>
                  <input
                    id="confirm-password"
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
                    aria-label={mostrarConfirmarPassword ? "Ocultar confirmación" : "Mostrar confirmación"}
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

          <div className="auth-card login-container" inert={panelActivo || requiereCambioPassword}>
            <form onSubmit={manejarLogin}>
              <h1 ref={loginHeading} tabIndex={-1}>Iniciar sesión</h1>
              <p className="auth-subtext">
                Ingresa tus credenciales para acceder al portal.
              </p>

              <label htmlFor="login-cedula">Cédula</label>
              <div className="input-field-group">
                <i className="bi bi-card-heading input-field-icon" aria-hidden="true" />
                <input
                  id="login-cedula"
                  type="text"
                  autoComplete="username"
                  placeholder="Número de cédula"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  required
                  disabled={cargando}
                />
              </div>

              <label htmlFor="login-password">Contraseña</label>
              <div className="password-input-wrapper">
                <i className="bi bi-lock input-field-icon" aria-hidden="true" />
                <input
                  id="login-password"
                  type={mostrarPasswordLogin ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                  disabled={cargando}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  aria-label={mostrarPasswordLogin ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setMostrarPasswordLogin(!mostrarPasswordLogin)}
                  disabled={cargando}
                >
                  <i className={`bi ${mostrarPasswordLogin ? "bi-eye-slash" : "bi-eye"}`} aria-hidden="true" />
                </button>
              </div>

              <button type="button" className="switch-link forgot-link" onClick={() => setPanelActivo(true)}>
                ¿Olvidaste tu contraseña?
              </button>

              <button type="submit" className="btn-submit" disabled={cargando}>
                {cargando ? "Iniciando sesión..." : "INICIAR SESIÓN"}
              </button>
            </form>
          </div>

          <div className="auth-card recuperar-container" inert={!panelActivo || requiereCambioPassword}>
            <form onSubmit={manejarRecuperacion}>
              <h1 ref={recoveryHeading} tabIndex={-1}>Recuperar clave</h1>
              <p className="auth-subtext">
                Ingresa tu correo institucional y te enviaremos las instrucciones
                de restablecimiento.
              </p>

              <label htmlFor="recovery-email">Correo electrónico</label>
              <div className="input-field-group">
                <i className="bi bi-envelope input-field-icon" aria-hidden="true" />
                <input
                  id="recovery-email"
                  type="email"
                  autoComplete="email"
                  placeholder="nombre@ejemplo.com"
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

              <button type="button" className="switch-link back-link" onClick={() => setPanelActivo(false)}>
                ← Volver al inicio de sesión
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthContainer;
