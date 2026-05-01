<script setup lang="ts">
import type { MobileLayoutMode, MobileProductItem } from "@repo/types";

defineProps<{
  items: MobileProductItem[];
  layoutMode: MobileLayoutMode;
}>();

const emit = defineEmits<{
  "update:layoutMode": [layoutMode: MobileLayoutMode];
}>();

const layoutOptions: Array<{ icon: string; label: string; value: MobileLayoutMode }> = [
  { icon: "single", label: "1열로 보기", value: "single" },
  { icon: "double", label: "2열로 보기", value: "double" }
];
</script>

<template>
  <section class="mw-product-section">
    <MobileSectionHeader title="Recommended flowers" description="미리 준비하는 봄 기운">
      <div class="mw-section-header__actions" aria-label="상품 목록 컬럼 선택">
        <button
          v-for="option in layoutOptions"
          :key="option.value"
          type="button"
          class="mw-layout-toggle"
          :class="{ 'is-active': layoutMode === option.value }"
          :aria-label="option.label"
          :aria-pressed="layoutMode === option.value"
          @click="emit('update:layoutMode', option.value)"
        >
          <span class="mw-layout-icon" :class="`mw-layout-icon--${option.icon}`" aria-hidden="true" />
        </button>
      </div>
    </MobileSectionHeader>
    <MobileProductGrid :items="items" :layout-mode="layoutMode" />
  </section>
</template>
