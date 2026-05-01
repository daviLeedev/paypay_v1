import type { FeatureFlags, MobileRouteState, MobileStateSnapshot, MobileUiState, MockBehavior } from "@repo/types";

export type MobileSnapshotInput = {
  route: MobileRouteState;
  featureFlags: FeatureFlags;
  mockBehavior: MockBehavior;
  ui?: MobileUiState;
  embedded: boolean;
};

export const DEFAULT_MOCK_BEHAVIOR: MockBehavior = {
  latencyMs: 0,
  forceError: false
};

export const createMobileStateSnapshot = (input: MobileSnapshotInput): MobileStateSnapshot => ({
  route: {
    path: input.route.path,
    query: { ...input.route.query }
  },
  featureFlags: { ...input.featureFlags },
  mockBehavior: { ...input.mockBehavior },
  ui: input.ui
    ? {
        homeConfig: {
          layoutMode: input.ui.homeConfig.layoutMode,
          banners: input.ui.homeConfig.banners.map((banner) => ({ ...banner })),
          quickActions: input.ui.homeConfig.quickActions.map((action) => ({ ...action })),
          products: input.ui.homeConfig.products.map((product) => ({ ...product }))
        },
        activeBannerIndex: input.ui.activeBannerIndex
      }
    : undefined,
  embedded: input.embedded,
  updatedAt: new Date().toISOString()
});
