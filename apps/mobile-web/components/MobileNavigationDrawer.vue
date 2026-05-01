<script setup lang="ts">
import { logEvent } from "@repo/logger";
import { useUserStore } from "~/stores/userStore";

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const route = useRoute();
const userStore = useUserStore();
const { theme, applyTheme } = useMobileTheme();

const drawerUserName = computed(() => userStore.user ? `${userStore.user.name}님` : "로그인해주세요");
const drawerUserGrade = computed(() => userStore.user?.membershipGrade ?? (userStore.isLoggedIn ? "일반회원" : "게스트"));
const loginTo = computed(() => ({ path: "/login", query: route.query }));

const navItems = [
  { label: "꽃", to: "/" },
  { label: "화병", to: "/products/orchid-pot" },
  { label: "부케", to: "/products/rose-bouquet" }
];

const closeDrawer = () => {
  emit("close");
};

const setTheme = (mode: "light" | "dark") => {
  applyTheme(mode);
  logEvent({ type: "drawer-theme-selected", payload: { theme: mode } });
};

watch(
  () => props.open,
  (isOpen) => {
    document.body.classList.toggle("has-mw-drawer-open", isOpen);
  }
);

onBeforeUnmount(() => {
  document.body.classList.remove("has-mw-drawer-open");
});
</script>

<template>
  <Teleport to="body">
    <div class="mw-drawer-root" :class="{ 'is-open': open }" aria-live="polite">
      <button v-if="open" class="mw-drawer-backdrop" type="button" aria-label="메뉴 닫기" @click="closeDrawer" />

      <aside
        id="mw-navigation-drawer"
        class="mw-drawer"
        :aria-hidden="!open"
        aria-label="모바일 메뉴"
      >
        <header class="mw-drawer__header">
          <div>
            <p>{{ drawerUserGrade }}</p>
            <NuxtLink v-if="!userStore.isLoggedIn" class="mw-drawer__login-link" :to="loginTo" @click="closeDrawer">
              <span>{{ drawerUserName }}</span>
              <span class="mw-drawer__login-arrow" aria-hidden="true" />
            </NuxtLink>
            <h2 v-else>{{ drawerUserName }}</h2>
          </div>
          <button class="mw-icon-button" type="button" aria-label="메뉴 닫기" @click="closeDrawer">
            <span class="mw-icon mw-icon--close" aria-hidden="true" />
          </button>
        </header>

        <section class="mw-drawer__section mw-drawer__section--theme" aria-label="테마 설정">
          <h3>테마</h3>
          <div class="mw-drawer__theme-row">
            <button type="button" :class="{ 'is-active': theme === 'light' }" @click="setTheme('light')">
              <span>화이트모드</span>
              <span class="mw-theme-flower mw-theme-flower--white" aria-hidden="true" />
            </button>
            <button type="button" :class="{ 'is-active': theme === 'dark' }" @click="setTheme('dark')">
              <span>다크모드</span>
              <span class="mw-theme-flower mw-theme-flower--purple" aria-hidden="true" />
            </button>
          </div>
        </section>

        <nav class="mw-drawer__nav" aria-label="Drawer navigation">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            class="mw-drawer__link"
            :class="{ 'is-active': route.path === item.to }"
            :to="{ path: item.to, query: route.query }"
            @click="closeDrawer"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
      </aside>
    </div>
  </Teleport>
</template>
