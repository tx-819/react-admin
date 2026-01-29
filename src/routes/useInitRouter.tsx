import { useEffect, useState } from "react";
import { getUserMenus } from "../api/auth";
import buildRoutes from "./buildRoutes";
import { createBrowserRouter } from "react-router-dom";
import { setMenuList } from "../../store/menuStore";
import { staticRoutes } from "./staticRoutes";

const useInitRouter = () => {
  const [router, setRouter] = useState<ReturnType<
    typeof createBrowserRouter
  > | null>(null);
  const [loading, setLoading] = useState(true);

  const initRouter = async () => {
    try {
      // 获取当前用户有权限的菜单列表
      const userMenus = await getUserMenus();
      // 转换为路由格式
      setMenuList(userMenus);
      const routes = buildRoutes(userMenus);
      const routerInstance = createBrowserRouter(routes);
      setRouter(routerInstance);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load user menus:", error);
      const routerInstance = createBrowserRouter(staticRoutes);
      setRouter(routerInstance);
      setLoading(false);
    }
  };

  useEffect(() => {
    initRouter();
  }, []);
  return { router, loading };
};

export default useInitRouter;
