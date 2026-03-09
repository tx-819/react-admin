/**
 * 认证相关API
 */

import { post, get } from "../utils/request";
import type { MenuRecord } from "./permission";
/**
 * 用户信息
 */
export interface UserInfo {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
  isSuper: boolean;
}

/**
 * 登录请求参数
 */
export interface LoginParams {
  username: string;
  password: string;
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  user: UserInfo;
}

/**
 * 用户登录
 * @param params 登录参数
 * @returns 登录响应数据
 */
export const login = async (params: LoginParams): Promise<LoginResponse> => {
  return post<LoginResponse>("/auth/login", params, {
    skipAuth: true, // 登录接口不需要认证
  });
};

/**
 * 注册请求参数
 */
export interface RegisterParams {
  username: string;
  password: string;
  nickname?: string;
  avatar?: string;
}

/**
 * 注册响应数据中的用户信息
 */
export interface RegisterUserInfo {
  id: string;
  username: string;
  nickname: string;
  avatar: string | null;
  status: number;
  isSuper: boolean;
  createdAt: string;
}

/**
 * 注册响应数据
 */
export interface RegisterResponse {
  user: RegisterUserInfo;
}

/**
 * 用户注册
 * @param params 注册参数
 * @returns 注册响应数据
 */
export const register = async (
  params: RegisterParams,
): Promise<RegisterResponse> => {
  return post<RegisterResponse>("/auth/register", params, {
    skipAuth: true, // 注册接口不需要认证
  });
};

/**
 * 验证Token
 * @returns 用户信息
 */
export const verifyToken = async (): Promise<UserInfo> => {
  return post<UserInfo>(
    "/auth/verify",
    {},
    {
      skipAuth: true, // 验证接口不需要认证
    },
  );
};

/**
 * 获取当前用户有权限的菜单列表
 * @returns 用户菜单列表（树形结构）
 */
export const getUserMenus = async (): Promise<MenuRecord[]> => {
  return get<MenuRecord[]>("/auth/menus");
};

/* ==================== 邮箱链接登录 ==================== */

/**
 * 发送登录链接到邮箱
 * @param email 用户邮箱
 */
export const sendLoginLink = async (
  email: string,
): Promise<{ success: boolean }> => {
  return post<{ success: boolean }>(
    "/auth/sendLoginEmail",
    { email },
    { skipAuth: true },
  );
};

/**
 * 验证邮箱链接 Token 并登录
 * @param token 邮件中的链接 token（URL 参数）
 * @returns 与密码登录相同的登录响应
 */
export const verifyLoginLink = async (
  token: string,
): Promise<LoginResponse> => {
  return post<LoginResponse>(
    "/auth/magic-link/verify",
    { token },
    { skipAuth: true },
  );
};
