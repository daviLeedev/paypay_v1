<script setup lang="ts">
const { embedded } = useMobileRuntime();
</script>

<template>
  <main class="mw-app-shell">
    <MobileHeader :embedded="embedded" />
    <MobileBodyContent />
    <MobileFooter />
  </main>
</template>
