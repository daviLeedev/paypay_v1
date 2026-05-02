export const PATH = {
  USER: {
    SIGNUP: "/auth/signup/user",
    SIGHUP: "/auth/signup/user",
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    ME: "/auth/me"
  }
} as const;

export type ApiPath = typeof PATH;
