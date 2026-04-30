export const BRIDGE_NAMESPACE = "paypay.mobile-lab" as const;
export const BRIDGE_VERSION = 1 as const;

export type BridgeNamespace = typeof BRIDGE_NAMESPACE;
export type BridgeVersion = typeof BRIDGE_VERSION;

export type BridgeSource = "mobile-web" | "admin-console";
export type BridgeKind = "event" | "log" | "state" | "command" | "flags" | "handshake";

export type FeatureFlags = Record<string, boolean>;

export type MockBehavior = {
  latencyMs: number;
  forceError: boolean;
};

export type MobileRouteState = {
  path: string;
  query: Record<string, string>;
};

export type MobileStateSnapshot = {
  route: MobileRouteState;
  featureFlags: FeatureFlags;
  mockBehavior: MockBehavior;
  embedded: boolean;
  updatedAt: string;
};

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogEventInput<TPayload = unknown> = {
  type: string;
  payload?: TPayload;
  level?: LogLevel;
};

export type MobileLogEntry<TPayload = unknown> = Required<LogEventInput<TPayload>> & {
  id: string;
  source: "mobile-web";
  timestamp: string;
};

export type MobileEvent =
  | { type: "mobile:ready"; payload: { embedded: boolean; href: string } }
  | { type: "mobile:navigated"; payload: MobileRouteState }
  | { type: "mobile:feature-flags-updated"; payload: FeatureFlags }
  | { type: "mobile:mock-behavior-updated"; payload: MockBehavior };

export type AdminCommand =
  | { type: "admin:navigate"; payload: { path: string; query?: Record<string, string | boolean | number> } }
  | { type: "admin:set-feature-flag"; payload: { key: string; enabled: boolean } }
  | { type: "admin:set-feature-flags"; payload: FeatureFlags }
  | { type: "admin:set-mock-behavior"; payload: Partial<MockBehavior> }
  | { type: "admin:request-state"; payload?: undefined };

export type BridgePayloadByKind = {
  event: MobileEvent;
  log: MobileLogEntry;
  state: MobileStateSnapshot;
  command: AdminCommand;
  flags: FeatureFlags;
  handshake: { status: "ready" | "connected"; embedded?: boolean };
};

export type BridgeEnvelope<K extends BridgeKind = BridgeKind> = {
  namespace: BridgeNamespace;
  version: BridgeVersion;
  kind: K;
  source: BridgeSource;
  payload: BridgePayloadByKind[K];
  timestamp: string;
  messageId: string;
};

export type BridgeMessageHandler<K extends BridgeKind = BridgeKind> = (message: BridgeEnvelope<K>, event: MessageEvent) => void;
