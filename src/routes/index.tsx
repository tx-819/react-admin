import type { ReactNode } from "react";
import type { RouteObject } from "react-router-dom";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import BasicLayout from "../layouts/BasicLayout";
import { loadPageComponent } from "../utils/pageLoader";
import { getIcon } from "../utils/iconMap";
import type { MenuItem } from "../api/menu";
import type { ItemType, MenuItemType } from "antd/es/menu/interface";

// 扩展 RouteObject，添加菜单相关属性
export type RouteItem = RouteObject & {
  key?: string;
  label?: string;
  icon?: ReactNode;
  hidden?: boolean; // 是否在菜单中隐藏
  children?: RouteItem[]; // 子路由
};

// 存储动态生成的路由（从后端菜单数据生成）
let dynamicRoutes: RouteItem[] = [];

// 根据菜单数据生成路由配置（支持嵌套）
export const generateRoutesFromMenu = (
  menuData: MenuItem[],
  parentPath: string = ""
): RouteItem[] => {
  const children: RouteItem[] = menuData.map((menu) => {
    // 构建完整路径（支持嵌套）
    const fullPath = parentPath ? `${parentPath}/${menu.path}` : menu.path;

    const route: RouteItem = {
      path: menu.path, // 相对路径，用于路由嵌套
      key: menu.key,
      label: menu.label,
      icon: getIcon(menu.icon, { size: 16 }),
      hidden: menu.hidden,
    };

    // 如果有组件名称，动态加载组件
    if (menu.component) {
      const Component = loadPageComponent(menu.component);
      if (Component) {
        route.element = (
          <Suspense fallback={<div>Loading...</div>}>
            <Component />
          </Suspense>
        );
      }
    }

    // 递归处理子菜单（传递当前路径作为父路径）
    if (menu.children && menu.children.length > 0) {
      route.children = generateRoutesFromMenu(menu.children, fullPath);

      // 如果父路由有子路由但没有 component，使用 Outlet 渲染子路由
      if (!menu.component && route.children.length > 0) {
        route.element = <Outlet />;
      }
    }

    return route;
  });

  return children;
};

// 生成完整路由结构
export const buildRoutes = (menuData: MenuItem[]): RouteItem[] => {
  const children = generateRoutesFromMenu(menuData);

  const routes: RouteItem[] = [
    {
      path: "/",
      element: <BasicLayout />,
      children,
    },
  ];

  dynamicRoutes = children;
  return routes;
};

// 获取当前路由配置
export const getRoutes = (): RouteItem[] => {
  return dynamicRoutes;
};

// 将路由转换为菜单项（支持嵌套结构）
const convertRoutesToMenuItems = (
  routes: RouteItem[]
): ItemType<MenuItemType>[] => {
  return routes
    .filter((route) => !route.hidden && route.key)
    .map((route) => {
      const menuItem: ItemType<MenuItemType> = {
        key: route.key!,
        icon: route.icon as ReactNode,
        label: route.label,
        children: route.children
          ? convertRoutesToMenuItems(route.children)
          : undefined,
      };
      return menuItem;
    });
};

// 获取菜单项（支持嵌套结构）
export const getMenuItems = () => {
  return convertRoutesToMenuItems(dynamicRoutes);
};
