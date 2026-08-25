const BASE_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem("jwt_token");

const getHeaders = (includeAuth = true, isMultipart = false) => {
  const headers = {};
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  if (includeAuth && getToken()) {
    headers["Authorization"] = `Bearer ${getToken()}`;
  }
  return headers;
};

async function handleResponse(respuesta, isAuthRequest = false) {
  if (respuesta.status === 401 && !isAuthRequest) {
    localStorage.removeItem("jwt_token");
    window.location.href = "/login";
    throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
  }

  const isJson = respuesta.headers
    .get("content-type")
    ?.includes("application/json");
  const data = isJson ? await respuesta.json() : null;

  if (!respuesta.ok) {
    let errorMsg = null;
    if (data?.errors && typeof data.errors === "object") {
      errorMsg = Object.values(data.errors).flat().join(" | ");
    }

    errorMsg =
      errorMsg ||
      data?.mensaje ||
      data?.message ||
      data?.title ||
      `Error del servidor (${respuesta.status})`;

    throw new Error(errorMsg);
  }

  return data;
}

export const apiClient = {
  get: async (endpoint, includeAuth = true) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: getHeaders(includeAuth),
    });
    return handleResponse(res);
  },
  post: async (endpoint, body, includeAuth = true, isAuthRequest = false) => {
    const esFormData = body instanceof FormData;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: getHeaders(includeAuth, esFormData),
      body: esFormData ? body : JSON.stringify(body),
    });
    return handleResponse(res, isAuthRequest);
  },
  put: async (endpoint, body, includeAuth = true) => {
    const esFormData = body instanceof FormData;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: getHeaders(includeAuth, esFormData),
      body: esFormData ? body : JSON.stringify(body),
    });
    return handleResponse(res);
  },
  patch: async (endpoint, body, includeAuth = true) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers: getHeaders(includeAuth),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },
  delete: async (endpoint, includeAuth = true) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders(includeAuth),
    });
    return handleResponse(res);
  },
};

export default apiClient;
