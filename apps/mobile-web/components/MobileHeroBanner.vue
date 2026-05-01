<script setup lang="ts">
import type { MobileBannerItem } from "@repo/types";

const props = withDefaults(
  defineProps<{
    items: MobileBannerItem[];
    activeIndex: number;
    autoplay?: boolean;
    intervalMs?: number;
  }>(),
  {
    autoplay: false,
    intervalMs: 5000
  }
);

const emit = defineEmits<{
  "update:activeIndex": [index: number];
}>();

const failedImages = ref<Record<string, boolean>>({});

const activeItem = computed(() => props.items[props.activeIndex] ?? props.items[0]);
const hasMultiple = computed(() => props.items.length > 1);

const setActive = (index: number) => {
  if (!props.items.length) {
    emit("update:activeIndex", 0);
    return;
  }

  emit("update:activeIndex", (index + props.items.length) % props.items.length);
};

let timer: ReturnType<typeof window.setInterval> | undefined;

const clearAutoplay = () => {
  if (timer) {
    window.clearInterval(timer);
    timer = undefined;
  }
};

onMounted(() => {
  if (!props.autoplay || !hasMultiple.value) {
    return;
  }

  timer = window.setInterval(() => setActive(props.activeIndex + 1), props.intervalMs);
});

onBeforeUnmount(clearAutoplay);

watch(
  () => props.items.length,
  (length) => {
    if (props.activeIndex >= length) {
      setActive(0);
    }
  }
);
</script>

<template>
  <section class="mw-hero-banner" :class="activeItem ? `mw-hero-banner--${activeItem.tone ?? 'default'}` : undefined">
    <div v-if="activeItem" class="mw-hero-banner__viewport">
      <NuxtLink class="mw-hero-banner__slide" :to="activeItem.linkTo ?? '/'">
        <img
          v-if="activeItem.imageUrl && !failedImages[activeItem.id]"
          class="mw-hero-banner__image"
          :src="activeItem.imageUrl"
          :alt="activeItem.title"
          @error="failedImages[activeItem.id] = true"
        />
        <div v-else class="mw-hero-banner__fallback" aria-hidden="true" />
      </NuxtLink>
    </div>

    <div v-if="hasMultiple" class="mw-hero-banner__controls" aria-label="Banner controls">
      <button type="button" aria-label="Previous banner" @click="setActive(activeIndex - 1)">‹</button>
      <div class="mw-hero-banner__indicators">
        <button
          v-for="(item, index) in items"
          :key="item.id"
          type="button"
          :aria-label="`Show ${item.title}`"
          :class="{ 'is-active': index === activeIndex }"
          @click="setActive(index)"
        />
      </div>
      <button type="button" aria-label="Next banner" @click="setActive(activeIndex + 1)">›</button>
    </div>
  </section>
</template>
