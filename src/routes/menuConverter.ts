import type { ReactNode } from "react";
import type { ItemType, MenuItemType } from "antd/es/menu/interface";
import type { RouteItem } from "./types";
import { getRoutes } from "./routeStore";

const convertRoutesToMenuItems = (
  routes: RouteItem[]
): ItemType<MenuItemType>[] => {
  return routes
    .filter((r) => !r.hidden && r.key)
    .map((r) => ({
      key: r.key!,
      icon: r.icon as ReactNode,
      label: r.label,
      children: r.children ? convertRoutesToMenuItems(r.children) : undefined,
    }));
};

export const getMenuItems = (): ItemType<MenuItemType>[] =>
  convertRoutesToMenuItems(getRoutes());
