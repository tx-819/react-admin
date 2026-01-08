import type { ReactNode, ComponentType, CSSProperties } from "react";
import { createElement } from "react";
// 使用动态导入避免 tree-shaking 问题
import * as LucideIcons from "lucide-react";

// 图标配置接口
export interface IconProps {
  size?: number | string; // 图标大小，可以是数字（像素）或字符串（如 "1rem"）
  color?: string; // 图标颜色
  strokeWidth?: number; // 描边宽度
  className?: string; // 自定义类名
  style?: CSSProperties; // 自定义样式
}

// 创建一个图标映射缓存，避免每次都要查找
const iconCache = new Map<string, ComponentType>();

// 根据图标名称动态创建图标组件（仅支持 lucide-react）
export const getIcon = (
  iconName?: string,
  props?: IconProps
): ReactNode | undefined => {
  if (!iconName) return undefined;

  try {
    // 先从缓存中查找
    let IconComponent = iconCache.get(iconName);

    // 如果缓存中没有，从 lucide-react 中查找
    if (!IconComponent) {
      IconComponent = (LucideIcons as unknown as Record<string, ComponentType>)[
        iconName
      ];

      // 如果找到了，存入缓存
      if (IconComponent) {
        iconCache.set(iconName, IconComponent);
      }
    }

    // 检查组件是否存在且有效
    if (!IconComponent) {
      if (import.meta.env.DEV) {
        const lucideIcons = Object.keys(LucideIcons).filter(
          (key) =>
            typeof (LucideIcons as unknown as Record<string, unknown>)[key] ===
            "function"
        );
        console.warn(
          `Icon "${iconName}" not found in lucide-react.`,
          `Available lucide icons (first 20): ${lucideIcons
            .slice(0, 20)
            .join(", ")}`
        );
      }
      return undefined;
    }

    // 构建图标属性
    const iconProps: Record<string, unknown> = {};

    if (props?.size !== undefined) {
      iconProps.size = props.size;
    }

    if (props?.color !== undefined) {
      iconProps.color = props.color;
    }

    if (props?.strokeWidth !== undefined) {
      iconProps.strokeWidth = props.strokeWidth;
    }

    if (props?.className !== undefined) {
      iconProps.className = props.className;
    }

    if (props?.style !== undefined) {
      iconProps.style = props.style;
    }

    // lucide 图标使用 createElement 创建，并传递属性
    return createElement(IconComponent, iconProps);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`Error creating icon "${iconName}":`, error);
    }
    return undefined;
  }
};
