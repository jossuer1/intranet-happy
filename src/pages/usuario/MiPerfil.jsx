import { useEffect, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import SectionHeader from "../../components/layout/SectionHeader";
import {
  calcularEdad,
  obtenerGeneracion,
  formatearFecha,
} from "../../utils/dateUtils";
import { useAuthStore } from "../../store/useAuthStore";

function Campo({ label, valor }) {
  return (
    <div className="col-12 col-md-6 col-lg-4 mb-3">
      <p className="text-uppercase text-muted fw-bold small mb-1">{label}</p>
      <p className="mb-0 text-dark fw-medium">{valor || "N/A"}</p>
    </div>
  );
}

function MiPerfil() {
  const user = useAuthStore((state) => state.user);
  const fetchPerfil = useAuthStore((state) => state.fetchPerfil);

  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        await fetchPerfil();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
      cargarDatos();
    }
  }, [user, fetchPerfil]);

  if (loading) {
    return (
      <AppLayout>
        <SectionHeader titulo="Mi Perfil" volverA="/dashboard" />
        <div className="container my-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !user) {
    return (
      <AppLayout>
        <SectionHeader titulo="Mi Perfil" volverA="/dashboard" />
        <div className="container my-5">
          <div className="alert alert-danger" role="alert">
            {error || "No se encontró la información del usuario."}
          </div>
        </div>
      </AppLayout>
    );
  }

  const iniciales = (user.nombres || "??")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  // Cálculo de edad y generación basado en fechaNacimiento
  const edadCalculada = user.fechaNacimiento
    ? `${calcularEdad(user.fechaNacimiento)} años`
    : null;
  const generacionCalculada = user.fechaNacimiento
    ? obtenerGeneracion(user.fechaNacimiento)
    : null;

  return (
    <AppLayout>
      <SectionHeader titulo="Mi Perfil" volverA="/dashboard" />

      <div className="container my-4 flex-grow-1">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                {/* ENCABEZADO DE PERFIL */}
                <div className="d-flex align-items-center gap-3 mb-4">
                  {user.fotoPreview || user.fotoUrl ? (
                    <img
                      src={user.fotoPreview || user.fotoUrl}
                      alt="Foto de perfil"
                      className="rounded-circle object-fit-cover border border-2 border-primary shadow-sm"
                      style={{ width: "64px", height: "64px" }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-brand-soft text-brand d-flex align-items-center justify-content-center fw-bold"
                      style={{
                        width: "64px",
                        height: "64px",
                        fontSize: "1.35rem",
                      }}
                    >
                      {iniciales}
                    </div>
                  )}
                  <div>
                    <h5 className="fw-bold mb-0">{user.nombres}</h5>
                    <p className="text-muted mb-0 small">
                      {user.cargo || user.nombreCargo}{" "}
                      {user.departamento ? `· ${user.departamento}` : ""}
                    </p>
                  </div>
                </div>

                <hr className="my-4 text-muted opacity-25" />

                {/* 1. INFORMACIÓN PERSONAL */}
                <h6 className="fw-bold text-primary mb-3">
                  1. Información Personal
                </h6>
                <div className="row">
                  <Campo label="Nombres completos" valor={user.nombres} />
                  <Campo label="Cédula" valor={user.cedula} />
                  <Campo
                    label="Fecha de nacimiento"
                    valor={formatearFecha(user.fechaNacimiento)}
                  />

                  {/* Campos dinámicos agregados */}
                  <Campo label="Edad" valor={edadCalculada} />
                  <Campo label="Generación" valor={generacionCalculada} />

                  <Campo label="Correo personal" valor={user.correoPersonal} />
                  <Campo label="Género" valor={user.genero || user.idGenero} />
                  <Campo
                    label="Estado civil"
                    valor={user.estadoCivil || user.idEstadoCivil}
                  />
                  <Campo label="Etnia" valor={user.etnia || user.idEtnia} />
                </div>

                <hr className="my-4 text-muted opacity-25" />

                {/* 2. DATOS LABORALES Y UBICACIÓN */}
                <h6 className="fw-bold text-primary mb-3">
                  2. Datos Laborales y Ubicación
                </h6>
                <div className="row">
                  <Campo label="Correo empresa" valor={user.correoEmpresa} />
                  <Campo label="Cargo" valor={user.cargo || user.nombreCargo} />
                  <Campo label="Departamento" valor={user.departamento} />
                  <Campo
                    label="Fecha de ingreso"
                    valor={formatearFecha(user.fechaIngreso)}
                  />
                  <Campo
                    label="Dirección de domicilio"
                    valor={user.direccion}
                  />
                  <Campo label="Ciudad" valor={user.ciudad || user.idCiudad} />
                  <Campo
                    label="Celular personal"
                    valor={user.celularPersonal}
                  />
                  <Campo label="Celular empresa" valor={user.celularEmpresa} />
                </div>

                <hr className="my-4 text-muted opacity-25" />

                {/* 3. INFORMACIÓN FAMILIAR Y CONTACTOS */}
                <h6 className="fw-bold text-primary mb-3">
                  3. Información Familiar y Contactos
                </h6>

                <div className="mb-3">
                  <p className="text-uppercase text-muted fw-bold small mb-2">
                    Hijos Registrados
                  </p>
                  {user.familiares && user.familiares.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-sm table-borderless bg-light rounded align-middle">
                        <thead>
                          <tr className="text-muted small border-bottom">
                            <th>Nombre del hijo/a</th>
                            <th>Fecha de nacimiento</th>
                          </tr>
                        </thead>
                        <tbody>
                          {user.familiares.map((fam, idx) => (
                            <tr key={fam.idFamiliar || idx}>
                              <td className="fw-medium">
                                {fam.nombre} {fam.apellido || ""}
                              </td>
                              <td>{formatearFecha(fam.fechaNacimiento)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="small text-muted mb-0">No registra hijos.</p>
                  )}
                </div>

                <div className="mb-2">
                  <p className="text-uppercase text-muted fw-bold small mb-2">
                    Contactos de Emergencia
                  </p>
                  {user.contactosEmergencia &&
                  user.contactosEmergencia.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-sm table-borderless bg-light rounded align-middle">
                        <thead>
                          <tr className="text-muted small border-bottom">
                            <th>Nombre</th>
                            <th>Parentesco / Relación</th>
                            <th>Teléfono</th>
                          </tr>
                        </thead>
                        <tbody>
                          {user.contactosEmergencia.map((c, idx) => (
                            <tr key={c.idContacto || idx}>
                              <td className="fw-medium">{c.nombre}</td>
                              <td>{c.parentesco}</td>
                              <td>{c.telefono}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="small text-muted mb-0">
                      No registra contactos de emergencia.
                    </p>
                  )}
                </div>

                <hr className="my-4 text-muted opacity-25" />

                {/* 4. DATOS BANCARIOS Y DÉCIMOS */}
                <h6 className="fw-bold text-primary mb-3">
                  4. Datos Bancarios y Décimos
                </h6>
                <div className="row mb-3">
                  <Campo
                    label="¿Acumula décimos?"
                    valor={
                      String(user.acumulaDecimos) === "1" ||
                      user.acumulaDecimos === 1
                        ? "Sí"
                        : "No"
                    }
                  />
                </div>

                <p className="text-uppercase text-muted fw-bold small mb-2">
                  Cuentas Bancarias
                </p>
                {user.datosBancarios && user.datosBancarios.length > 0 ? (
                  <div className="table-responsive mb-2">
                    <table className="table table-sm table-borderless bg-light rounded align-middle">
                      <thead>
                        <tr className="text-muted small border-bottom">
                          <th>Banco</th>
                          <th>N° de Cuenta</th>
                          <th>Tipo de Cuenta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {user.datosBancarios.map((b, idx) => (
                          <tr key={b.idDatoBancario || idx}>
                            <td className="fw-medium">
                              {b.banco || b.idBanco}
                            </td>
                            <td>{b.numeroCuenta}</td>
                            <td>
                              <span className="badge bg-secondary">
                                {b.tipoCuenta}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="small text-muted mb-0">
                    No registra cuentas bancarias.
                  </p>
                )}

                <hr className="my-4 text-muted opacity-25" />

                {/* 5. FORMACIÓN ACADÉMICA */}
                <h6 className="fw-bold text-primary mb-3">
                  5. Formación Académica
                </h6>
                {user.titulos && user.titulos.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm table-borderless bg-light rounded align-middle">
                      <thead>
                        <tr className="text-muted small border-bottom">
                          <th>Título Obtenido</th>
                          <th>Institución Educativa Superior</th>
                        </tr>
                      </thead>
                      <tbody>
                        {user.titulos.map((t, idx) => (
                          <tr key={t.idTitulo || idx}>
                            <td className="fw-medium">{t.nombreTitulo}</td>
                            <td>{t.institucion || "N/A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="small text-muted mb-0">
                    No registra títulos académicos.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default MiPerfil;
