import { get, post, put, del } from "../utils/request";

// 权限类型
export type PermissionType = "menu" | "route" | "action";

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
 * 菜单项接口（用于菜单管理页面）
 */
export interface MenuItem {
  id: string;
  path: string;
  name: string;
  component?: string;
  parentId?: string | null;
  icon?: string;
  keepAlive?: boolean;
  sort?: number;
  status?: number;
  remark?: string;
  title?: string;
  authMark?: string;
  authList?: Array<{
    title: string;
    authMark: string;
  }>;

  children?: MenuItem[];
  key?: string; // 用于表格的 key
}

/**
 * 获取菜单列表响应
 */
export interface GetMenuListResponse {
  code: number;
  message: string;
  data: MenuItem[];
}

/**
 * 获取菜单列表
 * @returns 菜单列表
 */
export const getMenuListApi = async (): Promise<MenuItem[]> => {
  return get<MenuItem[]>("/menus");
};

/**
 * 创建菜单请求参数
 */
export interface CreateMenuParams {
  path: string;
  name: string;
  component?: string;
  parentId?: string | null;
  icon?: string;
  keepAlive?: boolean;
  orderNo?: number;
  status?: number;
  remark?: string;

  authList?: Array<{
    title: string;
    authMark: string;
  }>;

}

/**
 * 创建菜单响应
 */
export interface CreateMenuResponse {
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
  parent: MenuItem | null;
  children: MenuItem[];
  actions: Array<{
    id: string;
    menuId: string;
    title: string;
    authMark: string;
    sort: number;
  }>;
}

/**
 * 创建菜单
 * @param params 菜单参数
 * @returns 创建的菜单数据
 */
export const createMenuApi = async (
  params: CreateMenuParams
): Promise<CreateMenuResponse> => {
  return post<CreateMenuResponse>("/menus", params);
};

/**
 * 更新菜单请求参数
 */
export interface UpdateMenuParams {
  path?: string;
  name?: string;
  component?: string;
  parentId?: string | null;
  icon?: string;
  keepAlive?: boolean;
  sort?: number;
  status?: number;
  remark?: string;

  authList?: Array<{
    title: string;
    authMark: string;
  }>;

}

/**
 * 更新菜单响应
 */
export interface UpdateMenuResponse {
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
  parent: MenuItem | null;
  children: MenuItem[];
  actions: Array<{
    id: string;
    menuId: string;
    title: string;
    authMark: string;
    sort: number;
  }>;
}

/**
 * 更新菜单
 * @param id 菜单 ID
 * @param params 菜单参数
 * @returns 更新的菜单数据
 */
export const updateMenuApi = async (
  id: string,
  params: UpdateMenuParams
): Promise<UpdateMenuResponse> => {
  return put<UpdateMenuResponse>(`/menus/${id}`, params);
};

/**
 * 删除菜单响应
 */
export interface DeleteMenuResponse {
  message: string;
}

/**
 * 删除菜单
 * @param id 菜单 ID
 * @returns 删除结果
 */
export const deleteMenuApi = async (
  id: string
): Promise<DeleteMenuResponse> => {
  return del<DeleteMenuResponse>(`/menus/${id}`);
};
