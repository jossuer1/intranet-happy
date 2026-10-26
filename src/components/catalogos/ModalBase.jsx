import ModalDialog from "../ui/ModalDialog";

/**
 * Modal de Bootstrap controlado por React (no usa el JS de Bootstrap).
 * Se cierra con la X, con los botones del contenido o con la tecla Esc.
 * A propósito NO se cierra al hacer clic afuera, para no perder lo escrito.
 */
function ModalBase({ titulo, subtitulo, onClose, children }) {
  return (
    <ModalDialog titulo={titulo} subtitulo={subtitulo} onClose={onClose} bodyClassName="p-0">{children}</ModalDialog>
  );
}

export default ModalBase;
