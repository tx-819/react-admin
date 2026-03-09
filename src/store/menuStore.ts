import { create } from "zustand";
import type { MenuRecord } from "@/api/permission";
import type { ItemType } from "antd/es/menu/interface";
import { getIcon } from "@/utils/renderIcon";

// 菜单转换函数
const transformMenuItems = (routes: MenuRecord[]): ItemType[] => {
  return routes.map((r) => ({
    key: r.path,
    icon: r.icon ? getIcon(r.icon, { size: 16 }) : undefined,
    label: r.name,
    children: r.children ? transformMenuItems(r.children) : undefined,
  }));
};

interface MenuStore {
  menuList: ItemType[];
  setMenuList: (menuList: MenuRecord[]) => void;
  getMenuList: () => ItemType[];
}

export const useMenuStore = create<MenuStore>((set, get) => ({
  menuList: [],
  setMenuList: (menuList: MenuRecord[]) => {
    const menuItems = transformMenuItems(menuList);
    set({ menuList: menuItems });
  },
  getMenuList: () => get().menuList,
}));

// 为了保持 API 兼容性，导出这些函数
// 它们内部使用 Zustand store
export const setMenuList = (menuList: MenuRecord[]): void => {
  useMenuStore.getState().setMenuList(menuList);
};

export const getMenuList = (): ItemType[] => {
  return useMenuStore.getState().getMenuList();
};
