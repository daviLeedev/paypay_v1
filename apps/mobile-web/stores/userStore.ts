import { defineStore } from "pinia";
import {
  clearStoredAuthTokens,
  getStoredAuthTokens,
  setStoredAuthTokens,
  type AuthTokenPayload
} from "~/api/request";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  address?: string;
  membershipGrade?: string;
  phone?: string;
};

const USER_PROFILE_STORAGE_KEY = "MW_USER_PROFILE";

const canUseStorage = () => import.meta.client && typeof localStorage !== "undefined";

const persistUserProfile = (user: UserProfile | null) => {
  if (!canUseStorage()) {
    return;
  }

  if (!user) {
    localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
    return;
  }

  localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(user));
};

const getStoredUserProfile = () => {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const profile = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    return profile ? JSON.parse(profile) as UserProfile : null;
  } catch {
    localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
    return null;
  }
};

export const useUserStore = defineStore("user", {
  state: () => ({
    accessToken: "",
    refreshToken: "",
    role: "",
    user: null as UserProfile | null,
    userId: ""
  }),

  getters: {
    isLoggedIn: (state) => Boolean(state.accessToken && state.refreshToken && state.user)
  },

  actions: {
    login(user: UserProfile) {
      this.user = user;
      persistUserProfile(user);
    },

    register(user: UserProfile) {
      this.login(user);
    },

    setSession(tokens: AuthTokenPayload, user: UserProfile) {
      this.accessToken = tokens.accessToken;
      this.refreshToken = tokens.refreshToken;
      this.role = tokens.role;
      this.userId = tokens.userId;
      this.user = user;

      setStoredAuthTokens(tokens);
      persistUserProfile(user);
    },

    restoreSession() {
      const tokens = getStoredAuthTokens();
      const user = getStoredUserProfile();

      this.accessToken = tokens.accessToken ?? "";
      this.refreshToken = tokens.refreshToken ?? "";
      this.role = tokens.role ?? "";
      this.userId = tokens.userId ?? "";
      this.user = user;
    },

    logout() {
      this.accessToken = "";
      this.refreshToken = "";
      this.role = "";
      this.user = null;
      this.userId = "";
      clearStoredAuthTokens();
      persistUserProfile(null);
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
