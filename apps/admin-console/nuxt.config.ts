const filePath = (path: string) => new URL(path, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const env = (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env;

export default defineNuxtConfig({
  compatibilityDate: "2025-03-01",
  devtools: { enabled: false },
  typescript: {
    strict: true
  },
  alias: {
    "@repo/bridge": filePath("../../packages/bridge/src/index.ts"),
    "@repo/config": filePath("../../packages/config/src/index.ts"),
    "@repo/types": filePath("../../packages/types/src/index.ts")
  },
  runtimeConfig: {
    public: {
      mobileWebUrl: env?.NUXT_PUBLIC_MOBILE_WEB_URL ?? "http://localhost:3000"
    }
  },
  css: ["~/assets/css/main.css"],
  vite: {
    server: {
      hmr: {
        overlay: false
      }
    }
  }
});
