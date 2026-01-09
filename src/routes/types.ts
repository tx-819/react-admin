import type { ReactNode } from "react";
import type { RouteObject } from "react-router-dom";

// 扩展 RouteObject，添加菜单相关属性
export type RouteItem = RouteObject & {
  key?: string;
  label?: string;
  icon?: ReactNode;
  hidden?: boolean; // 是否在菜单中隐藏
  children?: RouteItem[]; // 子路由
};

