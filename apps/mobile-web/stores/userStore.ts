import { defineStore } from "pinia";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  address?: string;
  membershipGrade?: string;
  phone?: string;
};

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null as UserProfile | null
  }),

  getters: {
    isLoggedIn: (state) => Boolean(state.user)
  },

  actions: {
    login(user: UserProfile) {
      this.user = user;
    },

    register(user: UserProfile) {
      this.user = user;
    },

    logout() {
      this.user = null;
    },

    loginAsDemoUser() {
      this.login({
        id: "demo-user",
        name: "YUMI Guest",
        email: "guest@yumishop.test",
        membershipGrade: "일반회원"
      });
    }
  }
});
