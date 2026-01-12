import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import BasicLayout from "../layouts/BasicLayout";
import { loadPageComponent } from "../utils/pageLoader";
import { getIcon } from "../utils/iconMap";
import type { Permission } from "../api/permission";
import type { RouteItem } from "./types";
import { setRoutes } from "../../store/routeStore";
import { buildPath } from "./utils";

// 根据权限数据生成路由配置（支持嵌套）
const generateRoutesFromPermissions = (
  permissions: Permission[],
  parentPath = "",
  isRoot = true
): RouteItem[] => {
  return permissions
    .filter(
      (p) =>
        // 根级别只处理 route，子级别处理 route 和 menu（过滤掉 action）
        (isRoot ? p.type === "route" : p.type !== "action") &&
        p.disabled === 0 &&
        p.path !== null
    )
    .map((permission) => {
      const path =
        isRoot && permission.path?.startsWith("/")
          ? permission.path.slice(1)
          : permission.path || "";
      const currentPath = buildPath(parentPath, path);

      const route: RouteItem = {
        path,
        key: permission.id,
        label: permission.name,
        icon: permission.icon
          ? getIcon(permission.icon, { size: 16 })
          : undefined,
        hidden: permission.hidden === 1,
      };

      if (permission.component) {
        const Component = loadPageComponent(permission.component);
        if (Component) {
          route.element = (
            <Suspense fallback={<div>Loading...</div>}>
              <Component />
            </Suspense>
          );
        }
      }

      if (permission.children?.length) {
        const childRoutes = generateRoutesFromPermissions(
          permission.children,
          currentPath,
          false
        );
        if (childRoutes.length) {
          route.children = childRoutes;
          if (!route.element) route.element = <Outlet />;
        }
      }

      return route;
    });
};

// 生成完整路由结构
export const buildRoutes = (permissions: Permission[]): RouteItem[] => {
  const children = generateRoutesFromPermissions(permissions);
  setRoutes(children);
  return [{ path: "/", element: <BasicLayout />, children }];
};
