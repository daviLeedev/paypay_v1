<script setup lang="ts">
const { embedded } = useMobileRuntime();
</script>

<template>
  <MobileAppShell :embedded="embedded">
    <NuxtPage :transition="{ name: 'mw-page-transition', mode: 'out-in' }" />
  </MobileAppShell>
</template>
