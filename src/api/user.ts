import { get, post, put, del } from "../utils/request";

/**
 * 角色项接口（用于用户角色）
 */
export interface UserRole {
  id: string;
  name: string;
  code: string;
}

/**
 * 用户项接口
 */
export interface UserItem {
  id: string;
  username: string;
  nickname?: string;
  avatar?: string | null;
  status: number;
  isSuper: boolean;
  createdAt: string;
  updatedAt: string;
  roles: UserRole[];
}

/**
 * 获取用户列表请求参数
 */
export interface GetUserListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: number;
}

/**
 * 获取用户列表响应
 */
export interface GetUserListResponse {
  code: number;
  message: string;
  data: {
    list: UserItem[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * 获取用户列表
 * @param params 查询参数
 * @returns 用户列表数据
 */
export const getUserListApi = async (
  params?: GetUserListParams
): Promise<{ list: UserItem[]; pagination: GetUserListResponse["data"]["pagination"] }> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) {
    queryParams.append("page", String(params.page));
  }
  if (params?.pageSize) {
    queryParams.append("pageSize", String(params.pageSize));
  }
  if (params?.keyword) {
    queryParams.append("keyword", params.keyword);
  }
  if (params?.status !== undefined) {
    queryParams.append("status", String(params.status));
  }

  const url = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const response = await get<GetUserListResponse["data"]>(url);
  
  return response;
};

/**
 * 获取用户详情响应
 */
export interface GetUserDetailResponse {
  code: number;
  message: string;
  data: UserItem;
}

/**
 * 获取用户详情
 * @param id 用户 ID
 * @returns 用户详情数据
 */
export const getUserDetailApi = async (id: string): Promise<UserItem> => {
  return get<UserItem>(`/users/${id}`);
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
 * 创建用户响应
 */
export interface CreateUserResponse {
  id: string;
  username: string;
  nickname?: string;
  avatar?: string | null;
  status: number;
  isSuper: boolean;
  createdAt: string;
  updatedAt: string;
  roles: UserRole[];
}

/**
 * 创建用户
 * @param params 用户参数
 * @returns 创建的用户数据
 */
export const createUserApi = async (
  params: CreateUserParams
): Promise<CreateUserResponse> => {
  return post<CreateUserResponse>("/users", params);
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
 * 更新用户响应
 */
export interface UpdateUserResponse {
  id: string;
  username: string;
  nickname?: string;
  avatar?: string | null;
  status: number;
  isSuper: boolean;
  createdAt: string;
  updatedAt: string;
  roles: UserRole[];
}

/**
 * 更新用户
 * @param id 用户 ID
 * @param params 用户参数
 * @returns 更新的用户数据
 */
export const updateUserApi = async (
  id: string,
  params: UpdateUserParams
): Promise<UpdateUserResponse> => {
  return put<UpdateUserResponse>(`/users/${id}`, params);
};

/**
 * 删除用户响应
 */
export interface DeleteUserResponse {
  message: string;
}

/**
 * 删除用户
 * @param id 用户 ID
 * @returns 删除结果
 */
export const deleteUserApi = async (
  id: string
): Promise<DeleteUserResponse> => {
  return del<DeleteUserResponse>(`/users/${id}`);
};

/**
 * 获取所有角色列表（用于用户角色选择）
 */
export interface RoleOption {
  id: string;
  name: string;
  code: string;
}

/**
 * 获取所有角色列表（用于用户角色选择）
 * @returns 角色列表
 */
export const getAllRolesApi = async (): Promise<RoleOption[]> => {
  // 调用角色列表接口，获取所有角色（不分页）
  const response = await get<{
    list: Array<{
      id: string;
      name: string;
      code: string;
    }>;
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }>("/roles?page=1&pageSize=1000");
  
  return response.list.map((role) => ({
    id: role.id,
    name: role.name,
    code: role.code,
  }));
};

