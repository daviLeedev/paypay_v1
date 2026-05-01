<script setup lang="ts">
import { computed, ref } from "vue";
import { useModalStore } from "~/stores/modalStore";
import { useUserStore } from "~/stores/userStore";

const route = useRoute();
const userStore = useUserStore();
const modalStore = useModalStore();

const email = ref("guest@yumishop.test");
const name = ref("YUMI Guest");
const redirectTo = computed(() => String(route.query.redirect ?? "/"));
const signupTo = computed(() => `/signup?redirect=${encodeURIComponent(redirectTo.value)}`);

const login = async () => {
  userStore.login({
    id: "demo-user",
    name: name.value,
    email: email.value
  });

  modalStore.show({
    type: "success",
    title: "로그인 완료",
    message: `${name.value}님, 환영합니다.`,
    actions: [{ label: "쇼핑 계속하기", behavior: "route", to: redirectTo.value, variant: "primary" }]
  });
};
</script>

<template>
  <section class="mw-login-page">
    <MobileSectionHeader title="Login" description="구매를 계속하려면 로그인해주세요." />

    <form class="mw-login-form" @submit.prevent="login">
      <label>
        <span>이름</span>
        <input v-model="name" type="text" autocomplete="name" />
      </label>
      <label>
        <span>이메일</span>
        <input v-model="email" type="email" autocomplete="email" />
      </label>
      <button type="submit">로그인하기</button>
    </form>

    <p class="mw-login-support">
      <NuxtLink :to="signupTo">회원가입하기</NuxtLink>
    </p>
  </section>
</template>
