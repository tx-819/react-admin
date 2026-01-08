// 菜单项接口定义（根据后端返回的数据结构调整）
export interface MenuItem {
  key: string;
  path: string;
  label: string;
  icon?: string; // 图标名称，如 "DashboardOutlined"
  hidden?: boolean;
  children?: MenuItem[];
  component?: string; // 组件名称，如 "dashboard", "users"
}

// 获取菜单数据（从后端API）
export const fetchMenuData = async (): Promise<MenuItem[]> => {
  // TODO: 替换为实际的API调用
  // 示例：模拟API调用（包含嵌套路由示例）
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          key: "dashboard",
          path: "dashboard",
          label: "仪表盘",
          icon: "CircleGauge",
          component: "/dashboard",
        },
        {
          key: "system",
          path: "system",
          label: "系统管理",
          icon: "UserRound",
          children: [
            {
              key: "users",
              path: "users",
              label: "用户管理",
              icon: "UserRound",
              component: "/system/users",
            },
            {
              key: "roles",
              path: "roles",
              label: "角色管理",
              icon: "UserRoundCog",
              component: "/system/roles", 
            },
          ],
        },
      ]);
    }, 100);
  });
};

// 实际使用时，可以这样实现：
/*
export const fetchMenuData = async (): Promise<MenuItem[]> => {
  const response = await fetch('/api/menus');
  if (!response.ok) {
    throw new Error('Failed to fetch menu data');
  }
  return response.json();
};
*/
