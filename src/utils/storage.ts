/**
 * 本地存储工具
 */

const TOKEN_KEY = "access_token";
const USER_KEY = "user_info";
import type { UserInfo } from "../api/auth";

/**
 * 获取访问令牌
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * 设置访问令牌
 */
export const setAccessToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * 移除访问令牌
 */
export const removeAccessToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * 获取用户信息
 */
export const getUserInfo = (): UserInfo | null => {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * 设置用户信息
 */
export const setUserInfo = (user: UserInfo): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * 移除用户信息
 */
export const removeUserInfo = (): void => {
  localStorage.removeItem(USER_KEY);
};

/**
 * 清除所有认证信息
 */
export const clearAuth = (): void => {
  removeAccessToken();
  removeUserInfo();
};

const LANGUAGE_KEY = "app_language";

/**
 * 获取语言
 */
export const getLanguage = (): string | null => {
  return localStorage.getItem(LANGUAGE_KEY);
};

/**
 * 设置语言
 */
export const setLanguage = (language: string): void => {
  localStorage.setItem(LANGUAGE_KEY, language);
};
