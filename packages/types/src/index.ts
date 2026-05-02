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

export type MobileLayoutMode = "single" | "double";

export type MobileBannerTone = "default" | "primary" | "dark";

export type MobileBannerItem = {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkTo?: string;
  tone?: MobileBannerTone;
};

export type MobileQuickActionItem = {
  id: string;
  label: string;
  description?: string;
  linkTo: string;
};

export type MobileProductItem = {
  id: string;
  title: string;
  subtitle?: string;
  price?: string;
  originalPrice?: string;
  discountRate?: string;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
  images?: string[];
  badge?: string;
  labels?: string[];
  breadcrumbs?: string[];
  colorOptions?: string[];
  couponText?: string;
  rewardText?: string;
  linkTo?: string;
};

export type MobileHomeConfig = {
  layoutMode: MobileLayoutMode;
  banners: MobileBannerItem[];
  quickActions: MobileQuickActionItem[];
  products: MobileProductItem[];
};

export type MobileUiState = {
  homeConfig: MobileHomeConfig;
  activeBannerIndex: number;
};

export type MobileStateSnapshot = {
  route: MobileRouteState;
  featureFlags: FeatureFlags;
  mockBehavior: MockBehavior;
  ui?: MobileUiState;
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
  | { type: "mobile:mock-behavior-updated"; payload: MockBehavior }
  | { type: "mobile:ui-config-updated"; payload: MobileUiState };

export type AdminCommand =
  | { type: "admin:navigate"; payload: { path: string; query?: Record<string, string | boolean | number> } }
  | { type: "admin:set-feature-flag"; payload: { key: string; enabled: boolean } }
  | { type: "admin:set-feature-flags"; payload: FeatureFlags }
  | { type: "admin:set-mock-behavior"; payload: Partial<MockBehavior> }
  | { type: "admin:request-state"; payload?: undefined }
  | { type: "ui:set-layout-mode"; payload: { layoutMode: MobileLayoutMode } }
  | { type: "ui:set-banners"; payload: { banners: MobileBannerItem[] } }
  | { type: "ui:set-products"; payload: { products: MobileProductItem[] } }
  | { type: "ui:set-active-banner"; payload: { index: number } };

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
