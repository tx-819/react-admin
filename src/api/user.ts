import { get, post, put, del } from "../utils/request";
import type { Role } from "./role";

/**
 * 角色项接口（用于用户角色）
 */
export interface User {
  id: string;
  username: string;
  email: string;
  nickname?: string;
  avatar?: string | null;
  status: number;
  isSuper: boolean;
  createdAt: string;
  updatedAt: string;
  roles: Role[];
}

/**
 * 获取用户列表请求参数
 */
export interface GetUserListParams {
  page?: number;
  pageSize?: number;
  username?: string;
  nickname?: string;
}

/**
 * 获取用户列表
 * @param params 查询参数
 * @returns 用户列表数据
 */
export const getUserListApi = async (
  params?: GetUserListParams,
): Promise<{
  data: User[];
  total: number;
  success: boolean;
}> => {
  try {
    const response = await get<{
      list: User[];
      total: number;
    }>("/user", {
      params,
    });
    return {
      data: response.list,
      total: response.total,
      success: true,
    };
  } catch {
    return {
      data: [],
      total: 0,
      success: false,
    };
  }
};

/**
 * 创建用户请求参数
 */
export interface CreateUserParams {
  username: string;
  password: string;
  nickname?: string;
  avatar?: string;
  status?: number;
  isSuper?: boolean;
  roleIds?: string[];
}

/**
 * 创建用户
 * @param params 用户参数
 * @returns 创建的用户数据
 */
export const createUserApi = async (params: CreateUserParams) => {
  return post("/user", params);
};

/**
 * 更新用户请求参数
 */
export interface UpdateUserParams {
  username?: string;
  password?: string;
  nickname?: string;
  avatar?: string;
  status?: number;
  isSuper?: boolean;
  roleIds?: string[];
}

/**
 * 更新用户
 * @param id 用户 ID
 * @param params 用户参数
 * @returns 更新的用户数据
 */
export const updateUserApi = async (id: string, params: UpdateUserParams) => {
  return put(`/user/${id}`, params);
};

/**
 * 删除用户
 * @param id 用户 ID
 * @returns 删除结果
 */
export const deleteUserApi = async (id: string) => {
  return del(`/user/${id}`);
};

/**
 * 获取所有角色列表（用于用户角色选择）
 */
export const getAllRolesApi = async (): Promise<Role[]> => {
  // 调用角色列表接口，获取所有角色（不分页）
  const response = await get<{
    list: Role[];
  }>("/role?page=1&pageSize=1000");

  return response.list;
};
