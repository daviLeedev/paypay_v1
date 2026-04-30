<script setup lang="ts">
defineProps<{
  embedded: boolean;
}>();
</script>

<template>
  <header class="mw-header">
    <div>
      <p class="mw-header__eyebrow">PayPay Mobile</p>
      <h1>Mobile Web</h1>
    </div>
    <span class="mw-badge">{{ embedded ? "embedded" : "standalone" }}</span>
  </header>
</template>
