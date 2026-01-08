import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Spin } from "antd";
import { fetchMenuData } from "./api/menu";
import { buildRoutes } from "./routes";

function App() {
  const [router, setRouter] = useState<ReturnType<
    typeof createBrowserRouter
  > | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initRouter = async () => {
      try {
        // 从后端获取菜单数据
        const menuData = await fetchMenuData();

        // 根据菜单数据生成路由
        const routes = buildRoutes(menuData);
        // 创建路由
        const routerInstance = createBrowserRouter(routes);
        setRouter(routerInstance);
      } catch (error) {
        console.error("Failed to load menu data:", error);
        // 可以设置一个默认路由或错误页面
      } finally {
        setLoading(false);
      }
    };

    initRouter();
  }, []);

  if (loading || !router) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export default App;
