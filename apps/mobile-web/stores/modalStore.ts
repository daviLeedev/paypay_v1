import { defineStore } from "pinia";

export type ModalPanelType = "info" | "warning" | "danger" | "success";

export type ModalActionBehavior = "close" | "route";

export type ModalAction = {
  label: string;
  behavior: ModalActionBehavior;
  to?: string;
  variant?: "primary" | "secondary";
};

export type ModalPayload = {
  type?: ModalPanelType;
  title?: string;
  message: string;
  actions?: ModalAction[];
};

const defaultActions: ModalAction[] = [{ label: "닫기", behavior: "close", variant: "secondary" }];

export const useModalStore = defineStore("modal", {
  state: () => ({
    isOpen: false,
    type: "info" as ModalPanelType,
    title: "",
    message: "",
    actions: defaultActions
  }),

  actions: {
    show(payload: ModalPayload) {
      this.isOpen = true;
      this.type = payload.type ?? "info";
      this.title = payload.title ?? "";
      this.message = payload.message;
      this.actions = payload.actions?.length ? payload.actions : defaultActions;
    },

    close() {
      this.isOpen = false;
    }
  }
});
