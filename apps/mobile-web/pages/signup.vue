<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useModalStore } from "~/stores/modalStore";
import { useUserStore } from "~/stores/userStore";

const route = useRoute();
const userStore = useUserStore();
const modalStore = useModalStore();

const domainOptions = [
  { label: "구글", value: "gmail.com" },
  { label: "네이버", value: "naver.com" },
  { label: "다음", value: "daum.net" },
  { label: "직접입력", value: "custom" }
];

const form = reactive({
  name: "",
  emailId: "",
  emailDomain: "gmail.com",
  customEmailDomain: "",
  password: "",
  passwordConfirm: "",
  address: ""
});

const submitted = ref(false);
const redirectTo = computed(() => String(route.query.redirect ?? "/"));
const selectedDomain = computed(() => form.emailDomain === "custom" ? form.customEmailDomain.trim() : form.emailDomain);
const email = computed(() => `${form.emailId.trim()}@${selectedDomain.value}`);

const errors = computed(() => {
  const nextErrors: Record<string, string> = {};

  if (!form.name.trim()) {
    nextErrors.name = "이름을 입력해주세요.";
  }

  if (!form.emailId.trim()) {
    nextErrors.emailId = "이메일 아이디를 입력해주세요.";
  } else if (!/^[^\s@]+$/.test(form.emailId.trim())) {
    nextErrors.emailId = "@ 앞부분만 입력해주세요.";
  }

  if (!selectedDomain.value) {
    nextErrors.emailDomain = "이메일 도메인을 선택하거나 입력해주세요.";
  } else if (!/^[^\s@]+\.[^\s@]+$/.test(selectedDomain.value)) {
    nextErrors.emailDomain = "올바른 도메인을 입력해주세요.";
  }

  if (form.password.length < 8) {
    nextErrors.password = "비밀번호는 8자 이상 입력해주세요.";
  }

  if (!form.passwordConfirm) {
    nextErrors.passwordConfirm = "비밀번호 확인을 입력해주세요.";
  } else if (form.password !== form.passwordConfirm) {
    nextErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
  }

  if (!form.address.trim()) {
    nextErrors.address = "주소지를 입력해주세요.";
  }

  return nextErrors;
});

const hasError = computed(() => Object.keys(errors.value).length > 0);

const signup = async () => {
  submitted.value = true;

  if (hasError.value) {
    return;
  }

  userStore.register({
    id: `user-${Date.now()}`,
    name: form.name.trim(),
    email: email.value,
    address: form.address.trim(),
    membershipGrade: "일반회원"
  });

  modalStore.show({
    type: "success",
    title: "회원가입 완료",
    message: `${form.name.trim()}님, 환영합니다.`,
    actions: [{ label: "쇼핑 계속하기", behavior: "route", to: redirectTo.value, variant: "primary" }]
  });
};
</script>

<template>
  <section class="mw-signup-page">
    <MobileSectionHeader title="Sign up" description="주문에 필요한 기본 정보를 입력해주세요." />

    <form class="mw-login-form" novalidate @submit.prevent="signup">
      <label>
        <span>이름</span>
        <input v-model="form.name" type="text" autocomplete="name" />
        <em v-if="submitted && errors.name" class="mw-form-error">{{ errors.name }}</em>
      </label>

      <label>
        <span>이메일</span>
        <div class="mw-signup-email-row">
          <input v-model="form.emailId" type="text" autocomplete="username" aria-label="이메일 아이디" />
          <b aria-hidden="true">@</b>
          <select v-model="form.emailDomain" aria-label="이메일 도메인">
            <option v-for="option in domainOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        <input
          v-if="form.emailDomain === 'custom'"
          v-model="form.customEmailDomain"
          type="text"
          autocomplete="off"
          placeholder="example.com"
          aria-label="직접 입력 도메인"
        />
        <em v-if="submitted && (errors.emailId || errors.emailDomain)" class="mw-form-error">
          {{ errors.emailId || errors.emailDomain }}
        </em>
      </label>

      <label>
        <span>비밀번호</span>
        <input v-model="form.password" type="password" autocomplete="new-password" />
        <em v-if="submitted && errors.password" class="mw-form-error">{{ errors.password }}</em>
      </label>

      <label>
        <span>비밀번호 확인</span>
        <input v-model="form.passwordConfirm" type="password" autocomplete="new-password" />
        <em v-if="submitted && errors.passwordConfirm" class="mw-form-error">{{ errors.passwordConfirm }}</em>
      </label>

      <label>
        <span>주소지</span>
        <input v-model="form.address" type="text" autocomplete="street-address" />
        <em v-if="submitted && errors.address" class="mw-form-error">{{ errors.address }}</em>
      </label>

      <button type="submit">회원가입하기</button>
    </form>
  </section>
</template>
