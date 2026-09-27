import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import AppLayout from "../components/layout/AppLayout";
import {
  getAreas,
  getCargos,
  getBancos,
  getEtnias,
  getGeneros,
  getProvincias,
  getCiudades,
  getEstadosCiviles,
  getTiposSangre,
  crearArea,
  crearCargo,
  crearBanco,
  crearEtnia,
  crearGenero,
  crearCiudad,
  actualizarCiudad,
  desactivarCiudad,
  crearEstadoCivil,
  actualizarEstadoCivil,
  desactivarEstadoCivil,
  crearTipoSangre,
  actualizarTipoSangre,
  desactivarTipoSangre,
} from "../services/catalogosService";

const TABS = [
  { key: "areas", titulo: "Áreas" },
  { key: "cargos", titulo: "Cargos" },
  { key: "bancos", titulo: "Bancos" },
  { key: "ciudades", titulo: "Ciudades" },
  { key: "etnias", titulo: "Etnias" },
  { key: "estados-civiles", titulo: "Estados Civiles" },
  { key: "generos", titulo: "Géneros" },
  { key: "tipos-sangre", titulo: "Tipos de Sangre" },
];

function avisoError(err, fallback) {
  Swal.fire({
    icon: "error",
    title: "No se pudo completar la acción",
    text: err?.message || fallback,
  });
}

function avisoExito(texto) {
  Swal.fire({
    icon: "success",
    title: texto,
    timer: 1400,
    showConfirmButton: false,
  });
}

/* --- Catálogo simple: solo Nombre, solo Crear (Áreas, Bancos, Etnias, Géneros) --- */
function CatalogoSimple({ etiqueta, cargarLista, crear }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const data = await cargarLista();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      avisoError(err, `No se pudo cargar el catálogo de ${etiqueta}.`);
    } finally {
      setLoading(false);
    }
  }, [cargarLista, etiqueta]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    try {
      setGuardando(true);
      await crear(nombre.trim());
      setNombre("");
      avisoExito(`${etiqueta} agregado`);
      cargar();
    } catch (err) {
      avisoError(err, `No se pudo crear el registro en ${etiqueta}.`);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="row g-4">
      <div className="col-12 col-md-5">
        <form onSubmit={handleSubmit} className="card border-0 shadow-sm p-3">
          <label className="form-label fw-semibold">Nuevo(a) {etiqueta}</label>
          <input
            className="form-control mb-3"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder={`Nombre de ${etiqueta.toLowerCase()}`}
            required
          />
          <button
            type="submit"
            className="btn btn-brand"
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Agregar"}
          </button>
        </form>
      </div>
      <div className="col-12 col-md-7">
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Nombre</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td className="text-muted">Cargando...</td>
                  </tr>
                )}
                {!loading && items.length === 0 && (
                  <tr>
                    <td className="text-muted">Sin registros todavía.</td>
                  </tr>
                )}
                {!loading &&
                  items.map((it) => (
                    <tr key={it.idArea ?? it.idBanco ?? it.idEtnia ?? it.idGenero ?? it.nombre}>
                      <td>{it.nombre}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        <small className="text-muted d-block mt-2">
          Este catálogo solo admite agregar nuevos registros (el backend no
          expone editar ni desactivar para {etiqueta.toLowerCase()}).
        </small>
      </div>
    </div>
  );
}

/* --- Cargos: requiere seleccionar Área --- */
function CatalogoCargos() {
  const [cargos, setCargos] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState("");
  const [idArea, setIdArea] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const [listaCargos, listaAreas] = await Promise.all([
        getCargos(),
        getAreas(),
      ]);
      setCargos(Array.isArray(listaCargos) ? listaCargos : []);
      setAreas(Array.isArray(listaAreas) ? listaAreas : []);
    } catch (err) {
      avisoError(err, "No se pudo cargar el catálogo de cargos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const nombreArea = (id) =>
    areas.find((a) => a.idArea === id)?.nombre ?? "—";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !idArea) return;
    try {
      setGuardando(true);
      await crearCargo(nombre.trim(), Number(idArea));
      setNombre("");
      setIdArea("");
      avisoExito("Cargo agregado");
      cargar();
    } catch (err) {
      avisoError(
        err,
        "No se pudo crear el cargo. Si el error menciona el área, es " +
          "porque el backend todavía no acepta idArea en este endpoint.",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="row g-4">
      <div className="col-12 col-md-5">
        <form onSubmit={handleSubmit} className="card border-0 shadow-sm p-3">
          <label className="form-label fw-semibold">Nuevo Cargo</label>
          <input
            className="form-control mb-3"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del cargo"
            required
          />
          <label className="form-label fw-semibold">Área</label>
          <select
            className="form-select mb-3"
            value={idArea}
            onChange={(e) => setIdArea(e.target.value)}
            required
          >
            <option value="">Selecciona un área</option>
            {areas.map((a) => (
              <option key={a.idArea} value={a.idArea}>
                {a.nombre}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-brand" disabled={guardando}>
            {guardando ? "Guardando..." : "Agregar"}
          </button>
        </form>
      </div>
      <div className="col-12 col-md-7">
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Nombre</th>
                  <th>Área</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={2} className="text-muted">
                      Cargando...
                    </td>
                  </tr>
                )}
                {!loading && cargos.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-muted">
                      Sin registros todavía.
                    </td>
                  </tr>
                )}
                {!loading &&
                  cargos.map((c) => (
                    <tr key={c.idCargo}>
                      <td>{c.nombre}</td>
                      <td>{c.area?.nombre ?? nombreArea(c.idArea)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Catálogo con estado (Ciudades, Estados Civiles, Tipos de Sangre) --- */
function CatalogoConEstado({
  etiqueta,
  cargarLista,
  crear,
  actualizar,
  desactivar,
  conProvincia,
}) {
  const [items, setItems] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState("");
  const [idProvincia, setIdProvincia] = useState("");
  const [editando, setEditando] = useState(null); // item completo o null
  const [guardando, setGuardando] = useState(false);

  const idDe = (it) =>
    it.idCiudad ?? it.idEstadoCivil ?? it.idTipoSangre;

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const [data, prov] = await Promise.all([
        cargarLista(),
        conProvincia ? getProvincias() : Promise.resolve([]),
      ]);
      setItems(Array.isArray(data) ? data : []);
      setProvincias(Array.isArray(prov) ? prov : []);
    } catch (err) {
      avisoError(err, `No se pudo cargar el catálogo de ${etiqueta}.`);
    } finally {
      setLoading(false);
    }
  }, [cargarLista, etiqueta, conProvincia]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const limpiarForm = () => {
    setNombre("");
    setIdProvincia("");
    setEditando(null);
  };

  const empezarEdicion = (item) => {
    setEditando(item);
    setNombre(item.nombre);
    setIdProvincia(item.idProvincia ? String(item.idProvincia) : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || (conProvincia && !idProvincia)) return;
    try {
      setGuardando(true);
      if (editando) {
        if (conProvincia) {
          await actualizar(
            idDe(editando),
            nombre.trim(),
            Number(idProvincia),
            editando.estado ?? true,
          );
        } else {
          await actualizar(idDe(editando), nombre.trim(), editando.estado ?? true);
        }
        avisoExito(`${etiqueta} actualizado`);
      } else if (conProvincia) {
        await crear(nombre.trim(), Number(idProvincia));
        avisoExito(`${etiqueta} agregado`);
      } else {
        await crear(nombre.trim());
        avisoExito(`${etiqueta} agregado`);
      }
      limpiarForm();
      cargar();
    } catch (err) {
      avisoError(err, `No se pudo guardar el registro en ${etiqueta}.`);
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleEstado = async (item) => {
    const activar = !item.estado;
    const confirmacion = await Swal.fire({
      icon: "warning",
      title: activar ? `¿Activar este registro?` : `¿Desactivar este registro?`,
      text: item.nombre,
      showCancelButton: true,
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "Cancelar",
    });
    if (!confirmacion.isConfirmed) return;

    try {
      if (activar) {
        // No hay endpoint de "reactivar": se reutiliza actualizar con estado=true
        if (conProvincia) {
          await actualizar(idDe(item), item.nombre, item.idProvincia, true);
        } else {
          await actualizar(idDe(item), item.nombre, true);
        }
      } else {
        await desactivar(idDe(item));
      }
      avisoExito(activar ? "Registro activado" : "Registro desactivado");
      cargar();
    } catch (err) {
      avisoError(err, "No se pudo cambiar el estado del registro.");
    }
  };

  return (
    <div className="row g-4">
      <div className="col-12 col-md-5">
        <form onSubmit={handleSubmit} className="card border-0 shadow-sm p-3">
          <label className="form-label fw-semibold">
            {editando ? `Editar ${etiqueta}` : `Nuevo(a) ${etiqueta}`}
          </label>
          <input
            className="form-control mb-3"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder={`Nombre`}
            required
          />
          {conProvincia && (
            <>
              <label className="form-label fw-semibold">Provincia</label>
              <select
                className="form-select mb-3"
                value={idProvincia}
                onChange={(e) => setIdProvincia(e.target.value)}
                required
              >
                <option value="">Selecciona una provincia</option>
                {provincias.map((p) => (
                  <option key={p.idProvincia} value={p.idProvincia}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </>
          )}
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-brand" disabled={guardando}>
              {guardando
                ? "Guardando..."
                : editando
                  ? "Guardar cambios"
                  : "Agregar"}
            </button>
            {editando && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={limpiarForm}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
      <div className="col-12 col-md-7">
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Nombre</th>
                  {conProvincia && <th>Provincia</th>}
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={4} className="text-muted">
                      Cargando...
                    </td>
                  </tr>
                )}
                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-muted">
                      Sin registros todavía.
                    </td>
                  </tr>
                )}
                {!loading &&
                  items.map((it) => (
                    <tr key={idDe(it)}>
                      <td>{it.nombre}</td>
                      {conProvincia && (
                        <td>{it.provincia?.nombre ?? "—"}</td>
                      )}
                      <td>
                        <span
                          className={`badge ${it.estado ? "bg-success" : "bg-secondary"}`}
                        >
                          {it.estado ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => empezarEdicion(it)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${it.estado ? "btn-outline-danger" : "btn-outline-success"}`}
                          onClick={() => handleToggleEstado(it)}
                        >
                          {it.estado ? "Desactivar" : "Activar"}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function GestionCatalogos() {
  const [tab, setTab] = useState("areas");

  return (
    <AppLayout>
      <div className="d-flex flex-column gap-3">
        <div>
          <h4 className="fw-bold mb-0">Gestión de Catálogos</h4>
          <p className="text-muted mb-0">
            Administra los catálogos base del sistema (solo rol Administrador).
          </p>
        </div>

        <ul className="nav nav-pills flex-wrap gap-2">
          {TABS.map((t) => (
            <li className="nav-item" key={t.key}>
              <button
                type="button"
                className={`nav-link ${tab === t.key ? "active bg-brand" : "text-dark bg-white border"}`}
                onClick={() => setTab(t.key)}
              >
                {t.titulo}
              </button>
            </li>
          ))}
        </ul>

        <div>
          {tab === "areas" && (
            <CatalogoSimple
              etiqueta="Área"
              cargarLista={getAreas}
              crear={crearArea}
            />
          )}
          {tab === "cargos" && <CatalogoCargos />}
          {tab === "bancos" && (
            <CatalogoSimple
              etiqueta="Banco"
              cargarLista={getBancos}
              crear={crearBanco}
            />
          )}
          {tab === "ciudades" && (
            <CatalogoConEstado
              etiqueta="Ciudad"
              cargarLista={getCiudades}
              crear={crearCiudad}
              actualizar={actualizarCiudad}
              desactivar={desactivarCiudad}
              conProvincia
            />
          )}
          {tab === "etnias" && (
            <CatalogoSimple
              etiqueta="Etnia"
              cargarLista={getEtnias}
              crear={crearEtnia}
            />
          )}
          {tab === "estados-civiles" && (
            <CatalogoConEstado
              etiqueta="Estado Civil"
              cargarLista={getEstadosCiviles}
              crear={crearEstadoCivil}
              actualizar={actualizarEstadoCivil}
              desactivar={desactivarEstadoCivil}
            />
          )}
          {tab === "generos" && (
            <CatalogoSimple
              etiqueta="Género"
              cargarLista={getGeneros}
              crear={crearGenero}
            />
          )}
          {tab === "tipos-sangre" && (
            <CatalogoConEstado
              etiqueta="Tipo de Sangre"
              cargarLista={getTiposSangre}
              crear={crearTipoSangre}
              actualizar={actualizarTipoSangre}
              desactivar={desactivarTipoSangre}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default GestionCatalogos;
