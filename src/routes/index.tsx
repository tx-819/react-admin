// 导出类型
export type { RouteItem } from "./types";

// 导出路由生成函数
export { buildRoutes } from "./routeGenerator";

// 导出路由存储函数
export { getRoutes, useRouteStore } from "../../store/routeStore";

// 导出工具函数
export {
  buildPath,
  findRoutePath,
  findMenuKeysByPath,
  findParentKeys,
  getBreadcrumbItems,
  getFirstChildPath,
  getMenuItems,
} from "./utils";
