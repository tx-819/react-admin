/**
 * 统一的API请求封装
 */

import { getAccessToken, clearAuth } from "./storage";
import { message } from "antd";
import i18n from "./i18n";

// Base URL，可通过环境变量配置
// 开发环境：使用相对路径，通过 Vite 代理转发（解决跨域问题）
// 生产环境：使用完整的 API 地址
const BASE_URL = import.meta.env.PROD
  ? import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
  : "/api";

/**
 * 通用响应格式
 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 请求配置
 */
interface RequestConfig extends RequestInit {
  skipAuth?: boolean; // 是否跳过认证（用于登录等接口）
}

/**
 * 发起请求
 */
export const request = async <T>(
  url: string,
  config: RequestConfig = {}
): Promise<T> => {
  const { skipAuth = false, headers = {}, ...restConfig } = config;

  // 构建完整URL
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;

  // 构建请求头
  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  // 添加认证token
  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      (requestHeaders as Record<string, string>)[
        "Authorization"
      ] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(fullUrl, {
      ...restConfig,
      headers: requestHeaders,
    });

    // 解析响应
    const result: ApiResponse<T> = await response.json();

    // 处理HTTP状态码
    if (!response.ok) {
      // 401 未认证，清除本地token并跳转登录
      if (response.status === 401) {
        clearAuth();
        // 如果不在登录页，跳转到登录页
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
        message.error(i18n.t("error.loginExpired"));
        throw new Error(i18n.t("error.unauthorized"));
      }

      // 403 权限不足
      if (response.status === 403) {
        message.error(result.message || i18n.t("error.forbidden"));
        throw new Error(result.message || i18n.t("error.forbiddenShort"));
      }

      // 其他错误
      message.error(result.message || i18n.t("error.requestFailed"));
      throw new Error(
        result.message || `${i18n.t("error.requestFailed")}: ${response.status}`
      );
    }

    // 处理业务状态码
    if (result.code !== 200 && result.code !== 201) {
      message.error(result.message || i18n.t("error.operationFailed"));
      throw new Error(result.message || i18n.t("error.operationFailed"));
    }

    return result.data;
  } catch (error) {
    // 网络错误或其他错误
    if (error instanceof TypeError && error.message.includes("fetch")) {
      message.error(i18n.t("error.networkError"));
      throw new Error(i18n.t("error.networkErrorShort"));
    }
    throw error;
  }
};

/**
 * GET请求
 */
export const get = <T>(url: string, config?: RequestConfig): Promise<T> => {
  return request<T>(url, {
    ...config,
    method: "GET",
  });
};

/**
 * POST请求
 */
export const post = <T>(
  url: string,
  data?: unknown,
  config?: RequestConfig
): Promise<T> => {
  return request<T>(url, {
    ...config,
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * PUT请求
 */
export const put = <T>(
  url: string,
  data?: unknown,
  config?: RequestConfig
): Promise<T> => {
  return request<T>(url, {
    ...config,
    method: "PUT",
    body: JSON.stringify(data),
  });
};

/**
 * DELETE请求
 */
export const del = <T>(url: string, config?: RequestConfig): Promise<T> => {
  return request<T>(url, {
    ...config,
    method: "DELETE",
  });
};
