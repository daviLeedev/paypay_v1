<script setup lang="ts">
const { homeConfig, activeBannerIndex, setActiveBannerIndex, setLayoutMode } = useMobileUiConfig();
</script>

<template>
  <section class="mw-home-page">
    <MobileHeroBanner
      :items="homeConfig.banners"
      :active-index="activeBannerIndex"
      autoplay
      :interval-ms="3000"
      @update:active-index="setActiveBannerIndex"
    />
    <MobileQuickActions :items="homeConfig.quickActions" />
    <MobileProductSection
      :items="homeConfig.products"
      :layout-mode="homeConfig.layoutMode"
      @update:layout-mode="setLayoutMode"
    />
  </section>
</template>
