import type { ReactNode } from "react";
import {
  DashboardOutlined,
  UserOutlined,
  // 可以继续添加更多图标
} from "@ant-design/icons";

// 图标名称到组件的映射
const iconMap: Record<string, ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  UserOutlined: <UserOutlined />,
  // 可以继续添加更多图标映射
};

// 根据图标名称获取图标组件
export const getIcon = (iconName?: string): ReactNode | undefined => {
  if (!iconName) return undefined;
  return iconMap[iconName];
};
