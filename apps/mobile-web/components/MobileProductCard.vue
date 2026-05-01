<script setup lang="ts">
import type { MobileLayoutMode, MobileProductItem } from "@repo/types";

defineProps<{
  item: MobileProductItem;
  layoutMode: MobileLayoutMode;
}>();

const failed = ref(false);
</script>

<template>
  <NuxtLink class="mw-product-card" :class="`mw-product-card--${layoutMode}`" :to="item.linkTo ?? `/products/${item.id}`">
    <div class="mw-product-card__media">
      <img v-if="item.imageUrl && !failed" :src="item.imageUrl" :alt="item.title" @error="failed = true" />
      <div v-else class="mw-product-card__fallback" aria-hidden="true" />
    </div>
    <div class="mw-product-card__content">
      <span v-if="item.badge" class="mw-product-card__badge">{{ item.badge }}</span>
      <h3>{{ item.title }}</h3>
      <p v-if="item.subtitle">{{ item.subtitle }}</p>
      <strong v-if="item.price">{{ item.price }}</strong>
    </div>
  </NuxtLink>
</template>
