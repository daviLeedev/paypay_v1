<script setup lang="ts">
import type { MobileLayoutMode, MobileProductItem } from "@repo/types";

defineProps<{
  items: MobileProductItem[];
  layoutMode: MobileLayoutMode;
}>();
</script>

<template>
  <div class="mw-product-grid" :class="`mw-product-grid--${layoutMode}`">
    <MobileProductCard v-for="item in items" :key="item.id" :item="item" :layout-mode="layoutMode" />
  </div>
</template>
