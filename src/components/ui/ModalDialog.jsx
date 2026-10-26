import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { Modal } from "bootstrap";

// Bootstrap gestiona el backdrop y el bloqueo del scroll; React controla el contenido.
export default function ModalDialog({ titulo, subtitulo, onClose, children, size = "lg", footer, bodyClassName = "", ocupado = false }) {
  const id = useId();
  const elemento = useRef(null);
  const estado = useRef({ onClose, ocupado });
  useEffect(() => { estado.current = { onClose, ocupado }; }, [onClose, ocupado]);
  useEffect(() => {
    const nodo = elemento.current;
    const anterior = document.activeElement;
    const modal = new Modal(nodo, { backdrop: "static", keyboard: false, focus: false });
    modal.show();
    const enfocables = () => [...nodo.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter(el => el.getClientRects().length);
    const enfocar = () => (enfocables()[0] || nodo).focus();
    enfocar();
    const teclado = e => {
      // SweetAlert puede abrir una confirmación sobre el formulario.
      if (document.querySelector(".swal2-container")) return;
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); if (!estado.current.ocupado) estado.current.onClose(); }
      if (e.key === "Tab") {
        const lista = enfocables();
        const primero = lista[0], ultimo = lista.at(-1);
        if (!primero) { e.preventDefault(); nodo.focus(); }
        else if (e.shiftKey && (document.activeElement === primero || document.activeElement === nodo)) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
      }
    };
    const foco = e => { if (!nodo.contains(e.target) && !document.querySelector(".swal2-container")) enfocar(); };
    const exterior = e => { if (e.target === nodo) e.stopImmediatePropagation(); };
    nodo.addEventListener("mousedown", exterior, true);
    document.addEventListener("keydown", teclado, true);
    document.addEventListener("focusin", foco);
    return () => {
      nodo.removeEventListener("mousedown", exterior, true);
      document.removeEventListener("keydown", teclado, true);
      document.removeEventListener("focusin", foco);
      modal.hide(); modal.dispose();
      if (anterior?.isConnected) anterior.focus();
    };
  }, []);
  return createPortal(<div ref={elemento} className="modal hp-modal" tabIndex={-1} aria-labelledby={id}>
    <div className={`modal-dialog modal-${size} modal-dialog-centered modal-dialog-scrollable modal-fullscreen-sm-down`}>
      <div className="modal-content">
        <div className="modal-header"><div><h2 id={id} className="modal-title">{titulo}</h2>{subtitulo && <p className="text-muted small mb-0 mt-1">{subtitulo}</p>}</div>
          <button type="button" className="btn-close" aria-label="Cerrar ventana" disabled={ocupado} onClick={onClose} />
        </div>
        <div className={`modal-body ${bodyClassName}`}>{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  </div>, document.body);
}
