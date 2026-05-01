<script setup lang="ts">
import { computed } from "vue";
import { useModalStore, type ModalAction } from "~/stores/modalStore";

const modalStore = useModalStore();

const panelTitle = computed(() => {
  if (modalStore.title) {
    return modalStore.title;
  }

  const fallbackTitles = {
    info: "알림",
    warning: "확인해주세요",
    danger: "주의",
    success: "완료"
  };

  return fallbackTitles[modalStore.type];
});

const handleAction = async (action: ModalAction) => {
  if (action.behavior === "route" && action.to) {
    modalStore.close();
    await navigateTo(action.to);
    return;
  }

  modalStore.close();
};
</script>

<template>
  <Teleport to="body">
    <div v-if="modalStore.isOpen" class="mw-modal-root" role="presentation">
      <button class="mw-modal-backdrop" type="button" aria-label="모달 닫기" @click="modalStore.close" />
      <section
        class="mw-alert-modal"
        :class="`mw-alert-modal--${modalStore.type}`"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mw-alert-modal-title"
      >
        <div class="mw-alert-modal__mark" aria-hidden="true" />
        <div class="mw-alert-modal__content">
          <h2 id="mw-alert-modal-title">{{ panelTitle }}</h2>
          <p>{{ modalStore.message }}</p>
        </div>
        <div class="mw-alert-modal__actions">
          <button
            v-for="action in modalStore.actions"
            :key="`${action.behavior}-${action.label}-${action.to ?? 'none'}`"
            type="button"
            class="mw-alert-modal__button"
            :class="`mw-alert-modal__button--${action.variant ?? 'primary'}`"
            @click="handleAction(action)"
          >
            {{ action.label }}
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>
