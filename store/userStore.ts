import type { UserInfo } from "../src/api/auth";
import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';

interface userStore extends UserInfo {
  token?: string;
  isLogin: boolean;
  setUser: (user: UserInfo | null) => void;
}

const initialState = {
  id: '',
  username: '',
  nickname: '',
  avatar: '',
  isSuper: false,
  token: '',
  isLogin: false,
};

export const useUserStore = createStore<userStore>()(
  persist(
    (set) => ({
      ...initialState,
      setUser: (user: UserInfo | null) => {
        set({ ...user });
      },
    }),
    { name: 'user-storage' },
  ),
)

// 为了保持 API 兼容性，导出这些函数
// 它们内部使用 Zustand store
export const setUser = (user: UserInfo | null): void => {
  useUserStore.getState().setUser(user);
};

export const getUser = (): userStore | null => {
  return useUserStore.getState();
};

export const getAccessToken = (): string | undefined => {
  return useUserStore.getState().token;
};

export const setAccessToken = (token: string): void => {
  useUserStore.setState({ token, isLogin: true });
};

export const removeAccessToken = (): void => {
  useUserStore.setState({ token: '', isLogin: false });
};

export const getIsLogin = (): boolean => {
  return useUserStore.getState().isLogin;
};

/**
 * 清除所有认证信息
 */
export const clearAuth = (): void => {
  useUserStore.setState({ ...initialState });
};