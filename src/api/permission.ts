// 权限类型
export type PermissionType = "menu" | "route" | "action";

// 权限接口定义（匹配后端返回的数据结构）
export interface Permission {
  id: string;
  name: string;
  code: string;
  type: PermissionType;
  path: string | null;
  parentId: string | null;
  component: string | null;
  icon: string | null;
  sort: number;
  hidden: number; // 0: 显示, 1: 隐藏
  disabled: number; // 0: 启用, 1: 禁用
  remark: string | null;
  createdAt: string;
  children: Permission[];
}

// 获取权限树
export interface GetPermissionTreeParams {
  type?: PermissionType;
  includeDisabled?: string; // "1" 表示包含禁用的权限
}

// 获取权限树 API 响应
export interface GetPermissionTreeResponse {
  code: number;
  message: string;
  data: Permission[];
}

// 获取权限树（从后端API）
export const getPermissionTree = async (
  params?: GetPermissionTreeParams
): Promise<Permission[]> => {
  // TODO: 替换为实际的API调用
  // 示例：模拟API调用
  // 实际使用时，params 会用于构建查询参数
  void params; // 避免未使用参数的警告
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "dashboard",
          name: "仪表盘",
          code: "dashboard",
          type: "route",
          path: "/dashboard",
          parentId: null,
          icon: "CircleGauge",
          sort: 1,
          hidden: 0,
          disabled: 0,
          remark: "仪表盘菜单",
          component: null,
          createdAt: "2024-01-01T00:00:00.000Z",
          children: [
            {
              id: "dashboard:console",
              name: "控制台",
              code: "dashboard:console",
              type: "menu",
              path: "console",
              parentId: "dashboard",
              component: "dashboard/console",
              icon: null,
              sort: 1,
              hidden: 0,
              disabled: 0,
              remark: null,
              createdAt: "2024-01-01T00:00:00.000Z",
              children: [],
            },
          ],
        },
        {
          id: "system",
          name: "系统管理",
          code: "system",
          type: "route",
          path: "/system",
          parentId: null,
          icon: "UserRound",
          sort: 2,
          hidden: 0,
          disabled: 0,
          remark: "系统管理菜单",
          component: null,
          createdAt: "2024-01-01T00:00:00.000Z",
          children: [
            {
              id: "system:users",
              name: "用户管理",
              code: "system:users",
              type: "menu",
              path: "users",
              parentId: "system",
              component: "system/users",
              icon: "UserRound",
              sort: 1,
              hidden: 0,
              disabled: 0,
              remark: null,
              createdAt: "2024-01-01T00:00:00.000Z",
              children: [],
            },
            {
              id: "system:roles",
              name: "角色管理",
              code: "system:roles",
              type: "menu",
              path: "roles",
              parentId: "system",
              component: "system/roles",
              icon: "UserRoundCog",
              sort: 2,
              hidden: 0,
              disabled: 0,
              remark: null,
              createdAt: "2024-01-01T00:00:00.000Z",
              children: [],
            },
            {
              id: "system:menu",
              name: "嵌套菜单",
              code: "system:menu",
              type: "route",
              path: "menu",
              parentId: "system",
              component: null,
              icon: "UserRound",
              sort: 3,
              hidden: 0,
              disabled: 0,
              remark: null,
              createdAt: "2024-01-01T00:00:00.000Z",
              children: [
                {
                  id: "system:menu:menu-1",
                  name: "菜单1",
                  code: "system:menu:menu-1",
                  type: "menu",
                  path: "menu-1",
                  parentId: "system:menu",
                  component: "system/menu/menu-1",
                  icon: null,
                  sort: 1,
                  hidden: 0,
                  disabled: 0,
                  remark: null,
                  createdAt: "2024-01-01T00:00:00.000Z",
                  children: [],
                },
              ],
            },
          ],
        },
      ]);
    }, 100);
  });

  // 实际使用时，可以这样实现：
  /*
  const queryParams = new URLSearchParams();
  if (params?.type) {
    queryParams.append('type', params.type);
  }
  if (params?.includeDisabled) {
    queryParams.append('includeDisabled', params.includeDisabled);
  }

  const response = await fetch(`/api/permissions/tree?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getAccessToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch permission tree');
  }

  const result: GetPermissionTreeResponse = await response.json();
  return result.data;
  */
};
