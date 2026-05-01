<script setup lang="ts">
import type { MobileLayoutMode } from "@repo/types";

const { homeConfig, setLayoutMode, resetHomeConfig } = useMobileUiConfig();

const layoutModes: MobileLayoutMode[] = ["single", "double"];
</script>

<template>
  <section class="mw-settings-page">
    <MobileSectionHeader title="Display settings" description="These controls mirror what Mobile Lab can change." />
    <div class="mw-settings-panel">
      <button
        v-for="mode in layoutModes"
        :key="mode"
        type="button"
        class="mw-segment-button"
        :class="{ 'is-active': homeConfig.layoutMode === mode }"
        @click="setLayoutMode(mode)"
      >
        {{ mode === "single" ? "1 column" : "2 columns" }}
      </button>
    </div>
    <button type="button" class="mw-secondary-button" @click="resetHomeConfig">Reset UI config</button>
  </section>
</template>
