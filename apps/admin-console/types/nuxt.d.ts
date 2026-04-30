import type { BridgeChannel } from "@repo/bridge";

declare module "#app" {
  interface NuxtApp {
    $mobileLabBridge?: BridgeChannel;
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    $mobileLabBridge?: BridgeChannel;
  }
}

export {};
