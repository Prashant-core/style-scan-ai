const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

const ACCESS_KEY = "stylescan_access";
const REFRESH_KEY = "stylescan_refresh";

function storage() {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

// Keeps the login tokens in the browser
export const tokenStore = {
  get access() {
    return storage()?.getItem(ACCESS_KEY) ?? null;
  },
  get refresh() {
    return storage()?.getItem(REFRESH_KEY) ?? null;
  },
  set(access, refresh) {
    const store = storage();
    if (!store) return;
    store.setItem(ACCESS_KEY, access);
    store.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    const store = storage();
    if (!store) return;
    store.removeItem(ACCESS_KEY);
    store.removeItem(REFRESH_KEY);
  },
};

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const FIELD_NAMES = {
  full_name: "Full name",
  username: "Username",
  email: "Email",
  password: "Password",
};

// Turns the server's error into one short sentence a person can understand
function readError(data, fallback) {
  if (!data) return fallback;
  if (typeof data.detail === "string") return data.detail;

  if (Array.isArray(data.detail) && data.detail.length > 0) {
    const first = data.detail[0];
    const message = String(first.msg || "");
    const field = FIELD_NAMES[first.loc?.[first.loc.length - 1]] || "This field";

    if (/valid email/i.test(message)) return "Enter a valid email address.";
    if (/at least/i.test(message)) return `${field} is too short.`;
    if (/at most/i.test(message)) return `${field} is too long.`;
    return message.replace(/^Value error,\s*/i, "") || fallback;
  }
  return fallback;
}

let refreshPromise = null;

// Gets a new access token. If many requests fail at once, only one refresh runs.
async function refreshTokens() {
  const refresh = tokenStore.refresh;
  if (!refresh) return false;

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    })
      .then(async (response) => {
        if (!response.ok) return false;
        const data = await response.json();
        tokenStore.set(data.access_token, data.refresh_token);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function apiRequest(path, { method = "GET", body, auth = true, retry = true } = {}) {
  const headers = {};
  let payload;

  if (body instanceof FormData) {
    payload = body; // the browser sets the content type for file uploads
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  if (auth && tokenStore.access) {
    headers.Authorization = `Bearer ${tokenStore.access}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { method, headers, body: payload });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }

  // The access token expired: refresh it once and try again
  if (response.status === 401 && auth && retry && (await refreshTokens())) {
    return apiRequest(path, { method, body, auth, retry: false });
  }

  if (response.status === 204) return null;

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(readError(data, "Something went wrong. Try again."), response.status);
  }
  return data;
}

export const api = {
  get: (path, options) => apiRequest(path, { ...options }),
  post: (path, body, options) => apiRequest(path, { method: "POST", body, ...options }),
  patch: (path, body, options) => apiRequest(path, { method: "PATCH", body, ...options }),
  delete: (path, body, options) => apiRequest(path, { method: "DELETE", body, ...options }),
};