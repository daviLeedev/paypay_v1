<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { ApiRequestError, USER_API } from "~/api";
import { useModalStore } from "~/stores/modalStore";
import { useUserStore } from "~/stores/userStore";

const route = useRoute();
const userStore = useUserStore();
const modalStore = useModalStore();

const form = reactive({
  email: "user@example.com",
  password: ""
});
const submitted = ref(false);
const isSubmitting = ref(false);
const formErrors = reactive<Record<string, string>>({});

const redirectTo = computed(() => String(route.query.redirect ?? "/"));
const signupTo = computed(() => `/signup?redirect=${encodeURIComponent(redirectTo.value)}`);

const resetErrors = () => {
  Object.keys(formErrors).forEach((key) => {
    delete formErrors[key];
  });
};

const validateLoginForm = () => {
  resetErrors();

  if (!form.email.trim()) {
    formErrors.email = "이메일을 입력해주세요.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    formErrors.email = "올바른 이메일을 입력해주세요.";
  }

  if (!form.password) {
    formErrors.password = "비밀번호를 입력해주세요.";
  }

  return !Object.keys(formErrors).length;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  return "로그인 중 오류가 발생했습니다.";
};

const login = async () => {
  submitted.value = true;

  if (!validateLoginForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    const session = await USER_API.login({
      email: form.email.trim(),
      password: form.password
    });

    userStore.setSession(session, {
      id: session.userId || form.email.trim(),
      name: form.email.trim().split("@")[0],
      email: form.email.trim(),
      membershipGrade: session.role === "USER" ? "일반회원" : session.role
    });

    modalStore.show({
      type: "success",
      title: "로그인 완료",
      message: "환영합니다.",
      actions: [{ label: "쇼핑 계속하기", behavior: "route", to: redirectTo.value, variant: "primary" }]
    });
  } catch (error) {
    modalStore.show({
      type: "warning",
      title: "로그인 실패",
      message: getErrorMessage(error),
      actions: [{ label: "확인", behavior: "close", variant: "primary" }]
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <section class="mw-login-page">
    <MobileSectionHeader title="Login" description="구매를 계속하려면 로그인해주세요." />

    <form class="mw-login-form" novalidate @submit.prevent="login">
      <label>
        <span>이메일</span>
        <input v-model="form.email" type="email" autocomplete="email" />
        <em v-if="submitted && formErrors.email" class="mw-form-error">{{ formErrors.email }}</em>
      </label>

      <label>
        <span>비밀번호</span>
        <input v-model="form.password" type="password" autocomplete="current-password" />
        <em v-if="submitted && formErrors.password" class="mw-form-error">{{ formErrors.password }}</em>
      </label>

      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? "로그인 중..." : "로그인하기" }}
      </button>
    </form>

    <p class="mw-login-support">
      <NuxtLink :to="signupTo">회원가입하기</NuxtLink>
    </p>
  </section>
</template>
