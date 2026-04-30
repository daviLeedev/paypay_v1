import type { BridgeEnvelope, MobileLogEntry, MobileStateSnapshot } from "@repo/types";

export const useMobileLabState = () => {
  const connected = useState<boolean>("mobile-lab:connected", () => false);
  const logs = useState<MobileLogEntry[]>("mobile-lab:logs", () => []);
  const events = useState<BridgeEnvelope[]>("mobile-lab:events", () => []);
  const snapshot = useState<MobileStateSnapshot | null>("mobile-lab:snapshot", () => null);

  return {
    connected,
    logs,
    events,
    snapshot
  };
};
