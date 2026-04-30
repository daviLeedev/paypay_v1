import { createBridgeChannel } from "@repo/bridge";

export default defineNuxtPlugin(() => {
  const bridge = createBridgeChannel({ source: "admin-console" });
  const { connected, logs, events, snapshot } = useMobileLabState();

  bridge.listen("all", (message) => {
    if (message.source !== "mobile-web") {
      return;
    }

    events.value = [message, ...events.value].slice(0, 80);

    if (message.kind === "handshake") {
      connected.value = true;
    }

    if (message.kind === "log") {
      logs.value = [message.payload, ...logs.value].slice(0, 80);
    }

    if (message.kind === "state") {
      snapshot.value = message.payload;
    }
  });

  return {
    provide: {
      mobileLabBridge: bridge
    }
  };
});
