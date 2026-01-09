import type { RouteItem } from "./types";

let dynamicRoutes: RouteItem[] = [];

export const setRoutes = (routes: RouteItem[]): void => {
  dynamicRoutes = routes;
};

export const getRoutes = (): RouteItem[] => dynamicRoutes;

