import { useEffect } from "react";
import NProgress from "nprogress";

const NProgressFallback = () => {
  useEffect(() => {
    NProgress.start();
    return () => {
      NProgress.done();
    };
  }, []);

  return null;
};

export default NProgressFallback;
