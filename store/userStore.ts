import { create } from "zustand";
import type { UserInfo } from "../src/api/auth";

interface userStore {
  user: UserInfo | null;
  setUser: (user: UserInfo | null) => void;
  getUser: () => UserInfo | null;
}

export const useUserStore = create<userStore>((set, get) => ({
  user: null,
  setUser: (user: UserInfo | null) => {
    set({ user: user });
  },
  getUser: () => get().user,
}));

// 为了保持 API 兼容性，导出这些函数
// 它们内部使用 Zustand store
export const setUser = (user: UserInfo | null): void => {
  useUserStore.getState().setUser(user);
};

export const getUser = (): UserInfo | null => {
  return useUserStore.getState().getUser();
};

export const getAccessToken = (): string | undefined => {
  return useUserStore.getState().getUser()?.token;
};

export const getIsLogin = (): boolean => {
  const isLogin = useUserStore.getState().getUser()?.isLogin;
  return isLogin ? isLogin : false;
};

/**
 * 移除用户信息
 */
export const removeUserInfo = (): void => {
  setUser(null);
};

/**
 * 清除所有认证信息
 */
export const clearAuth = (): void => {
  removeUserInfo();
};