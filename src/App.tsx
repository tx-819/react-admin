import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { RouterProvider } from "react-router-dom";
import { useInitRouter } from "./routes";
import FullScreenLoading from "./components/FullScreenLoading";

function App() {
  const { router, loading } = useInitRouter();

  if (loading || !router) {
    return <FullScreenLoading />;
  }

  return (
    <ConfigProvider locale={zhCN}>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default App;
