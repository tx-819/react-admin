import { get, post, put, del } from "../utils/request";

// 权限类型
export type PermissionType = "menu" | "action";

export interface AppRouteRecord {
  id: string;
  name: string;
  children?: AppRouteRecord[];
  component?: string;
  path: string;
  /** 路由图标 */
  icon?: string;
  /** 是否在菜单中隐藏 */
  isHide?: boolean;
  /** 是否在标签页中隐藏 */
  isHideTab?: boolean;
  /** 是否缓存 */
  keepAlive?: boolean;
  /** 操作权限 */
  authList?: AuthType[];
}

export interface AuthType {
  title: string;
  authMark: string;
}

/**
 * 权限项接口（用于权限管理页面）
 */
export interface PermissionItem {
  id: string;
  path: string;
  name: string;
  code?: string;
  permissionType: PermissionType;
  component?: string;
  parentId?: string | null;
  icon?: string;
  orderNo?: number;
  status?: boolean;
  remark?: string;
  children?: PermissionItem[];
  key?: string; // 用于表格的 key
}

/**
 * 获取权限列表响应
 */
export interface GetPermissionListResponse {
  code: number;
  message: string;
  data: PermissionItem[];
}

/**
 * 获取权限列表
 * @returns 权限列表
 */
export const getPermissionListApi = async (): Promise<PermissionItem[]> => {
  return get<PermissionItem[]>("/permission");
};

/**
 * 创建权限请求参数
 */
export interface CreatePermissionParams {
  path: string;
  name: string;
  component?: string;
  parentId?: string | null;
  icon?: string;
  orderNo?: number;
  permissionType: PermissionType;
  code?: string;
  status: boolean;
  remark?: string;
}

/**
 * 创建权限响应
 */
export interface CreatePermissionResponse {
  id: string;
  path: string;
  name: string;
  component?: string;
  parentId: string | null;
  icon?: string;
  orderNo: number;
  status: boolean;
  remark?: string;
  createdAt: string;
  updatedAt: string;
  parent: PermissionItem | null;
  children: PermissionItem[];
}

/**
 * 创建权限
 * @param params 权限参数
 * @returns 创建的权限数据
 */
export const createPermissionApi = async (
  params: CreatePermissionParams,
): Promise<CreatePermissionResponse> => {
  return post<CreatePermissionResponse>("/permission", params);
};

/**
 * 更新权限请求参数
 */
export interface UpdatePermissionParams {
  path?: string;
  name?: string;
  component?: string;
  parentId?: string | null;
  code?: string;
  permissionType: PermissionType;
  icon?: string;
  orderNo?: number;
  status: boolean;
  remark?: string;
}

/**
 * 更新权限响应
 */
export interface UpdatePermissionResponse {
  id: string;
  path: string;
  name: string;
  component?: string;
  parentId: string | null;
  icon?: string;
  keepAlive: number;
  sort: number;
  status: number;
  remark?: string;
  createdAt: string;
  updatedAt: string;
  parent: PermissionItem | null;
  children: PermissionItem[];
  actions: Array<{
    id: string;
    menuId: string;
    title: string;
    authMark: string;
    sort: number;
  }>;
}

/**
 * 更新权限
 * @param id 权限 ID
 * @param params 权限参数
 * @returns 更新的权限数据
 */
export const updatePermissionApi = async (
  id: string,
  params: UpdatePermissionParams,
): Promise<UpdatePermissionResponse> => {
  return put<UpdatePermissionResponse>(`/permission/${id}`, params);
};

/**
 * 删除权限响应
 */
export interface DeletePermissionResponse {
  message: string;
}

/**
 * 删除权限
 * @param id 权限 ID
 * @returns 删除结果
 */
export const deletePermissionApi = async (
  id: string,
): Promise<DeletePermissionResponse> => {
  return del<DeletePermissionResponse>(`/permission/${id}`);
};
