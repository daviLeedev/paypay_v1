import {
  BRIDGE_NAMESPACE,
  BRIDGE_VERSION,
  type BridgeEnvelope,
  type BridgeKind,
  type BridgeMessageHandler,
  type BridgePayloadByKind,
  type BridgeSource
} from "@repo/types";

export type BridgeTarget = Pick<Window, "postMessage">;

export type BridgeChannelOptions = {
  source: BridgeSource;
  targetOrigin?: string;
  allowedOrigins?: string[];
};

export interface BridgeChannel {
  send<K extends BridgeKind>(target: BridgeTarget | null | undefined, kind: K, payload: BridgePayloadByKind[K]): void;
  sendToParent<K extends BridgeKind>(kind: K, payload: BridgePayloadByKind[K]): void;
  listen(kind: "all", handler: BridgeMessageHandler): () => void;
  listen<K extends BridgeKind>(kind: K, handler: BridgeMessageHandler<K>): () => void;
  destroy(): void;
}

const DEFAULT_TARGET_ORIGIN = "*";

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const createMessageId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `bridge-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const isBridgeEnvelope = (value: unknown): value is BridgeEnvelope => {
  if (!isObject(value)) {
    return false;
  }

  return (
    value.namespace === BRIDGE_NAMESPACE &&
    value.version === BRIDGE_VERSION &&
    typeof value.kind === "string" &&
    typeof value.source === "string" &&
    typeof value.timestamp === "string" &&
    typeof value.messageId === "string" &&
    "payload" in value
  );
};

export const createBridgeMessage = <K extends BridgeKind>(
  source: BridgeSource,
  kind: K,
  payload: BridgePayloadByKind[K]
): BridgeEnvelope<K> => ({
  namespace: BRIDGE_NAMESPACE,
  version: BRIDGE_VERSION,
  kind,
  source,
  payload,
  timestamp: new Date().toISOString(),
  messageId: createMessageId()
});

export const createBridgeChannel = (options: BridgeChannelOptions): BridgeChannel => {
  const listeners = new Set<(message: BridgeEnvelope, event: MessageEvent) => void>();
  const targetOrigin = options.targetOrigin ?? DEFAULT_TARGET_ORIGIN;

  const originAllowed = (origin: string) => {
    if (!options.allowedOrigins?.length) {
      return true;
    }

    return options.allowedOrigins.includes(origin);
  };

  const onMessage = (event: MessageEvent) => {
    if (!originAllowed(event.origin) || !isBridgeEnvelope(event.data)) {
      return;
    }

    for (const listener of listeners) {
      listener(event.data, event);
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("message", onMessage);
  }

  return {
    send(target, kind, payload) {
      if (!target) {
        return;
      }

      target.postMessage(createBridgeMessage(options.source, kind, payload), targetOrigin);
    },

    sendToParent(kind, payload) {
      if (typeof window === "undefined" || window.parent === window) {
        return;
      }

      window.parent.postMessage(createBridgeMessage(options.source, kind, payload), targetOrigin);
    },

    listen(kind: BridgeKind | "all", handler: BridgeMessageHandler) {
      const listener = (message: BridgeEnvelope, event: MessageEvent) => {
        if (kind !== "all" && message.kind !== kind) {
          return;
        }

        handler(message, event);
      };

      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    destroy() {
      listeners.clear();
      if (typeof window !== "undefined") {
        window.removeEventListener("message", onMessage);
      }
    }
  };
};
