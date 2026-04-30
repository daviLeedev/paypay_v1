import { fileURLToPath } from "node:url";

export default defineNuxtConfig({
  compatibilityDate: "2025-03-01",
  devtools: { enabled: true },
  typescript: {
    strict: true
  },
  alias: {
    "@repo/bridge": fileURLToPath(new URL("../../packages/bridge/src/index.ts", import.meta.url)),
    "@repo/config": fileURLToPath(new URL("../../packages/config/src/index.ts", import.meta.url)),
    "@repo/types": fileURLToPath(new URL("../../packages/types/src/index.ts", import.meta.url))
  },
  runtimeConfig: {
    public: {
      mobileWebUrl: process.env.NUXT_PUBLIC_MOBILE_WEB_URL ?? "http://localhost:3000"
    }
  },
  css: ["~/assets/css/main.css"]
});
