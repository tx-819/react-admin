import type { RouteItem } from "./types";

export const buildPath = (parentPath: string, path: string): string =>
  parentPath ? `${parentPath}/${path}` : `/${path || ""}`;

export const findRoutePath = (
  routes: RouteItem[],
  targetKey: string,
  parentPath = ""
): string | null => {
  for (const route of routes) {
    const currentPath = buildPath(parentPath, route.path || "");
    if (route.key === targetKey) return currentPath;
    if (route.children) {
      const found = findRoutePath(route.children, targetKey, currentPath);
      if (found) return found;
    }
  }
  return null;
};

export const findMenuKeysByPath = (
  routes: RouteItem[],
  targetPath: string,
  parentPath = "",
  parentKeys: string[] = []
): { selectedKey: string | null; openKeys: string[] } => {
  for (const route of routes) {
    const currentPath = buildPath(parentPath, route.path || "");
    if (currentPath === targetPath) {
      return { selectedKey: route.key!, openKeys: parentKeys };
    }
    if (route.children) {
      const result = findMenuKeysByPath(
        route.children,
        targetPath,
        currentPath,
        [...parentKeys, route.key!]
      );
      if (result.selectedKey) return result;
    }
  }
  return { selectedKey: null, openKeys: [] };
};

export const findParentKeys = (
  routes: RouteItem[],
  targetKey: string,
  parentKeys: string[] = []
): string[] | null => {
  for (const route of routes) {
    if (route.key === targetKey) return parentKeys;
    if (route.children) {
      const result = findParentKeys(route.children, targetKey, [
        ...parentKeys,
        route.key!,
      ]);
      if (result !== null) return result;
    }
  }
  return null;
};
