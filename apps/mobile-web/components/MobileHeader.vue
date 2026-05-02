<script setup lang="ts">
import { logEvent } from "@repo/logger";
import { computed, ref } from "vue";

defineProps<{
  embedded: boolean;
}>();

const drawerOpen = ref(false);
const route = useRoute();
const router = useRouter();
const isProductDetail = computed(() => route.path.startsWith("/products/"));
const isAuthPage = computed(() => route.path === "/login" || route.path === "/signup");
const isMypagePage = computed(() => route.path.startsWith("/mypage"));
const showHomeButton = computed(() => isAuthPage.value);
const showBackButton = computed(() => !showHomeButton.value && (isProductDetail.value || isMypagePage.value));
const hasLeftAction = computed(() => showHomeButton.value || showBackButton.value);
const showLogo = computed(() => !hasLeftAction.value);

const openSearch = () => {
  logEvent({ type: "header-search-clicked" });
};

const goHome = () => {
  logEvent({ type: "header-home-clicked", payload: { from: route.fullPath } });
  navigateTo("/");
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
  <header class="mw-header" :class="{ 'mw-header--compact': hasLeftAction }" :data-embedded="embedded">
    <button
      v-if="showHomeButton"
      class="mw-icon-button mw-header__home-button"
      type="button"
      aria-label="홈으로 이동"
      @click="goHome"
    >
      <img class="mw-icon-image mw-icon-image--home" src="/icons/home-flower.png" alt="" aria-hidden="true" />
    </button>

    <button
      v-else-if="showBackButton"
      class="mw-icon-button mw-header__back-button"
      type="button"
      aria-label="뒤로가기"
      @click="goBack"
    >
      <img
        v-if="isProductDetail"
        class="mw-icon-image mw-icon-image--back-flower"
        src="/icons/back-flower.png"
        alt=""
        aria-hidden="true"
      />
      <span v-else class="mw-icon mw-icon--back" aria-hidden="true" />
    </button>

    <button v-else class="mw-icon-button" type="button" aria-label="검색 열기" @click="openSearch">
      <span class="mw-icon mw-icon--search" aria-hidden="true" />
    </button>

    <NuxtLink v-if="showLogo" class="mw-header__logo" to="/" aria-label="홈으로 이동">
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
