import { RouterProvider } from "react-router-dom";
import { useInitRouter } from "./routes";
import FullScreenLoading from "./components/FullScreenLoading";

function App() {
  const { router, loading } = useInitRouter();

  if (loading || !router) {
    return <FullScreenLoading />;
  }

  return <RouterProvider router={router} />;
}

export default App;
