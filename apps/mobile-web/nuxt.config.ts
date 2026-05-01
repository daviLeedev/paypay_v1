const filePath = (path: string) => new URL(path, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

export default defineNuxtConfig({
  compatibilityDate: "2025-03-01",
  devtools: { enabled: false },
  modules: ["@pinia/nuxt"],
  typescript: {
    strict: true
  },
  alias: {
    "@repo/bridge": filePath("../../packages/bridge/src/index.ts"),
    "@repo/config": filePath("../../packages/config/src/index.ts"),
    "@repo/logger": filePath("../../packages/logger/src/index.ts"),
    "@repo/state-adapter": filePath("../../packages/state-adapter/src/index.ts"),
    "@repo/types": filePath("../../packages/types/src/index.ts")
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
