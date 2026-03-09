import { useEffect, useState } from "react";
import { getCurrentUser, getUserMenus } from "../api/auth";
import buildRoutes from "./buildRoutes";
import { createBrowserRouter } from "react-router-dom";
import { setMenuList } from "@/store/menuStore";
import { staticRoutes } from "./staticRoutes";
import { getIsLogin, setUser } from "@/store/userStore";

const useInitRouter = () => {
  const [router, setRouter] = useState<ReturnType<
    typeof createBrowserRouter
  > | null>(null);
  const [loading, setLoading] = useState(true);

  const initRouter = async () => {
    try {
      const isLogin = getIsLogin();
      if (!isLogin) {
        const routerInstance = createBrowserRouter(staticRoutes);
        setRouter(routerInstance);
        return;
      }
      // 刷新时拉取最新用户信息并写入 store
      const user = await getCurrentUser();
      setUser(user);
      // 获取当前用户有权限的菜单列表
      const userMenus = await getUserMenus();
      // 转换为路由格式
      setMenuList(userMenus);
      const routes = buildRoutes(userMenus);
      const routerInstance = createBrowserRouter(routes);
      setRouter(routerInstance);
    } catch {
      // todo 跳转到错误页,临时加下面两行逻辑方便调试
      const routerInstance = createBrowserRouter(staticRoutes);
      setRouter(routerInstance);
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
