<script setup lang="ts">
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-vue";
import type { MobileBannerItem } from "@repo/types";

type EmblaApiLike = {
  selectedScrollSnap(): number;
};

const props = withDefaults(
  defineProps<{
    items: MobileBannerItem[];
    activeIndex: number;
    autoplay?: boolean;
    intervalMs?: number;
  }>(),
  {
    autoplay: false,
    intervalMs: 3000
  }
);

const emit = defineEmits<{
  "update:activeIndex": [index: number];
}>();

const failedImages = ref<Record<string, boolean>>({});
const plugins = computed(() => props.autoplay ? [Autoplay({ delay: props.intervalMs, stopOnInteraction: false, stopOnMouseEnter: true })] : []);
const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start", duration: 28 }, plugins);

const activeItem = computed(() => props.items[props.activeIndex] ?? props.items[0]);
const hasMultiple = computed(() => props.items.length > 1);

const setActive = (index: number) => {
  if (!props.items.length) {
    emit("update:activeIndex", 0);
    return;
  }

  const nextIndex = (index + props.items.length) % props.items.length;
  emit("update:activeIndex", nextIndex);
  emblaApi.value?.scrollTo(nextIndex);
};

const syncSelected = (api: EmblaApiLike) => {
  emit("update:activeIndex", api.selectedScrollSnap());
};

watch(
  emblaApi,
  (api) => {
    if (!api) {
      return;
    }

    api.on("select", syncSelected);
    api.plugins().autoplay?.play();
  },
  { immediate: true }
);

watch(
  () => props.activeIndex,
  (index) => {
    if (emblaApi.value && index !== emblaApi.value.selectedScrollSnap()) {
      emblaApi.value.scrollTo(index);
    }
  }
);

watch(
  () => props.items.length,
  async (length) => {
    await nextTick();
    emblaApi.value?.reInit();

    if (props.activeIndex >= length) {
      setActive(0);
    }
  }
);
</script>

<template>
  <section class="mw-hero-banner" :class="activeItem ? `mw-hero-banner--${activeItem.tone ?? 'default'}` : undefined">
    <div v-if="items.length" ref="emblaRef" class="mw-hero-banner__viewport">
      <div class="mw-hero-banner__container">
        <NuxtLink
          v-for="item in items"
          :key="item.id"
          class="mw-hero-banner__slide"
          :to="item.linkTo ?? '/'"
        >
          <img
            v-if="item.imageUrl && !failedImages[item.id]"
            class="mw-hero-banner__image"
            :src="item.imageUrl"
            :alt="item.title"
            draggable="false"
            @error="failedImages[item.id] = true"
          />
          <div v-else class="mw-hero-banner__fallback" aria-hidden="true" />
        </NuxtLink>
      </div>
    </div>

    <div v-if="hasMultiple" class="mw-hero-banner__indicators" aria-label="Banner controls">
      <button
        v-for="(item, index) in items"
        :key="item.id"
        type="button"
        :aria-label="`Show ${item.title}`"
        :class="{ 'is-active': index === activeIndex }"
        @click="setActive(index)"
      />
    </div>
  </section>
</template>
