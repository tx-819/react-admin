import type { LazyExoticComponent, ComponentType } from "react";
import { lazy } from "react";

// 使用 import.meta.glob 自动扫描所有页面组件
// 这会自动创建一个映射表，键是文件路径，值是导入函数
const pageModules = import.meta.glob<{ default: ComponentType<unknown> }>(
  "../pages/**/index.tsx",
  { eager: false }
);

// 将路径转换为 glob 匹配的格式
// /dashboard -> ../pages/dashboard/index.tsx
// /system/users -> ../pages/system/users/index.tsx
const getModulePath = (pageKey: string): string => {
  const normalizedPath = pageKey.startsWith("/") ? pageKey.slice(1) : pageKey;
  return `../pages/${normalizedPath}/index.tsx`;
};

// 动态加载页面组件（返回懒加载组件）
export const loadPageComponent = (
  pageKey: string
): LazyExoticComponent<ComponentType<unknown>> | null => {
  const modulePath = getModulePath(pageKey);
  const loader = pageModules[modulePath];

  if (!loader) {
    if (import.meta.env.DEV) {
      const availablePaths = Object.keys(pageModules).map((path) =>
        path.replace("../pages/", "/").replace("/index.tsx", "")
      );
      console.warn(
        `Page component not found for key: ${pageKey}.`,
        `Available paths: ${availablePaths.join(", ")}`
      );
    }
    return null;
  }

  return lazy(loader);
};
