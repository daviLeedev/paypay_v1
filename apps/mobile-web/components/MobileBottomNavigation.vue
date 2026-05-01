<script setup lang="ts">
const route = useRoute();

const navItems = [
  { label: "Home", to: "/" },
  { label: "Bouquet", to: "/products/rose-bouquet" }
];
</script>

<template>
  <nav class="mw-bottom-nav" aria-label="Mobile primary navigation">
    <NuxtLink
      v-for="item in navItems"
      :key="item.to"
      class="mw-bottom-nav__item"
      :class="{ 'is-active': route.path === item.to }"
      :to="{ path: item.to, query: route.query }"
    >
      <span class="mw-bottom-nav__dot" aria-hidden="true" />
      <span>{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>
