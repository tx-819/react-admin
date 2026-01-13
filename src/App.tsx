import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Spin } from "antd";
import { getPermissionTree } from "./api/permission";
import { buildRoutes } from "./routes";

function App() {
  const [router, setRouter] = useState<ReturnType<
    typeof createBrowserRouter
  > | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initRouter = async () => {
      try {
        // 获取权限树，获取 route 类型的顶级权限（子权限会递归包含）
        const permissions = await getPermissionTree({ type: "route" });
        const routes = buildRoutes(permissions);
        console.log("routes", routes);
        const routerInstance = createBrowserRouter(routes);
        setRouter(routerInstance);
      } catch (error) {
        console.error("Failed to load permission tree:", error);
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
