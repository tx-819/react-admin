import { useEffect, useState } from "react";
import { getMenuList } from "../api/menu";
import buildRoutes from "./buildRoutes";
import { createBrowserRouter } from "react-router-dom";
import { setMenuList } from "../../store/menuStore";

const useInitRouter = () => {
  const [router, setRouter] = useState<ReturnType<
    typeof createBrowserRouter
  > | null>(null);
  const [loading, setLoading] = useState(true);

  const initRouter = async () => {
    try {
      // 获取权限树，获取 route 类型的顶级权限（子权限会递归包含）
      const menuList = await getMenuList();
      setMenuList(menuList);
      const routes = buildRoutes(menuList);
      const routerInstance = createBrowserRouter(routes);
      setRouter(routerInstance);
    } catch (error) {
      console.error("Failed to load permission tree:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initRouter();
  }, []);
  return { router, loading };
};

export default useInitRouter;
