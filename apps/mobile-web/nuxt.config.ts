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
    "@repo/logger": fileURLToPath(new URL("../../packages/logger/src/index.ts", import.meta.url)),
    "@repo/state-adapter": fileURLToPath(new URL("../../packages/state-adapter/src/index.ts", import.meta.url)),
    "@repo/types": fileURLToPath(new URL("../../packages/types/src/index.ts", import.meta.url))
  },
  css: ["~/assets/css/main.css"]
});
