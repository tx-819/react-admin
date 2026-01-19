/**
 * 认证相关API
 */

import { post } from "../utils/request";

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
 * 验证Token
 * @returns 用户信息
 */
export const verifyToken = async (): Promise<UserInfo> => {
  return post<UserInfo>("/auth/verify", {}, {
    skipAuth: true, // 验证接口不需要认证
  });
};

