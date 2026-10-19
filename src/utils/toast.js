import Swal from "sweetalert2";

// Toast único para toda la app (misma config que el login / recuperar contraseña).
export const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 4000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

export const toastError = (title) => Toast.fire({ icon: "error", title });
export const toastExito = (title) => Toast.fire({ icon: "success", title });
export const toastAviso = (title) => Toast.fire({ icon: "warning", title });
export const toastInfo = (title) => Toast.fire({ icon: "info", title });
