<script setup lang="ts">
import { logEvent } from "@repo/logger";
import type { MobileProductItem } from "@repo/types";
import useEmblaCarousel from "embla-carousel-vue";
import { computed, nextTick, ref, watch } from "vue";
import { useModalStore } from "~/stores/modalStore";
import { useUserStore } from "~/stores/userStore";

const props = defineProps<{
  product: MobileProductItem;
}>();

const userStore = useUserStore();
const modalStore = useModalStore();
const activeImageIndex = ref(0);
const failedImages = ref<Record<string, boolean>>({});
const [galleryRef, galleryApi] = useEmblaCarousel({
  align: "start",
  loop: false,
  duration: 28
});

const images = computed(() => {
  const productImages = props.product.images?.length ? props.product.images : [];
  const fallbackImages = props.product.imageUrl ? [props.product.imageUrl] : [];
  return productImages.length ? productImages : fallbackImages;
});

const breadcrumbs = computed(() => {
  return props.product.breadcrumbs?.length ? props.product.breadcrumbs : ["꽃", props.product.title];
});
const labels = computed(() => props.product.labels ?? [props.product.badge].filter(Boolean));

const syncSelectedImage = (api: { selectedScrollSnap: () => number }) => {
  activeImageIndex.value = api.selectedScrollSnap();
};

const setActiveImage = (index: number) => {
  if (!images.value.length) {
    activeImageIndex.value = 0;
    return;
  }

  const nextIndex = (index + images.value.length) % images.value.length;
  activeImageIndex.value = nextIndex;
  galleryApi.value?.scrollTo(nextIndex);
};

const buyNow = () => {
  logEvent({ type: "product-buy-clicked", payload: { productId: props.product.id } });

  if (!userStore.isLoggedIn) {
    modalStore.show({
      type: "warning",
      title: "로그인이 필요합니다",
      message: "로그인 이후 이용해주세요",
      actions: [
        { label: "닫기", behavior: "close", variant: "secondary" },
        { label: "로그인하기", behavior: "route", to: `/login?redirect=/products/${props.product.id}`, variant: "primary" }
      ]
    });
    return;
  }

  modalStore.show({
    type: "success",
    title: "구매 준비 완료",
    message: `${props.product.title} 상품 구매를 진행합니다.`,
    actions: [{ label: "확인", behavior: "close", variant: "primary" }]
  });
};

watch(
  galleryApi,
  (api) => {
    if (!api) {
      return;
    }

    api.on("select", syncSelectedImage);
    api.on("reInit", syncSelectedImage);
    api.scrollTo(activeImageIndex.value);
  },
  { immediate: true }
);

watch(
  () => images.value.length,
  async (length) => {
    await nextTick();
    galleryApi.value?.reInit();

    if (!length || activeImageIndex.value >= length) {
      setActiveImage(0);
    }
  }
);

watch(
  () => props.product.id,
  async () => {
    activeImageIndex.value = 0;
    failedImages.value = {};
    await nextTick();
    galleryApi.value?.reInit();
    galleryApi.value?.scrollTo(0);
  }
);
</script>

<template>
  <article class="mw-product-detail">
    <nav class="mw-product-detail__breadcrumb" aria-label="Breadcrumb">
      <NuxtLink to="/">홈</NuxtLink>
      <span v-for="crumb in breadcrumbs.slice(1)" :key="crumb">› {{ crumb }}</span>
    </nav>

    <section class="mw-product-gallery" aria-label="상품 이미지">
      <div ref="galleryRef" class="mw-product-gallery__viewport">
        <div class="mw-product-gallery__container">
          <div
            v-for="(image, index) in images"
            :key="`${image}-${index}`"
            class="mw-product-gallery__slide"
          >
            <img
              v-if="image && !failedImages[image]"
              :src="image"
              :alt="`${product.title} 이미지 ${index + 1}`"
              draggable="false"
              @error="failedImages[image] = true"
            />
            <div v-else class="mw-product-card__fallback" aria-hidden="true" />
          </div>

          <div v-if="!images.length" class="mw-product-gallery__slide">
            <div class="mw-product-card__fallback" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div v-if="images.length > 1" class="mw-product-gallery__indicators" aria-label="상품 이미지 슬라이드 선택">
        <button
          v-for="(image, index) in images"
          :key="`${image}-indicator-${index}`"
          type="button"
          :aria-label="`${index + 1}번째 상품 이미지 보기`"
          :aria-current="index === activeImageIndex ? 'true' : undefined"
          :class="{ 'is-active': index === activeImageIndex }"
          @click="setActiveImage(index)"
        />
      </div>
    </section>

    <section class="mw-product-detail__content">
      <h2>{{ product.title }}</h2>

      <div v-if="labels.length" class="mw-product-detail__labels">
        <span v-for="label in labels" :key="label">{{ label }}</span>
      </div>

      <div class="mw-product-detail__rating">
        <strong>★ {{ product.rating?.toFixed(1) ?? "4.9" }}</strong>
        <NuxtLink to="/">후기 {{ product.reviewCount ?? 0 }}개</NuxtLink>
      </div>

      <div v-if="product.colorOptions?.length" class="mw-product-detail__colors" aria-label="색상 옵션">
        <span
          v-for="color in product.colorOptions"
          :key="color"
          class="mw-product-detail__color"
          :style="{ background: color }"
        />
      </div>

      <div class="mw-product-detail__price">
        <span v-if="product.originalPrice">{{ product.originalPrice }}</span>
        <strong>
          <em v-if="product.discountRate">{{ product.discountRate }}</em>
          {{ product.price }}
        </strong>
      </div>

      <NuxtLink class="mw-product-detail__coupon" to="/">
        <span>{{ product.couponText ?? "첫 구매 쿠폰 받으러 가기" }}</span>
        <strong>›</strong>
      </NuxtLink>

      <button class="mw-product-detail__buy" type="button" @click="buyNow">구매하기</button>
    </section>
  </article>
</template>
