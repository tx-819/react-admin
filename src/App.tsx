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
        const menuData = await fetchMenuData();
        const routes = buildRoutes(menuData);
        const routerInstance = createBrowserRouter(routes);
        setRouter(routerInstance);
      } catch (error) {
        console.error("Failed to load menu data:", error);
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
