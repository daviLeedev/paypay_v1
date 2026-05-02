<script setup lang="ts">
import { computed } from "vue";
import { useUserStore } from "~/stores/userStore";

const route = useRoute();
const userStore = useUserStore();

const loginTo = computed(() => ({
  path: "/login",
  query: { redirect: route.fullPath }
}));

const profileRows = computed(() => [
  { label: "이름", value: userStore.user?.name ?? "-" },
  { label: "이메일", value: userStore.user?.email ?? "-" },
  { label: "주소", value: userStore.user?.address ?? "등록된 주소가 없습니다." },
  { label: "멤버등급", value: userStore.user?.membershipGrade ?? "일반회원" }
]);

const menuItems = [
  { label: "주문조회", to: "/mypage/orders" },
  { label: "취소-환불 조회", to: "/mypage/refunds" },
  { label: "쿠폰관리", to: "/mypage/coupons" }
];
</script>

<template>
  <section class="mw-mypage-page">
    <MobileSectionHeader title="My Page" description="내 쇼핑 정보와 혜택을 확인하세요." />

    <div v-if="userStore.isLoggedIn" class="mw-profile-card">
      <div class="mw-profile-card__header">
        <div class="mw-profile-card__avatar" aria-hidden="true">
          {{ userStore.user?.name?.slice(0, 1) ?? "Y" }}
        </div>
        <div>
          <p>{{ userStore.user?.membershipGrade ?? "일반회원" }}</p>
          <h2>{{ userStore.user?.name }}님</h2>
        </div>
      </div>

      <dl class="mw-profile-list">
        <div v-for="row in profileRows" :key="row.label" class="mw-profile-list__row">
          <dt>{{ row.label }}</dt>
          <dd>{{ row.value }}</dd>
        </div>
      </dl>
    </div>

    <div v-else class="mw-empty-panel">
      <h2>로그인이 필요합니다</h2>
      <p>마이페이지는 로그인 이후 이용할 수 있어요.</p>
      <NuxtLink class="mw-mypage-menu__button" :to="loginTo">로그인하기</NuxtLink>
    </div>

    <nav v-if="userStore.isLoggedIn" class="mw-mypage-menu" aria-label="마이페이지 메뉴">
      <NuxtLink
        v-for="item in menuItems"
        :key="item.to"
        class="mw-mypage-menu__button"
        :to="{ path: item.to, query: route.query }"
      >
        <span>{{ item.label }}</span>
        <strong aria-hidden="true">›</strong>
      </NuxtLink>
    </nav>
  </section>
</template>
