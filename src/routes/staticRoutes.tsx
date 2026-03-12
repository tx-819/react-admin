import { Navigate } from "react-router";
import BasicLayout from "../layouts/basicLayout";
import Login from "../pages/login";
import LoginSuccess from "../pages/login-success";
import Register from "../pages/register";
import NotFound from "../pages/not-found";
import LayoutSkeleton from "../components/LayoutSkeleton";
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
    path: "/login-success",
    element: <LoginSuccess />,
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
        element: <Navigate to="/dashboard/console" replace />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
];

/**
 * 已登录用户的首屏骨架路由
 * 在菜单数据加载完成前展示布局骨架，提升 FCP/LCP
 */
export const skeletonRoutes: RouteObject[] = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/login-success",
    element: <LoginSuccess />,
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
        element: <LayoutSkeleton />,
      },
      {
        path: "*",
        element: <LayoutSkeleton />,
      },
    ],
  },
];
