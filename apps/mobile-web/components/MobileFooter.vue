<script setup lang="ts">
const year = new Date().getFullYear();
</script>

<template>
  <footer class="mw-footer">
    <nav aria-label="Footer navigation">
      <a href="/">Home</a>
      <a href="/receipt">Receipt</a>
      <a href="/settings">Settings</a>
    </nav>
    <p>© {{ year }} PayPay Mobile</p>
  </footer>
</template>
