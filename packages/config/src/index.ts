import type { FeatureFlags } from "@repo/types";

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  newCheckout: false,
  showDebugPanel: true,
  useMockPayments: false
};

export type FeatureFlagListener = (flags: FeatureFlags) => void;

export type FeatureFlagController = {
  getFlags(): FeatureFlags;
  isEnabled(key: string): boolean;
  setFlag(key: string, enabled: boolean): FeatureFlags;
  setFlags(flags: FeatureFlags): FeatureFlags;
  subscribe(listener: FeatureFlagListener): () => void;
};

export const mergeFeatureFlags = (base: FeatureFlags, next?: FeatureFlags): FeatureFlags => ({
  ...base,
  ...(next ?? {})
});

export const createFeatureFlagController = (initialFlags: FeatureFlags = DEFAULT_FEATURE_FLAGS): FeatureFlagController => {
  let flags = { ...initialFlags };
  const listeners = new Set<FeatureFlagListener>();

  const notify = () => {
    const snapshot = { ...flags };
    for (const listener of listeners) {
      listener(snapshot);
    }
  };

  return {
    getFlags() {
      return { ...flags };
    },

    isEnabled(key) {
      return Boolean(flags[key]);
    },

    setFlag(key, enabled) {
      flags = { ...flags, [key]: enabled };
      notify();
      return { ...flags };
    },

    setFlags(nextFlags) {
      flags = mergeFeatureFlags(flags, nextFlags);
      notify();
      return { ...flags };
    },

    subscribe(listener) {
      listeners.add(listener);
      listener({ ...flags });
      return () => listeners.delete(listener);
    }
  };
};
