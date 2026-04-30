import { DEFAULT_FEATURE_FLAGS } from "@repo/config";
import { DEFAULT_MOCK_BEHAVIOR } from "@repo/state-adapter";
import type { FeatureFlags, MockBehavior } from "@repo/types";

export const useMobileRuntime = () => {
  const embedded = useState<boolean>("mobile:embedded", () => false);
  const featureFlags = useState<FeatureFlags>("mobile:feature-flags", () => ({ ...DEFAULT_FEATURE_FLAGS }));
  const mockBehavior = useState<MockBehavior>("mobile:mock-behavior", () => ({ ...DEFAULT_MOCK_BEHAVIOR }));
  const lastCommand = useState<string>("mobile:last-command", () => "none");

  return {
    embedded,
    featureFlags,
    mockBehavior,
    lastCommand
  };
};
