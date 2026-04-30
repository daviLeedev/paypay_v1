import type { FeatureFlags, MobileRouteState, MobileStateSnapshot, MockBehavior } from "@repo/types";

export type MobileSnapshotInput = {
  route: MobileRouteState;
  featureFlags: FeatureFlags;
  mockBehavior: MockBehavior;
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
  embedded: input.embedded,
  updatedAt: new Date().toISOString()
});
