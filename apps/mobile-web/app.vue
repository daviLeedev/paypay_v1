<script setup lang="ts">
const { embedded } = useMobileRuntime();
</script>

<template>
  <MobileAppShell :embedded="embedded">
    <NuxtPage />
  </MobileAppShell>
</template>
