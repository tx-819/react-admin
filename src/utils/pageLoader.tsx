import type { LazyExoticComponent, ComponentType } from "react";
import { lazy } from "react";

// 动态加载页面组件（返回懒加载组件）
export const loadPageComponent = (
  pageKey: string
): LazyExoticComponent<ComponentType<unknown>> | null => {
  const loader = () => import(`../pages${pageKey}`);
  if (!loader) {
    console.warn(`Page component not found for key: ${pageKey}`);
    return null;
  }
  return lazy(loader);
};
