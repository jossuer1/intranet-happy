import { useState } from "react";
import { Link } from "react-router-dom";

function RecuperarContrasena() {
  const [correo, setCorreo] = useState("");

  const manejarRecuperacion = (e) => {
    e.preventDefault();

    console.log("Correo para recuperación:", correo);
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
              />
            </div>

            <button type="submit" className="btn btn-primary w-100 mb-3">
              Enviar instrucciones
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
