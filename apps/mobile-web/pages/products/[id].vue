<script setup lang="ts">
const route = useRoute();
const { homeConfig } = useMobileUiConfig();

const productId = computed(() => String(route.params.id ?? ""));
const product = computed(() => homeConfig.value.products.find((item) => item.id === productId.value) ?? homeConfig.value.products[0]);
</script>

<template>
  <MobileProductDetail v-if="product" :product="product" />
</template>
