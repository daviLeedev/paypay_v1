<script setup lang="ts">
import type { MobileQuickActionItem } from "@repo/types";

defineProps<{
  items: MobileQuickActionItem[];
}>();
</script>

<template>
  <section class="mw-quick-actions" aria-label="Quick actions">
    <NuxtLink v-for="item in items" :key="item.id" class="mw-quick-action" :to="item.linkTo">
      <strong>{{ item.label }}</strong>
      <span v-if="item.description">{{ item.description }}</span>
    </NuxtLink>
  </section>
</template>
