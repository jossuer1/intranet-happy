import { useCallback, useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import ModalBase from "./ModalBase";
import {
  estilosTabla,
  opcionesPaginacion,
  filasPorPagina,
  normalizar,
} from "./tablaEstilos";

const avisoExito = (titulo) =>
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: titulo,
    showConfirmButton: false,
    timer: 1800,
    timerProgressBar: true,
  });

const avisoError = (err, titulo = "No se pudo completar la acción") =>
  Swal.fire({
    icon: "error",
    title: titulo,
    text: err?.message || "Inténtalo de nuevo en unos segundos.",
  });

/**
 * Pantalla completa de un catálogo: tabla (DataTable) con buscador y filtros,
 * y un modal para crear / editar. Todo se describe con un objeto `config`
 * (ver catalogosConfig.js), así los 9 catálogos comparten el mismo código.
 *
 * config = {
 *   key, titulo, descripcion, nuevoTexto, editarTexto, vacioTexto,
 *   listar(): Promise<fila[]>            lista (incluye inactivos)
 *   dependencias: { nombre: () => Promise<[]> }   datos extra (áreas, provincias…)
 *   columnas(deps): columnas extra de DataTable (entre el nombre y el estado)
 *   filtros: [{ key, placeholder, opciones(deps, filtros), predicado(fila, valor), resetea? }]
 *   textoBusqueda(fila, deps): string[]  textos donde busca el buscador
 *   campos(deps, valores): campos del formulario
 *   valoresIniciales(fila|null, deps)
 *   guardar(valores, fila|null)          crea (fila=null) o edita
 *   alternar(fila)                       activa / desactiva
 * }
 */
function CatalogoCrud({ config }) {
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("todos"); // todos | activos | inactivos
  const [filtros, setFiltros] = useState({});
  const [resetPagina, setResetPagina] = useState(false);

  const [modal, setModal] = useState(null); // null = cerrado | { fila }
  const [valores, setValores] = useState({});
  const [guardando, setGuardando] = useState(false);

  // --- Datos ---------------------------------------------------------------
  const principal = useQuery({
    queryKey: ["admin-catalogo", config.key],
    queryFn: () => config.listar(),
  });

  const entradasDeps = Object.entries(config.dependencias ?? {});
  const dependencias = useQueries({
    queries: entradasDeps.map(([nombre, cargar]) => ({
      queryKey: ["admin-catalogo-dep", nombre],
      queryFn: () => cargar(),
    })),
    combine: (resultados) => ({
      datos: Object.fromEntries(
        entradasDeps.map(([nombre], i) => [
          nombre,
          Array.isArray(resultados[i].data) ? resultados[i].data : [],
        ]),
      ),
      cargando: resultados.some((r) => r.isLoading),
    }),
  });
  const deps = dependencias.datos;

  const datos = useMemo(
    () => (Array.isArray(principal.data) ? principal.data : []),
    [principal.data],
  );

  // --- Filtros -------------------------------------------------------------
  const filtrosConfig = useMemo(() => config.filtros ?? [], [config]);

  const hayFiltros =
    estado !== "todos" ||
    busqueda.trim() !== "" ||
    Object.values(filtros).some(Boolean);

  const limpiarFiltros = () => {
    setEstado("todos");
    setBusqueda("");
    setFiltros({});
    setResetPagina((v) => !v);
  };

  const cambiarBusqueda = (valor) => {
    setBusqueda(valor);
    setResetPagina((v) => !v);
  };

  const cambiarEstado = (valor) => {
    setEstado(valor);
    setResetPagina((v) => !v);
  };

  const cambiarFiltro = (filtro, valor) => {
    setFiltros((previos) => {
      const siguientes = { ...previos, [filtro.key]: valor };
      // Filtros en cascada: al cambiar la región se limpia la provincia, etc.
      (filtro.resetea ?? []).forEach((k) => {
        siguientes[k] = "";
      });
      return siguientes;
    });
    setResetPagina((v) => !v);
  };

  const filas = useMemo(() => {
    const texto = normalizar(busqueda);
    return datos.filter((fila) => {
      if (estado === "activos" && !fila.estado) return false;
      if (estado === "inactivos" && fila.estado) return false;

      for (const f of filtrosConfig) {
        const valor = filtros[f.key];
        if (valor && !f.predicado(fila, valor)) return false;
      }

      if (!texto) return true;
      return config
        .textoBusqueda(fila, deps)
        .some((t) => normalizar(t).includes(texto));
    });
  }, [datos, estado, filtros, busqueda, filtrosConfig, config, deps]);

  // --- Modal crear / editar ------------------------------------------------
  const abrirNuevo = useCallback(() => {
    setValores(config.valoresIniciales(null, deps));
    setModal({ fila: null });
  }, [config, deps]);

  const abrirEditar = useCallback(
    (fila) => {
      setValores(config.valoresIniciales(fila, deps));
      setModal({ fila });
    },
    [config, deps],
  );

  const cerrarModal = useCallback(() => setModal(null), []);

  const campos = modal ? config.campos(deps, valores) : [];

  const cambiarCampo = (campo, valor) => {
    setValores((previos) => {
      const siguientes = { ...previos, [campo.name]: valor };
      (campo.resetea ?? []).forEach((k) => {
        siguientes[k] = "";
      });
      return siguientes;
    });
  };

  const enviar = async (e) => {
    e.preventDefault();

    const faltan = campos.filter(
      (c) => c.requerido !== false && !String(valores[c.name] ?? "").trim(),
    );
    if (faltan.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Completa los campos obligatorios",
        text: faltan.map((c) => c.label).join(", "),
      });
      return;
    }

    try {
      setGuardando(true);
      await config.guardar(valores, modal.fila);
      const eraEdicion = Boolean(modal.fila);
      setModal(null);
      avisoExito(eraEdicion ? "Cambios guardados" : "Registro creado");
    } catch (err) {
      avisoError(err, "No se pudo guardar");
    } finally {
      setGuardando(false);
    }
  };

  // --- Activar / desactivar (baja lógica, nunca se borra) -------------------
  const alternarEstado = useCallback(
    async (fila) => {
      const activar = !fila.estado;
      const confirmacion = await Swal.fire({
        icon: "warning",
        title: activar ? "¿Activar este registro?" : "¿Desactivar este registro?",
        html: activar
          ? `<b>${fila.nombre}</b> volverá a aparecer en los formularios.`
          : `<b>${fila.nombre}</b> dejará de aparecer en los formularios. Los datos ya guardados no se pierden.`,
        showCancelButton: true,
        confirmButtonText: "Sí, continuar",
        cancelButtonText: "Cancelar",
      });
      if (!confirmacion.isConfirmed) return;

      try {
        await config.alternar(fila);
        avisoExito(activar ? "Registro activado" : "Registro desactivado");
      } catch (err) {
        avisoError(err, "No se pudo cambiar el estado");
      }
    },
    [config],
  );

  // --- Columnas ------------------------------------------------------------
  const columnas = useMemo(
    () => [
      ...config.columnas(deps),
      {
        name: "Estado",
        selector: (fila) => (fila.estado ? "Activo" : "Inactivo"),
        sortable: true,
        width: "120px",
        cell: (fila) => (
          <span className={`badge ${fila.estado ? "bg-success" : "bg-secondary"}`}>
            {fila.estado ? "Activo" : "Inactivo"}
          </span>
        ),
      },
      {
        name: "Acciones",
        width: "130px",
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
        cell: (fila) => (
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center justify-content-center"
              title="Editar"
              onClick={(e) => {
                e.stopPropagation();
                abrirEditar(fila);
              }}
            >
              <i className="bi bi-pencil-square"></i>
            </button>
            <button
              type="button"
              className={`btn btn-sm d-inline-flex align-items-center justify-content-center ${
                fila.estado ? "btn-outline-danger" : "btn-outline-success"
              }`}
              title={fila.estado ? "Desactivar" : "Activar"}
              onClick={(e) => {
                e.stopPropagation();
                alternarEstado(fila);
              }}
            >
              <i
                className={`bi ${fila.estado ? "bi-slash-circle" : "bi-check-circle"}`}
              ></i>
            </button>
          </div>
        ),
      },
    ],
    [config, deps, abrirEditar, alternarEstado],
  );

  // --- Render --------------------------------------------------------------
  return (
    <div className="card shadow-sm border-0 rounded-3">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
          <div>
            <h5 className="card-title fw-bold m-0">{config.titulo}</h5>
            <small className="text-muted">{config.descripcion}</small>
          </div>
          <button
            type="button"
            className="btn btn-sm text-white bg-brand border-0 d-flex align-items-center gap-2 px-3 py-2 rounded-3"
            onClick={abrirNuevo}
            disabled={principal.isLoading || dependencias.cargando}
          >
            <i className="bi bi-plus-lg"></i>
            <span>{config.nuevoTexto}</span>
          </button>
        </div>

        {principal.isLoading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : principal.isError ? (
          <div className="alert alert-danger d-flex justify-content-between align-items-center">
            <span>
              {principal.error?.message || "No se pudo cargar el catálogo."}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => principal.refetch()}
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            {/* FILTROS + BUSCADOR */}
            <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mb-3">
              <small className="text-muted me-auto">
                {filas.length === datos.length
                  ? `${datos.length} registros`
                  : `${filas.length} de ${datos.length} registros`}
              </small>

              {filtrosConfig.map((f) => (
                <select
                  key={f.key}
                  className="form-select form-select-sm"
                  style={{ maxWidth: "210px" }}
                  value={filtros[f.key] ?? ""}
                  onChange={(e) => cambiarFiltro(f, e.target.value)}
                  aria-label={f.placeholder}
                >
                  <option value="">{f.placeholder}</option>
                  {f.opciones(deps, filtros).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ))}

              <select
                className="form-select form-select-sm"
                style={{ maxWidth: "170px" }}
                value={estado}
                onChange={(e) => cambiarEstado(e.target.value)}
                aria-label="Filtrar por estado"
              >
                <option value="todos">Todos los estados</option>
                <option value="activos">Activos</option>
                <option value="inactivos">Inactivos</option>
              </select>

              <div
                className="input-group input-group-sm"
                style={{ maxWidth: "280px" }}
              >
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Buscar..."
                  value={busqueda}
                  onChange={(e) => cambiarBusqueda(e.target.value)}
                />
              </div>

              {hayFiltros && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={limpiarFiltros}
                >
                  Limpiar
                </button>
              )}
            </div>

            <DataTable
              columns={columnas}
              data={filas}
              customStyles={estilosTabla}
              pagination
              paginationPerPage={15}
              paginationRowsPerPageOptions={filasPorPagina}
              paginationComponentOptions={opcionesPaginacion}
              paginationResetDefaultPage={resetPagina}
              highlightOnHover
              pointerOnHover
              responsive
              onRowClicked={abrirEditar}
              noDataComponent={
                <div className="p-4 text-muted">
                  {hayFiltros
                    ? "Ningún registro coincide con los filtros."
                    : config.vacioTexto}
                </div>
              }
            />
          </>
        )}
      </div>

      {modal && (
        <ModalBase
          titulo={modal.fila ? config.editarTexto : config.nuevoTexto}
          subtitulo={modal.fila ? modal.fila.nombre : undefined}
          onClose={cerrarModal}
        >
          <form onSubmit={enviar}>
            <div className="modal-body">
              {campos.map((campo, i) => (
                <div className="mb-3" key={campo.name}>
                  <label
                    className="form-label fw-semibold"
                    htmlFor={`campo-${campo.name}`}
                  >
                    {campo.label}
                  </label>
                  {campo.type === "select" ? (
                    <select
                      id={`campo-${campo.name}`}
                      className="form-select"
                      value={valores[campo.name] ?? ""}
                      onChange={(e) => cambiarCampo(campo, e.target.value)}
                      disabled={campo.deshabilitado}
                      autoFocus={i === 0}
                      required
                    >
                      <option value="">{campo.placeholder}</option>
                      {campo.opciones.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`campo-${campo.name}`}
                      className="form-control"
                      value={valores[campo.name] ?? ""}
                      onChange={(e) => cambiarCampo(campo, e.target.value)}
                      placeholder={campo.placeholder}
                      maxLength={campo.maxLength}
                      autoFocus={i === 0}
                      required
                    />
                  )}
                  {campo.ayuda && (
                    <small className="text-muted">{campo.ayuda}</small>
                  )}
                </div>
              ))}
            </div>
            <div className="modal-footer border-0 pt-0">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={cerrarModal}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn text-white bg-brand border-0"
                disabled={guardando}
              >
                {guardando
                  ? "Guardando..."
                  : modal.fila
                    ? "Guardar cambios"
                    : "Crear"}
              </button>
            </div>
          </form>
        </ModalBase>
      )}
    </div>
  );
}

export default CatalogoCrud;
