import { useEffect, useState, useMemo } from "react";
import { getCurrentUser, getUserMenus } from "../api/auth";
import buildRoutes from "./buildRoutes";
import { createBrowserRouter } from "react-router-dom";
import { setMenuList, setMenuLoading } from "@/store/menuStore";
import { staticRoutes, skeletonRoutes } from "./staticRoutes";
import { getIsLogin, setUser } from "@/store/userStore";

const useInitRouter = () => {
  const isLogin = useMemo(() => getIsLogin(), []);

  // 未登录：同步创建静态路由，无 loading；已登录：同步创建骨架路由，无 loading
  const [router, setRouter] = useState(() => {
    const routes = isLogin ? skeletonRoutes : staticRoutes;
    return createBrowserRouter(routes);
  });

  useEffect(() => {
    if (!isLogin) return;

    const initRouter = async () => {
      try {
        setMenuLoading(true);
        const [user, userMenus] = await Promise.all([
          getCurrentUser(),
          getUserMenus(),
        ]);
        setUser(user);
        setMenuList(userMenus);
        const routes = buildRoutes(userMenus);
        setRouter(createBrowserRouter(routes));
      } catch {
        setRouter(createBrowserRouter(staticRoutes));
      }
    };

    initRouter();
  }, [isLogin]);

  return { router };
};

export default useInitRouter;
