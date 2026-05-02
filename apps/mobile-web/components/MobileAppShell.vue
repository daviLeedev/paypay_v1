<script setup lang="ts">
defineProps<{
  embedded: boolean;
}>();

const showFooter = false;
</script>

<template>
  <div class="mw-app-shell" :class="{ 'is-embedded': embedded }">
    <MobileHeader :embedded="embedded" />
    <main class="mw-page">
      <slot />
    </main>
    <MobileBottomNavigation v-if="showFooter" />
    <MobileAlertModal />
  </div>
</template>
