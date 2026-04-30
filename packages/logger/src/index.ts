import type { BridgeChannel } from "@repo/bridge";
import type { LogEventInput, MobileLogEntry } from "@repo/types";

export type LoggerOptions = {
  bridge?: BridgeChannel;
  source?: "mobile-web";
};

export type Logger = {
  logEvent<TPayload = unknown>(input: LogEventInput<TPayload>): MobileLogEntry<TPayload>;
};

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `log-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const createLogger = (options: LoggerOptions = {}): Logger => ({
  logEvent(input) {
    const entry: MobileLogEntry = {
      id: createId(),
      source: options.source ?? "mobile-web",
      type: input.type,
      payload: input.payload,
      level: input.level ?? "info",
      timestamp: new Date().toISOString()
    };

    options.bridge?.sendToParent("log", entry);
    return entry as MobileLogEntry<typeof input.payload>;
  }
});

let activeLogger: Logger = createLogger();

export const configureLogger = (logger: Logger) => {
  activeLogger = logger;
};

export const logEvent = <TPayload = unknown>(input: LogEventInput<TPayload>) => {
  return activeLogger.logEvent(input);
};
