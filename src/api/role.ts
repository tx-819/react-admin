import { get, post, put, del } from "../utils/request";

/**
 * 角色项接口
 */
export interface RoleItem {
  id: string;
  name: string;
  code: string;
  remark?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 获取角色列表请求参数
 */
export interface GetRoleListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: number;
}

/**
 * 获取角色列表响应
 */
export interface GetRoleListResponse {
  code: number;
  message: string;
  data: {
    list: RoleItem[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * 获取角色列表
 * @param params 查询参数
 * @returns 角色列表数据
 */
export const getRoleListApi = async (
  params?: GetRoleListParams
): Promise<{ list: RoleItem[]; pagination: GetRoleListResponse["data"]["pagination"] }> => {
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

  const url = `/roles${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const response = await get<GetRoleListResponse["data"]>(url);
  
  return response;
};

/**
 * 创建角色请求参数
 */
export interface CreateRoleParams {
  name: string;
  code: string;
  remark?: string;
  status?: number;
}

/**
 * 创建角色响应
 */
export interface CreateRoleResponse {
  id: string;
  name: string;
  code: string;
  remark?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建角色
 * @param params 角色参数
 * @returns 创建的角色数据
 */
export const createRoleApi = async (
  params: CreateRoleParams
): Promise<CreateRoleResponse> => {
  return post<CreateRoleResponse>("/roles", params);
};

/**
 * 更新角色请求参数
 */
export interface UpdateRoleParams {
  name?: string;
  code?: string;
  remark?: string;
  status?: number;
}

/**
 * 更新角色响应
 */
export interface UpdateRoleResponse {
  id: string;
  name: string;
  code: string;
  remark?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 更新角色
 * @param id 角色 ID
 * @param params 角色参数
 * @returns 更新的角色数据
 */
export const updateRoleApi = async (
  id: string,
  params: UpdateRoleParams
): Promise<UpdateRoleResponse> => {
  return put<UpdateRoleResponse>(`/roles/${id}`, params);
};

/**
 * 删除角色响应
 */
export interface DeleteRoleResponse {
  message: string;
}

/**
 * 删除角色
 * @param id 角色 ID
 * @returns 删除结果
 */
export const deleteRoleApi = async (
  id: string
): Promise<DeleteRoleResponse> => {
  return del<DeleteRoleResponse>(`/roles/${id}`);
};

/**
 * 权限项接口
 */
export interface PermissionItem {
  id: number;
  code: string;
  name: string;
  type: "menu" | "page" | "action";
  remark?: string;
  status: number;
  children?: PermissionItem[];
}

/**
 * 获取所有权限响应
 */
export interface GetPermissionsResponse {
  code: number;
  message: string;
  data: PermissionItem[];
}

/**
 * 获取所有权限（树形结构）
 * @returns 权限树
 */
export const getPermissionsApi = async (): Promise<PermissionItem[]> => {
  return get<PermissionItem[]>("/permissions");
};

/**
 * 查询角色权限响应
 */
export interface GetRolePermissionsResponse {
  code: number;
  message: string;
  data: {
    role: {
      id: string;
      name: string;
      code: string;
    };
    permissions: Array<{
      id: number;
      code: string;
      name: string;
      type: "menu" | "page" | "action";
      remark?: string;
      status: number;
    }>;
  };
}

/**
 * 查询角色权限
 * @param id 角色 ID
 * @returns 角色权限数据
 */
export const getRolePermissionsApi = async (
  id: string
): Promise<GetRolePermissionsResponse["data"]> => {
  return get<GetRolePermissionsResponse["data"]>(`/roles/${id}/permissions`);
};

/**
 * 给角色添加权限请求参数
 */
export interface UpdateRolePermissionsParams {
  permissionIds: number[];
}

/**
 * 给角色添加权限响应
 */
export interface UpdateRolePermissionsResponse {
  id: string;
  name: string;
  code: string;
  remark?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  permissions: Array<{
    id: number;
    code: string;
    name: string;
    type: "menu" | "page" | "action";
  }>;
}

/**
 * 给角色添加权限
 * @param id 角色 ID
 * @param params 权限参数
 * @returns 更新后的角色数据
 */
export const updateRolePermissionsApi = async (
  id: string,
  params: UpdateRolePermissionsParams
): Promise<UpdateRolePermissionsResponse> => {
  return put<UpdateRolePermissionsResponse>(`/roles/${id}/permissions`, params);
};

