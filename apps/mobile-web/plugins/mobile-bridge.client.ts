import { createBridgeChannel } from "@repo/bridge";
import { DEFAULT_FEATURE_FLAGS, mergeFeatureFlags } from "@repo/config";
import { configureLogger, createLogger, logEvent } from "@repo/logger";
import { createMobileStateSnapshot, DEFAULT_MOCK_BEHAVIOR } from "@repo/state-adapter";
import type { AdminCommand, FeatureFlags, MobileRouteState, MockBehavior } from "@repo/types";

const normalizeQuery = (query: Record<string, unknown>): Record<string, string> => {
  return Object.fromEntries(
    Object.entries(query).map(([key, value]) => [key, Array.isArray(value) ? String(value[0] ?? "") : String(value ?? "")])
  );
};

const normalizeCommandQuery = (query?: Record<string, string | boolean | number>): Record<string, string> | undefined => {
  if (!query) {
    return undefined;
  }

  return Object.fromEntries(Object.entries(query).map(([key, value]) => [key, String(value)]));
};

export default defineNuxtPlugin(() => {
  const route = useRoute();
  const router = useRouter();
  const runtime = useMobileRuntime();
  const uiConfig = useMobileUiConfig();
  const bridge = createBridgeChannel({ source: "mobile-web" });

  runtime.embedded.value = route.query.embedded === "true" || window.self !== window.top;
  runtime.featureFlags.value = { ...DEFAULT_FEATURE_FLAGS };
  runtime.mockBehavior.value = { ...DEFAULT_MOCK_BEHAVIOR };

  configureLogger(createLogger({ bridge, source: "mobile-web" }));

  const routeState = (): MobileRouteState => ({
    path: route.path,
    query: normalizeQuery(route.query)
  });

  const sendState = () => {
    bridge.sendToParent(
      "state",
      createMobileStateSnapshot({
        route: routeState(),
        featureFlags: runtime.featureFlags.value,
        mockBehavior: runtime.mockBehavior.value,
        ui: uiConfig.uiState.value,
        embedded: runtime.embedded.value
      })
    );
  };

  const applyFeatureFlags = (flags: FeatureFlags) => {
    runtime.featureFlags.value = mergeFeatureFlags(runtime.featureFlags.value, flags);
    bridge.sendToParent("event", { type: "mobile:feature-flags-updated", payload: runtime.featureFlags.value });
    logEvent({ type: "feature-flags-updated", payload: runtime.featureFlags.value });
    sendState();
  };

  const applyMockBehavior = (mockBehavior: Partial<MockBehavior>) => {
    runtime.mockBehavior.value = { ...runtime.mockBehavior.value, ...mockBehavior };
    bridge.sendToParent("event", { type: "mobile:mock-behavior-updated", payload: runtime.mockBehavior.value });
    logEvent({ type: "mock-behavior-updated", payload: runtime.mockBehavior.value });
    sendState();
  };

  const runCommand = async (command: AdminCommand) => {
    runtime.lastCommand.value = command.type;
    logEvent({ type: "admin-command-received", payload: command });

    if (command.type === "admin:navigate") {
      await router.push({ path: command.payload.path, query: normalizeCommandQuery(command.payload.query) });
      sendState();
      return;
    }

    if (command.type === "admin:set-feature-flag") {
      applyFeatureFlags({ [command.payload.key]: command.payload.enabled });
      return;
    }

    if (command.type === "admin:set-feature-flags") {
      applyFeatureFlags(command.payload);
      return;
    }

    if (command.type === "admin:set-mock-behavior") {
      applyMockBehavior(command.payload);
      return;
    }

    if (command.type === "ui:set-layout-mode") {
      uiConfig.setLayoutMode(command.payload.layoutMode);
      return;
    }

    if (command.type === "ui:set-banners") {
      uiConfig.setBanners(command.payload.banners);
      return;
    }

    if (command.type === "ui:set-products") {
      uiConfig.setProducts(command.payload.products);
      return;
    }

    if (command.type === "ui:set-active-banner") {
      uiConfig.setActiveBannerIndex(command.payload.index);
      return;
    }

    if (command.type === "admin:request-state") {
      sendState();
    }
  };

  bridge.listen("command", (message) => {
    if (message.source !== "admin-console") {
      return;
    }

    void runCommand(message.payload);
  });

  bridge.sendToParent("handshake", { status: "ready", embedded: runtime.embedded.value });
  bridge.sendToParent("event", {
    type: "mobile:ready",
    payload: { embedded: runtime.embedded.value, href: window.location.href }
  });
  logEvent({ type: "mobile-ready", payload: { embedded: runtime.embedded.value } });
  sendState();

  watch(
    () => route.fullPath,
    () => {
      bridge.sendToParent("event", { type: "mobile:navigated", payload: routeState() });
      logEvent({ type: "mobile-navigated", payload: routeState() });
      sendState();
    }
  );

  watch(
    () => uiConfig.uiState.value,
    (uiState) => {
      bridge.sendToParent("event", { type: "mobile:ui-config-updated", payload: uiState });
      logEvent({
        type: "ui-config-updated",
        payload: {
          layoutMode: uiState.homeConfig.layoutMode,
          banners: uiState.homeConfig.banners.length,
          products: uiState.homeConfig.products.length
        }
      });
      sendState();
    },
    { deep: true }
  );

  return {
    provide: {
      mobileBridge: bridge
    }
  };
});
