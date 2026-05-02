<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { ApiRequestError, USER_API } from "~/api";
import { useModalStore } from "~/stores/modalStore";
import { useUserStore } from "~/stores/userStore";

const route = useRoute();
const userStore = useUserStore();
const modalStore = useModalStore();

const passwordSpecialCharacters = "@$!%*#?&";
const passwordSpecialPattern = /[@$!%*#?&]/;

const domainOptions = [
  { label: "gmail.com", value: "gmail.com" },
  { label: "naver.com", value: "naver.com" },
  { label: "daum.net", value: "daum.net" },
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
const isSubmitting = ref(false);
const formErrors = reactive<Record<string, string>>({});

const redirectTo = computed(() => String(route.query.redirect ?? "/"));
const selectedDomain = computed(() => form.emailDomain === "custom" ? form.customEmailDomain.trim() : form.emailDomain);
const email = computed(() => `${form.emailId.trim()}@${selectedDomain.value}`);
const hasError = computed(() => Object.keys(formErrors).length > 0);

const resetErrors = () => {
  Object.keys(formErrors).forEach((key) => {
    delete formErrors[key];
  });
};

const checkEmailDuplicate = async (targetEmail: string) => {
  // TODO: 회원 API가 준비되면 이 함수 안에서 이메일 중복 확인 API로 교체합니다.
  const reservedEmails = ["test@yumishop.test", "demo@yumishop.test"];
  await Promise.resolve();
  return reservedEmails.includes(targetEmail.toLowerCase());
};

const getPasswordError = (password: string) => {
  if (!password) {
    return "비밀번호를 입력해주세요.";
  }

  const missingRules: string[] = [];

  if (password.length < 8) {
    missingRules.push("최소 8자");
  }

  if (!/[A-Za-z]/.test(password)) {
    missingRules.push("영문");
  }

  if (!/\d/.test(password)) {
    missingRules.push("숫자");
  }

  if (!passwordSpecialPattern.test(password)) {
    missingRules.push(`특수문자(${passwordSpecialCharacters})`);
  }

  return missingRules.length ? `부족한 조건: ${missingRules.join(", ")}.` : "";
};

const validateSignupForm = async () => {
  resetErrors();

  if (!form.name.trim()) {
    formErrors.name = "이름을 입력해주세요.";
  }

  if (!form.emailId.trim()) {
    formErrors.emailId = "이메일 아이디를 입력해주세요.";
  } else if (!/^[^\s@]+$/.test(form.emailId.trim())) {
    formErrors.emailId = "@ 앞부분만 입력해주세요.";
  }

  if (!selectedDomain.value) {
    formErrors.emailDomain = "이메일 도메인을 선택하거나 입력해주세요.";
  } else if (!/^[^\s@]+\.[^\s@]+$/.test(selectedDomain.value)) {
    formErrors.emailDomain = "올바른 이메일 도메인을 입력해주세요.";
  }

  const passwordError = getPasswordError(form.password);
  if (passwordError) {
    formErrors.password = passwordError;
  }

  if (!form.passwordConfirm) {
    formErrors.passwordConfirm = "비밀번호 확인을 입력해주세요.";
  } else if (form.password !== form.passwordConfirm) {
    formErrors.passwordConfirm = "입력된 비밀번호가 다릅니다.";
  }

  if (!form.address.trim()) {
    formErrors.address = "주소지를 입력해주세요.";
  }

  if (!hasError.value && await checkEmailDuplicate(email.value)) {
    formErrors.emailId = "이미 사용 중인 이메일입니다.";
  }

  return !hasError.value;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  return "회원가입 중 오류가 발생했습니다.";
};

const signup = async () => {
  submitted.value = true;
  isSubmitting.value = true;

  try {
    const isValid = await validateSignupForm();

    if (!isValid) {
      return;
    }

    const createdUser = await USER_API.signup({
      email: email.value,
      name: form.name.trim(),
      password: form.password
    });

    userStore.register({
      id: createdUser.userId ?? createdUser.id ?? `user-${Date.now()}`,
      name: createdUser.name ?? form.name.trim(),
      email: createdUser.email ?? email.value,
      address: form.address.trim(),
      membershipGrade: createdUser.membershipGrade ?? (createdUser.role === "USER" ? "일반회원" : createdUser.role ?? "일반회원")
    });

    modalStore.show({
      type: "success",
      title: "회원가입 완료",
      message: `${form.name.trim()}님 환영합니다.`,
      actions: [{ label: "로그인하기", behavior: "route", to: `/login?redirect=${encodeURIComponent(redirectTo.value)}`, variant: "primary" }]
    });
  } catch (error) {
    modalStore.show({
      type: "warning",
      title: "회원가입 실패",
      message: getErrorMessage(error),
      actions: [{ label: "확인", behavior: "close", variant: "primary" }]
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <section class="mw-signup-page">
    <MobileSectionHeader title="Sign up" description="주문에 필요한 기본 정보를 입력해주세요." />

    <form class="mw-login-form" novalidate @submit.prevent="signup">
      <label>
        <span>이름</span>
        <input v-model="form.name" type="text" autocomplete="name" />
        <em v-if="submitted && formErrors.name" class="mw-form-error">{{ formErrors.name }}</em>
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
        <em v-if="submitted && (formErrors.emailId || formErrors.emailDomain)" class="mw-form-error">
          {{ formErrors.emailId || formErrors.emailDomain }}
        </em>
      </label>

      <label>
        <span>비밀번호</span>
        <input v-model="form.password" type="password" autocomplete="new-password" />
        <em v-if="submitted && formErrors.password" class="mw-form-error">{{ formErrors.password }}</em>
      </label>

      <label>
        <span>비밀번호 확인</span>
        <input v-model="form.passwordConfirm" type="password" autocomplete="new-password" />
        <em v-if="submitted && formErrors.passwordConfirm" class="mw-form-error">{{ formErrors.passwordConfirm }}</em>
      </label>

      <label>
        <span>주소지</span>
        <input v-model="form.address" type="text" autocomplete="street-address" />
        <em v-if="submitted && formErrors.address" class="mw-form-error">{{ formErrors.address }}</em>
      </label>

      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? "확인 중..." : "회원가입하기" }}
      </button>
    </form>
  </section>
</template>
