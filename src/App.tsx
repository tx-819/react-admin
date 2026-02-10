import { RouterProvider } from "react-router-dom";
import { useInitRouter } from "./routes";
import FullScreenLoading from "./components/FullScreenLoading";
import AntdConfigProvider from "./components/AntdConfigProvider";
import QueryClientProvider from "./components/QueryClientProvider";

function App() {
  const { router, loading } = useInitRouter();

  if (loading || !router) {
    return <FullScreenLoading />;
  }

  return (
    <QueryClientProvider>
      <AntdConfigProvider>
        <RouterProvider router={router} />
      </AntdConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
