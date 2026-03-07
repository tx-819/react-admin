import { Navigate } from "react-router";
import BasicLayout from "../layouts/basicLayout";
import Login from "../pages/login";
import Register from "../pages/register";
import NotFound from "../pages/not-found";
import type { RouteObject } from "react-router-dom";

/**
 * 静态路由配置
 * 这些路由不依赖于后端菜单数据，是固定的前端路由
 */
export const staticRoutes: RouteObject[] = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: <BasicLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/system/users" replace />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
];
