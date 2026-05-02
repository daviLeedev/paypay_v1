import { apiPost, type AuthTokenPayload } from "./request";
import { PATH } from "./path";

export type SignupUserRequest = {
  email: string;
  name: string;
  password: string;
};

export type SignupUserResponse = {
  email?: string;
  id?: string;
  membershipGrade?: string;
  name?: string;
  role?: string;
  userId?: string;
};

export type LoginUserRequest = {
  email: string;
  password: string;
};

export type LoginUserResponse = AuthTokenPayload;

export const USER_API = {
  signup(payload: SignupUserRequest) {
    return apiPost<SignupUserResponse, SignupUserRequest>(PATH.USER.SIGNUP, payload, {
      skipAuth: true
    });
  },

  login(payload: LoginUserRequest) {
    return apiPost<LoginUserResponse, LoginUserRequest>(PATH.USER.LOGIN, payload, {
      skipAuth: true
    });
  }
} as const;
