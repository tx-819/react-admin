import { Suspense } from "react";
import { Outlet } from "react-router";
import renderComponent from "../utils/renderComponent";
import NProgressFallback from "../components/NProgressFallback";
import { staticRoutes } from "./staticRoutes";
import type { MenuRecord } from "../api/permission";
import type { RouteObject } from "react-router-dom";

// 将菜单数据转换为路由配置
const transformRoutes = (menuList: MenuRecord[]): RouteObject[] => {
  return menuList.map((menu: MenuRecord): RouteObject => {
    const routeItem: RouteObject = {
      path: menu.path,
      loader: () => {
        return {
          authList: menu.authList,
        };
      },
    };
    // 如果有 component，加载对应的页面组件
    if (menu.component) {
      // component 路径可能包含 / 前缀，需要处理
      const componentPath = menu.component.startsWith("/")
        ? menu.component.slice(1)
        : menu.component;
      const Component = renderComponent(componentPath);
      if (Component) {
        routeItem.element = (
          <Suspense fallback={<NProgressFallback />}>
            <Component />
          </Suspense>
        );
      }
    }
    // 如果有子路由，递归处理
    if (menu.children?.length) {
      const childRoutes = transformRoutes(menu.children);
      if (childRoutes.length) {
        routeItem.children = childRoutes;
        // 如果当前路由没有 element 但有子路由，需要添加 Outlet
        if (!routeItem.element) routeItem.element = <Outlet />;
      }
    }
    return routeItem;
  });
};

// 生成完整路由结构
export default function buildRoutes(menuList: MenuRecord[]): RouteObject[] {
  const children = transformRoutes(menuList);

  // 将动态路由添加到 BasicLayout 的 children 中，末尾添加 404 兜底
  const routes = staticRoutes.map((route) => {
    if (route.path === "/" && route.children) {
      return {
        ...route,
        children: [...route.children, ...children],
      };
    }
    return route;
  });

  return routes as RouteObject[];
}
