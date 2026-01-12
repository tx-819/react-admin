import { create } from "zustand";
import type { RouteItem } from "../src/routes/types";

interface RouteStore {
  routes: RouteItem[];
  setRoutes: (routes: RouteItem[]) => void;
  getRoutes: () => RouteItem[];
}

export const useRouteStore = create<RouteStore>((set, get) => ({
  routes: [],
  setRoutes: (routes: RouteItem[]) => set({ routes }),
  getRoutes: () => get().routes,
}));

// 为了保持 API 兼容性，导出这些函数
// 它们内部使用 Zustand store
export const setRoutes = (routes: RouteItem[]): void => {
  useRouteStore.getState().setRoutes(routes);
};

export const getRoutes = (): RouteItem[] => {
  return useRouteStore.getState().getRoutes();
};
