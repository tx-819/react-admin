import type { LazyExoticComponent, ComponentType } from "react";
import { lazy } from "react";

// 页面组件映射表：根据路径或key映射到组件文件
const pageMap: Record<string, () => Promise<{ default: ComponentType<any> }>> =
  {
    dashboard: () => import("../pages/Dashboard"),
    users: () => import("../pages/Users"),
    // 可以继续添加更多页面映射
  };

// 动态加载页面组件（返回懒加载组件）
export const loadPageComponent = (
  pageKey: string
): LazyExoticComponent<ComponentType<any>> | null => {
  const loader = pageMap[pageKey];
  if (!loader) {
    console.warn(`Page component not found for key: ${pageKey}`);
    return null;
  }
  return lazy(loader);
};

// 获取所有可用的页面key
export const getAvailablePageKeys = (): string[] => {
  return Object.keys(pageMap);
};
