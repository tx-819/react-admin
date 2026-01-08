import type { ReactNode, ComponentType } from "react";
import { createElement } from "react";
// 使用动态导入避免 tree-shaking 问题
import * as Icons from "@ant-design/icons";
import * as CustomIcons from "../components/icons";

// 创建一个图标映射缓存，避免每次都要查找
const iconCache = new Map<string, ComponentType>();

// 根据图标名称动态创建图标组件
// 优先从 @ant-design/icons 获取，如果找不到则从 components/icons 获取
export const getIcon = (iconName?: string): ReactNode | undefined => {
  if (!iconName) return undefined;

  try {
    // 先从缓存中查找
    let IconComponent = iconCache.get(iconName);

    // 如果缓存中没有，先从 @ant-design/icons 中查找
    if (!IconComponent) {
      IconComponent = (Icons as unknown as Record<string, ComponentType>)[
        iconName
      ];
    }

    // 如果 @ant-design/icons 中没有找到，从自定义图标中查找
    if (!IconComponent) {
      IconComponent = (CustomIcons as unknown as Record<string, ComponentType>)[
        iconName
      ];
    }

    // 如果找到了，存入缓存
    if (IconComponent) {
      iconCache.set(iconName, IconComponent);
    }

    // 检查组件是否存在且有效
    if (!IconComponent) {
      if (import.meta.env.DEV) {
        const antdIcons = Object.keys(Icons).filter(
          (key) =>
            typeof (Icons as unknown as Record<string, unknown>)[key] ===
              "function" ||
            typeof (Icons as unknown as Record<string, unknown>)[key] ===
              "object"
        );
        const customIcons = Object.keys(CustomIcons);
        console.warn(
          `Icon "${iconName}" not found in @ant-design/icons or custom icons.`,
          `Available antd icons (first 10): ${antdIcons
            .slice(0, 10)
            .join(", ")}`,
          `Available custom icons: ${customIcons.join(", ")}`
        );
      }
      return undefined;
    }

    // 图标组件可能是函数组件或类组件，都可以用 createElement
    // 直接使用 createElement 动态创建，不做预渲染
    return createElement(IconComponent);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`Error creating icon "${iconName}":`, error);
    }
    return undefined;
  }
};
