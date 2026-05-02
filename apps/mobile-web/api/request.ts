import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig
} from "axios";
import { PATH } from "./path";

export type AuthTokenPayload = {
  accessToken: string;
  refreshToken: string;
  role: string;
  userId: string;
};

export type ApiRequestConfig = AxiosRequestConfig & {
  skipAuth?: boolean;
  _retry?: boolean;
};

type InternalApiRequestConfig = InternalAxiosRequestConfig & {
  skipAuth?: boolean;
  _retry?: boolean;
};

export type ApiRequestErrorPayload = {
  code?: string;
  data?: unknown;
  message: string;
  status?: number;
};

export class ApiRequestError extends Error {
  code?: string;
  data?: unknown;
  status?: number;

  constructor(payload: ApiRequestErrorPayload) {
    super(payload.message);
    this.name = "ApiRequestError";
    this.code = payload.code;
    this.data = payload.data;
    this.status = payload.status;
  }
}

const DEFAULT_TIMEOUT_MS = 15000;
const ACCESS_TOKEN_STORAGE_KEY = "MW_ACCESS_TOKEN";
const REFRESH_TOKEN_STORAGE_KEY = "MW_REFRESH_TOKEN";
const USER_ID_STORAGE_KEY = "MW_USER_ID";
const ROLE_STORAGE_KEY = "MW_USER_ROLE";
const REFRESH_BEFORE_EXPIRE_MS = 60 * 1000;

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");
const withLeadingSlash = (value: string) => value.startsWith("/") ? value : `/${value}`;

let refreshPromise: Promise<AuthTokenPayload> | null = null;

const canUseStorage = () => import.meta.client && typeof localStorage !== "undefined";

export const getStoredAccessToken = () => {
  if (!canUseStorage()) {
    return "";
  }

  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) ?? "";
};

export const getStoredRefreshToken = () => {
  if (!canUseStorage()) {
    return "";
  }

  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) ?? "";
};

export const getStoredAuthTokens = (): Partial<AuthTokenPayload> => {
  if (!canUseStorage()) {
    return {};
  }

  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) ?? "",
    refreshToken: localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) ?? "",
    role: localStorage.getItem(ROLE_STORAGE_KEY) ?? "",
    userId: localStorage.getItem(USER_ID_STORAGE_KEY) ?? ""
  };
};

export const setStoredAuthTokens = (payload: AuthTokenPayload) => {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, payload.accessToken);
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, payload.refreshToken);
  localStorage.setItem(USER_ID_STORAGE_KEY, payload.userId);
  localStorage.setItem(ROLE_STORAGE_KEY, payload.role);
};

export const clearStoredAuthTokens = () => {
  if (!canUseStorage()) {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_ID_STORAGE_KEY);
  localStorage.removeItem(ROLE_STORAGE_KEY);
};

const getJwtExpiresAt = (token: string) => {
  if (!token || !import.meta.client) {
    return 0;
  }

  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return 0;
    }

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(window.atob(normalizedPayload)) as { exp?: number };
    return decoded.exp ? decoded.exp * 1000 : 0;
  } catch {
    return 0;
  }
};

const shouldRefreshAccessToken = (token: string) => {
  const expiresAt = getJwtExpiresAt(token);
  return Boolean(expiresAt && expiresAt - Date.now() <= REFRESH_BEFORE_EXPIRE_MS);
};

export const getRootServer = () => {
  const config = useRuntimeConfig();
  return trimTrailingSlash(String(config.public.rootServer ?? ""));
};

export const resolveApiUrl = (path: string) => {
  const rootServer = getRootServer();
  const normalizedPath = withLeadingSlash(path);
  return rootServer ? `${rootServer}${normalizedPath}` : normalizedPath;
};

const refreshAuthTokens = async () => {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    clearStoredAuthTokens();
    throw new ApiRequestError({ message: "로그인이 만료되었습니다. 다시 로그인해주세요.", status: 401 });
  }

  if (!refreshPromise) {
    refreshPromise = axios.post<AuthTokenPayload>(
      resolveApiUrl(PATH.USER.REFRESH),
      { refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Client": "mobile-web"
        },
        timeout: DEFAULT_TIMEOUT_MS
      }
    )
      .then((response) => {
        setStoredAuthTokens(response.data);
        return response.data;
      })
      .catch((error: AxiosError<{ code?: string; message?: string }>) => {
        clearStoredAuthTokens();
        throw new ApiRequestError({
          code: error.response?.data?.code,
          data: error.response?.data,
          message: error.response?.data?.message ?? "로그인이 만료되었습니다. 다시 로그인해주세요.",
          status: error.response?.status ?? 401
        });
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

export const request: AxiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json"
  },
  timeout: DEFAULT_TIMEOUT_MS
});

request.interceptors.request.use(async (config: InternalApiRequestConfig) => {
  config.baseURL = getRootServer();
  config.url = config.url ? withLeadingSlash(config.url) : config.url;
  config.headers.set("X-Client", "mobile-web");

  if (config.skipAuth) {
    return config;
  }

  const accessToken = getStoredAccessToken();
  if (shouldRefreshAccessToken(accessToken)) {
    await refreshAuthTokens();
  }

  const nextAccessToken = getStoredAccessToken();
  if (nextAccessToken) {
    config.headers.set("Authorization", `Bearer ${nextAccessToken}`);
  }

  return config;
});

request.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ code?: string; message?: string }>) => {
    const originalConfig = error.config as InternalApiRequestConfig | undefined;
    const status = error.response?.status;

    if (status === 401 && originalConfig && !originalConfig._retry && !originalConfig.skipAuth) {
      originalConfig._retry = true;
      const nextTokens = await refreshAuthTokens();
      originalConfig.headers.set("Authorization", `Bearer ${nextTokens.accessToken}`);
      return request.request(originalConfig);
    }

    const responseData = error.response?.data;
    const message = responseData?.message ?? error.message ?? "API 요청 중 오류가 발생했습니다.";

    return Promise.reject(new ApiRequestError({
      code: responseData?.code,
      data: responseData,
      message,
      status
    }));
  }
);

export const apiRequest = async <T>(config: ApiRequestConfig) => {
  const response = await request.request<T>(config);
  return response.data;
};

export const apiGet = <T>(url: string, config?: ApiRequestConfig) => {
  return apiRequest<T>({ ...config, method: "GET", url });
};

export const apiPost = <T, TBody = unknown>(url: string, data?: TBody, config?: ApiRequestConfig) => {
  return apiRequest<T>({ ...config, data, method: "POST", url });
};
