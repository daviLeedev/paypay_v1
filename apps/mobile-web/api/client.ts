import { apiRequest, getRootServer, resolveApiUrl } from "./request";

type LegacyApiFetchOptions = {
  body?: unknown;
  headers?: Record<string, string>;
  method?: "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
  params?: Record<string, unknown>;
};

export { getRootServer, resolveApiUrl };

export const apiFetch = <T>(path: string, options?: LegacyApiFetchOptions) => {
  return apiRequest<T>({
    data: options?.body,
    headers: options?.headers,
    method: options?.method,
    params: options?.params,
    url: path
  });
};
