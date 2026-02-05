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
const getRealPath = (relativePath: string): string => {
  const normalizedPath = relativePath.startsWith("/")
    ? relativePath.slice(1)
    : relativePath;
  return `../pages/${normalizedPath}/index.tsx`;
};

/**
 * 渲染组件
 * @param relativePath 相对路径
 * @returns 懒加载组件
 */
export default function renderComponent(
  relativePath: string
): LazyExoticComponent<ComponentType<unknown>> | null {
  const realPath = getRealPath(relativePath);
  const component = pageModules[realPath];

  if (!component) {
    if (import.meta.env.DEV) {
      const availablePaths = Object.keys(pageModules).map((path) =>
        path.replace("../pages/", "/").replace("/index.tsx", "")
      );
      console.warn(
        `Component not found for path: ${relativePath}.`,
        `Available paths: ${availablePaths.join(", ")}`
      );
    }
    return null;
  }

  return lazy(component);
}
