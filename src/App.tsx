import { RouterProvider } from "react-router-dom";
import { useInitRouter } from "./routes";
import FullScreenLoading from "./components/FullScreenLoading";
import AntdConfigProvider from "./components/AntdConfigProvider";

function App() {
  const { router, loading } = useInitRouter();

  if (loading || !router) {
    return <FullScreenLoading />;
  }

  return (
    <AntdConfigProvider>
      <RouterProvider router={router} />
    </AntdConfigProvider>
  );
}

export default App;
