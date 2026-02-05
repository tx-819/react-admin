import { create } from "zustand";
import type { AppRouteRecord } from "../src/api/menu";
import type { ItemType } from "antd/es/menu/interface";
import { getIcon } from "../src/utils/renderIcon";

// 菜单转换函数
const transformMenuItems = (routes: AppRouteRecord[]): ItemType[] => {
  return routes
    .filter((r) => !r.meta?.isHide)
    .map((r) => ({
      key: r.path,
      icon: r.meta?.icon ? getIcon(r.meta?.icon, { size: 16 }) : undefined,
      label: r.name,
      children: r.children ? transformMenuItems(r.children) : undefined,
    }));
};

interface MenuStore {
  menuList: ItemType[];
  setMenuList: (menuList: AppRouteRecord[]) => void;
  getMenuList: () => ItemType[];
}

export const useMenuStore = create<MenuStore>((set, get) => ({
  menuList: [],
  setMenuList: (menuList: AppRouteRecord[]) => {
    const menuItems = transformMenuItems(menuList);
    set({ menuList: menuItems });
  },
  getMenuList: () => get().menuList,
}));

// 为了保持 API 兼容性，导出这些函数
// 它们内部使用 Zustand store
export const setMenuList = (menuList: AppRouteRecord[]): void => {
  useMenuStore.getState().setMenuList(menuList);
};

export const getMenuList = (): ItemType[] => {
  return useMenuStore.getState().getMenuList();
};
