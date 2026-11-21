import type {
  ApiEnvelope,
  AuthPayload,
  LoginInput,
  RawUser,
  RegisterInput,
  SafeUser,
  Task,
  TaskInput,
  TokenPair,
  UserInput,
  UserRecord,
} from "./types";

/**
 * All browser requests go through the Next.js rewrite at /api/backend/*.
 * The rewrite proxies to the Express API configured in next.config.ts,
 * which means the browser never makes a cross-origin request.
 */
export const API_BASE = "/api/backend";

const ACCESS_KEY = "taskflow.accessToken";
const REFRESH_KEY = "taskflow.refreshToken";
const USER_KEY = "taskflow.cachedUser";

export class ApiError extends Error {
  status: number;
  payload?: ApiEnvelope;

  constructor(message: string, status: number, payload?: ApiEnvelope) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function readStorage(key: string) {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* storage can be unavailable in private mode */
  }
}

export const tokenStore = {
  access() {
    return readStorage(ACCESS_KEY);
  },
  refresh() {
    return readStorage(REFRESH_KEY);
  },
  hasSession() {
    return Boolean(readStorage(ACCESS_KEY) || readStorage(REFRESH_KEY));
  },
  set(pair: Partial<TokenPair>) {
    if (pair.accessToken) writeStorage(ACCESS_KEY, pair.accessToken);
    if (pair.refreshToken) writeStorage(REFRESH_KEY, pair.refreshToken);
  },
  clear() {
    writeStorage(ACCESS_KEY, null);
    writeStorage(REFRESH_KEY, null);
    writeStorage(USER_KEY, null);
  },
  cachedUser(): UserRecord | null {
    const raw = readStorage(USER_KEY);
    if (!raw) return null;
    try {
      return normalizeUser(JSON.parse(raw) as RawUser);
    } catch {
      return null;
    }
  },
  cacheUser(user: UserRecord | null) {
    writeStorage(USER_KEY, user ? JSON.stringify(user) : null);
  },
};

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

function notifyUnauthorized() {
  unauthorizedHandler?.();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("taskflow:unauthorized"));
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStore.refresh();
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE}/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        const payload = (await response.json().catch(() => null)) as
          | ApiEnvelope<TokenPair>
          | null;

        if (!response.ok || !payload?.data?.accessToken) {
          return null;
        }

        tokenStore.set({
          accessToken: payload.data.accessToken,
          refreshToken: payload.data.refreshToken,
        });
        return payload.data.accessToken;
      } catch {
        return null;
      } finally {
        // Reset on the next tick so concurrent requests can share this result.
        setTimeout(() => {
          refreshPromise = null;
        }, 0);
      }
    })();
  }

  return refreshPromise;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
  retry?: boolean;
  signal?: AbortSignal;
}

export async function request<T>(
  path: string,
  { method = "GET", body, auth = true, retry = true, signal }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = tokenStore.access();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(
      "Cannot reach the API. Make sure the backend is running and reachable.",
      0,
    );
  }

  const text = await response.text();
  let payload: ApiEnvelope<T> | null = null;
  if (text) {
    try {
      payload = JSON.parse(text) as ApiEnvelope<T>;
    } catch {
      payload = null;
    }
  }

  if (response.status === 401 && auth && retry) {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      return request<T>(path, { method, body, auth, retry: false, signal });
    }
    tokenStore.clear();
    notifyUnauthorized();
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      (response.status === 429
        ? "Too many attempts. Please wait a few minutes and try again."
        : `Request failed with status ${response.status}`);
    throw new ApiError(message, response.status, payload ?? undefined);
  }

  if (payload && payload.success === false) {
    throw new ApiError(
      payload.message || "The request could not be completed",
      response.status,
      payload,
    );
  }

  if (payload === null) {
    // Some endpoints (logout / update) may return an empty body.
    return undefined as T;
  }

  return payload as unknown as T;
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  return envelope.data as T;
}

export function normalizeUser(raw: RawUser): UserRecord {
  const { _id, ...rest } = raw;
  return {
    ...rest,
    id: raw.id ?? _id ?? "",
    username: raw.username ?? "",
    email: raw.email ?? "",
    isEmailVerified: Boolean(raw.isEmailVerified),
    role: raw.role ?? "user",
    status: raw.status ?? true,
  };
}

export const api = {
  async register(input: RegisterInput) {
    const payload = await request<ApiEnvelope<SafeUser>>("/registration", {
      method: "POST",
      body: input,
      auth: false,
    });
    return payload as ApiEnvelope<SafeUser>;
  },

  async login(input: LoginInput) {
    const payload = await request<ApiEnvelope<AuthPayload>>("/login", {
      method: "POST",
      body: input,
      auth: false,
    });
    return unwrap(payload);
  },

  async me() {
    const payload = await request<ApiEnvelope<SafeUser>>("/me");
    return unwrap(payload);
  },

  async getUser(id: string) {
    const payload = await request<ApiEnvelope<RawUser>>(`/getSingle/${id}`);
    return normalizeUser(unwrap(payload));
  },

  async getUsers(params: { search?: string; role?: string } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.role) query.set("role", params.role);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    const payload = await request<ApiEnvelope<RawUser[]>>(`/getAll${suffix}`);
    return (unwrap(payload) ?? []).map(normalizeUser);
  },

  async updateUser(id: string, body: UserInput) {
    return request<ApiEnvelope<null>>(`/update/${id}`, {
      method: "PATCH",
      body,
    });
  },

  async approveUser(id: string) {
    return request<ApiEnvelope<null>>(`/approve/${id}`, { method: "PATCH" });
  },

  async disapproveUser(id: string) {
    return request<ApiEnvelope<null>>(`/disapprove/${id}`, { method: "PATCH" });
  },

  async verifyEmail(token: string) {
    const payload = await request<ApiEnvelope<SafeUser>>(
      `/verify-email?token=${encodeURIComponent(token)}`,
      { auth: false },
    );
    return unwrap(payload);
  },

  async resendVerification(email: string) {
    return request<ApiEnvelope<null>>("/resend-verification", {
      method: "POST",
      body: { email },
      auth: false,
    });
  },

  async forgotPassword(email: string) {
    return request<ApiEnvelope<null>>("/forgot-password", {
      method: "POST",
      body: { email },
      auth: false,
    });
  },

  async resetPassword(input: {
    token: string;
    password: string;
    confirmPassword: string;
  }) {
    return request<ApiEnvelope<null>>("/reset-password", {
      method: "POST",
      body: input,
      auth: false,
    });
  },

  async logout() {
    const refreshToken = tokenStore.refresh();
    try {
      if (refreshToken) {
        await request<ApiEnvelope<null>>("/logout", {
          method: "POST",
          body: { refreshToken },
          auth: false,
        });
      }
    } finally {
      tokenStore.clear();
    }
  },

  async getTasks() {
    const payload = await request<ApiEnvelope<Task[]>>("/getAllTask");
    return unwrap(payload) ?? [];
  },

  async getTask(id: string) {
    const payload = await request<ApiEnvelope<Task>>(`/getSingleTask/${id}`);
    return unwrap(payload);
  },

  async createTask(input: TaskInput) {
    const payload = await request<ApiEnvelope<Task>>("/createTask", {
      method: "POST",
      body: input,
    });
    return unwrap(payload);
  },

  async updateTask(id: string, input: TaskInput) {
    const payload = await request<ApiEnvelope<Task>>(`/updateTask/${id}`, {
      method: "PATCH",
      body: input,
    });
    const task = unwrap(payload);
    // PATCH /updateTask returns the raw document, while the API only populates
    // assignedTo on GET. Re-fetch so callers always receive the assignee.
    if (task && typeof task.assignedTo === "string") {
      try {
        return await api.getTask(task._id);
      } catch {
        return task;
      }
    }
    return task;
  },

  async deleteTask(id: string) {
    return request<ApiEnvelope<Task>>(`/deleteTask/${id}`, {
      method: "DELETE",
    });
  },

  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE}/getAllTask`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      // A reachable API answers 401 here (no token is attached). 2xx is also
      // accepted in case the endpoint ever becomes public.
      return response.status === 401 || response.status === 403 || response.ok;
    } catch {
      return false;
    }
  },
};
