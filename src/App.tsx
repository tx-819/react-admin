import { RouterProvider } from "react-router-dom";
import { Spin } from "antd";
import { useInitRouter } from "./routes";

function App() {
  const { router, loading } = useInitRouter();

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
