import type { ReactNode } from "react";
import type { ItemType, MenuItemType } from "antd/es/menu/interface";
import type { RouteItem } from "./types";
import { getRoutes } from "../../store/routeStore";

export const buildPath = (parentPath: string, path: string): string =>
  parentPath ? `${parentPath}/${path}` : `/${path || ""}`;

// 通用路由遍历函数
type TraverseCallback<T> = (
  route: RouteItem,
  currentPath: string,
  parentPath: string,
  parentKeys: string[]
) => T | null;

const traverseRoutes = <T>(
  routes: RouteItem[],
  callback: TraverseCallback<T>,
  parentPath = "",
  parentKeys: string[] = []
): T | null => {
  for (const route of routes) {
    const currentPath = buildPath(parentPath, route.path || "");
    const result = callback(route, currentPath, parentPath, parentKeys);
    if (result !== null) return result;

    if (route.children) {
      const childResult = traverseRoutes(
        route.children,
        callback,
        currentPath,
        [...parentKeys, route.key!].filter(Boolean)
      );
      if (childResult !== null) return childResult;
    }
  }
  return null;
};

// 面包屑专用遍历函数（需要收集路径上的所有路由）
const traverseRoutesWithBreadcrumbs = (
  routes: RouteItem[],
  targetPath: string,
  parentPath = "",
  breadcrumbs: Array<{ title: string; path: string }> = []
): Array<{ title: string; path: string }> | null => {
  for (const route of routes) {
    const currentPath = buildPath(parentPath, route.path || "");
    const currentBreadcrumb = { title: route.label || "", path: currentPath };

    if (currentPath === targetPath) {
      return [...breadcrumbs, currentBreadcrumb];
    }

    if (route.children) {
      const result = traverseRoutesWithBreadcrumbs(
        route.children,
        targetPath,
        currentPath,
        [...breadcrumbs, currentBreadcrumb]
      );
      if (result !== null) return result;
    }
  }
  return null;
};

export const findRoutePath = (
  routes: RouteItem[],
  targetKey: string
): string | null => {
  return traverseRoutes(routes, (route, currentPath) =>
    route.key === targetKey ? currentPath : null
  );
};

export const findMenuKeysByPath = (
  routes: RouteItem[],
  targetPath: string
): { selectedKey: string | null; openKeys: string[] } => {
  const result = traverseRoutes(routes, (route, currentPath, _, parentKeys) =>
    currentPath === targetPath
      ? { selectedKey: route.key!, openKeys: parentKeys }
      : null
  );
  return result || { selectedKey: null, openKeys: [] };
};

export const findParentKeys = (
  routes: RouteItem[],
  targetKey: string
): string[] | null => {
  return traverseRoutes(routes, (route, _, __, parentKeys) =>
    route.key === targetKey ? parentKeys : null
  );
};

export const getBreadcrumbItems = (
  routes: RouteItem[],
  targetPath: string
): Array<{ title: string; path: string }> | null => {
  return traverseRoutesWithBreadcrumbs(routes, targetPath);
};

// 查找路由的第一个可访问子路由路径（递归查找）
const findFirstAccessibleChild = (
  children: RouteItem[],
  parentPath: string
): string | null => {
  for (const child of children) {
    if (!child.hidden && child.key) {
      const childPath = buildPath(parentPath, child.path || "");
      // 如果这个子路由还有子路由，继续递归查找
      if (child.children && child.children.length > 0) {
        const nestedPath = findFirstAccessibleChild(child.children, childPath);
        if (nestedPath) return nestedPath;
      }
      // 返回第一个可访问的子路由路径
      return childPath;
    }
  }
  return null;
};

// 查找路由的第一个可访问子路由路径
export const getFirstChildPath = (
  routes: RouteItem[],
  targetPath: string,
  parentPath = ""
): string | null => {
  for (const route of routes) {
    const currentPath = buildPath(parentPath, route.path || "");
    if (currentPath === targetPath) {
      // 找到目标路由，检查是否有子路由
      if (route.children && route.children.length > 0) {
        return findFirstAccessibleChild(route.children, currentPath);
      }
      return null;
    }
    if (route.children) {
      const result = getFirstChildPath(route.children, targetPath, currentPath);
      if (result !== null) return result;
    }
  }
  return null;
};

// 菜单转换函数
const convertRoutesToMenuItems = (
  routes: RouteItem[]
): ItemType<MenuItemType>[] => {
  return routes
    .filter((r) => !r.hidden && r.key)
    .map((r) => ({
      key: r.key!,
      icon: r.icon as ReactNode,
      label: r.label,
      children: r.children ? convertRoutesToMenuItems(r.children) : undefined,
    }));
};

export const getMenuItems = (): ItemType<MenuItemType>[] =>
  convertRoutesToMenuItems(getRoutes());
