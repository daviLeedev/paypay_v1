<script setup lang="ts">
import { logEvent } from "@repo/logger";

defineProps<{
  embedded: boolean;
}>();

const drawerOpen = ref(false);
const route = useRoute();
const router = useRouter();
const isProductDetail = computed(() => route.path.startsWith("/products/"));

const openSearch = () => {
  logEvent({ type: "header-search-clicked" });
};

const goBack = () => {
  logEvent({ type: "header-back-clicked", payload: { from: route.fullPath } });

  if (import.meta.client && window.history.length > 1) {
    router.back();
    return;
  }

  navigateTo("/");
};

const openDrawer = () => {
  drawerOpen.value = true;
  logEvent({ type: "header-menu-clicked" });
};

const closeDrawer = () => {
  drawerOpen.value = false;
};
</script>

<template>
  <header class="mw-header" :class="{ 'mw-header--product-detail': isProductDetail }" :data-embedded="embedded">
    <button
      v-if="isProductDetail"
      class="mw-icon-button mw-header__back-button"
      type="button"
      aria-label="뒤로가기"
      @click="goBack"
    >
      <span class="mw-icon mw-icon--back" aria-hidden="true" />
    </button>

    <button v-else class="mw-icon-button" type="button" aria-label="검색 열기" @click="openSearch">
      <span class="mw-icon mw-icon--search" aria-hidden="true" />
    </button>

    <NuxtLink v-if="!isProductDetail" class="mw-header__logo" to="/" aria-label="홈으로 이동">
      <!-- <img src="/images/brand/yumi-shop-logo.svg" alt="YUMI Shop" /> -->
    </NuxtLink>

    <button
      class="mw-icon-button mw-header__menu-button"
      type="button"
      aria-label="메뉴 열기"
      aria-controls="mw-navigation-drawer"
      :aria-expanded="drawerOpen"
      @click="openDrawer"
    >
      <span class="mw-icon mw-icon--hamburger" aria-hidden="true" />
    </button>
  </header>

  <MobileNavigationDrawer :open="drawerOpen" @close="closeDrawer" />
</template>
