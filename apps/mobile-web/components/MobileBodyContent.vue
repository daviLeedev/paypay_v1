<script setup lang="ts">
import { logEvent } from "@repo/logger";

const cards = [
  {
    title: "Main Content",
    description: "모바일 웹의 주요 콘텐츠 영역입니다."
  },
  {
    title: "Service Section",
    description: "서비스 안내, 목록, 배너 같은 본문 요소를 배치할 수 있습니다."
  }
];
</script>

<template>
  <section class="mw-body">
    <div class="mw-hero">
      <p>Body Content</p>
      <h2>기본 레이아웃 영역</h2>
      <button type="button" @click="logEvent({ type: 'body-primary-action-clicked' })">Primary Action</button>
    </div>

    <div class="mw-content-list">
      <article v-for="card in cards" :key="card.title" class="mw-content-card">
        <h3>{{ card.title }}</h3>
        <p>{{ card.description }}</p>
      </article>
    </div>
  </section>
</template>
