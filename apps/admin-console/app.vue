<script setup lang="ts">
import { DEFAULT_FEATURE_FLAGS } from "@repo/config";
import type { AdminCommand } from "@repo/types";

const config = useRuntimeConfig();
const iframeRef = ref<HTMLIFrameElement | null>(null);
const nuxtApp = useNuxtApp();
const { connected, logs, events, snapshot } = useMobileLabState();

const localFlags = reactive({ ...DEFAULT_FEATURE_FLAGS });
const latencyMs = ref(0);
const forceError = ref(false);

const mobileUrl = computed(() => {
  const url = new URL(String(config.public.mobileWebUrl));
  url.searchParams.set("embedded", "true");
  return url.toString();
});

const postCommand = (command: AdminCommand) => {
  nuxtApp.$mobileLabBridge?.send(iframeRef.value?.contentWindow, "command", command);
};

const requestState = () => {
  postCommand({ type: "admin:request-state" });
};

const navigateMobile = (path: string) => {
  postCommand({ type: "admin:navigate", payload: { path, query: { embedded: true } } });
};

const toggleFlag = (key: string) => {
  localFlags[key] = !localFlags[key];
  postCommand({ type: "admin:set-feature-flag", payload: { key, enabled: localFlags[key] } });
};

const applyMockBehavior = () => {
  postCommand({
    type: "admin:set-mock-behavior",
    payload: {
      latencyMs: latencyMs.value,
      forceError: forceError.value
    }
  });
};
</script>

<template>
  <main class="admin-shell">
    <header class="admin-header">
      <div>
        <p class="eyebrow">Admin Console</p>
        <h1>Mobile Lab</h1>
      </div>
      <span class="status" :class="{ connected }">{{ connected ? "connected" : "waiting" }}</span>
    </header>

    <section class="lab-layout">
      <div class="device-stage">
        <iframe ref="iframeRef" class="mobile-frame" :src="mobileUrl" title="mobile-web preview" @load="requestState" />
      </div>

      <aside class="control-panel">
        <section>
          <h2>Controls</h2>
          <div class="button-row">
            <button type="button" @click="navigateMobile('/')">Home</button>
            <button type="button" @click="navigateMobile('/receipt')">Receipt</button>
            <button type="button" @click="requestState">Refresh</button>
          </div>
        </section>

        <section>
          <h2>Feature Flags</h2>
          <label v-for="(_, key) in localFlags" :key="key" class="switch-row">
            <span>{{ key }}</span>
            <input type="checkbox" :checked="localFlags[key]" @change="toggleFlag(String(key))" />
          </label>
        </section>

        <section>
          <h2>Mock Behavior</h2>
          <label class="field-row">
            <span>Latency</span>
            <input v-model.number="latencyMs" type="number" min="0" step="100" @change="applyMockBehavior" />
          </label>
          <label class="switch-row">
            <span>Force error</span>
            <input v-model="forceError" type="checkbox" @change="applyMockBehavior" />
          </label>
        </section>
      </aside>
    </section>

    <section class="data-grid">
      <article>
        <h2>State</h2>
        <pre>{{ snapshot ?? "No state received yet" }}</pre>
      </article>

      <article>
        <h2>Logs</h2>
        <ul>
          <li v-for="log in logs" :key="log.id">
            <strong>{{ log.type }}</strong>
            <span>{{ log.timestamp }}</span>
          </li>
        </ul>
      </article>

      <article>
        <h2>Events</h2>
        <ul>
          <li v-for="event in events" :key="event.messageId">
            <strong>{{ event.kind }}</strong>
            <span>{{ event.timestamp }}</span>
          </li>
        </ul>
      </article>
    </section>
  </main>
</template>
