<script setup lang="ts">
defineProps<{
  embedded: boolean;
}>();
</script>

<template>
  <div class="mw-app-shell" :class="{ 'is-embedded': embedded }">
    <MobileHeader :embedded="embedded" />
    <main class="mw-page">
      <slot />
    </main>
    <MobileBottomNavigation />
    <MobileAlertModal />
  </div>
</template>
