import { useLocation, useOutlet } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { useMenuStore } from "@/store/menuStore";
import { normalizeMenuPath } from "@/utils/menuPaths";
import Forbidden403 from "@/components/Forbidden403";

const MenuRouteGuard = () => {
  const outlet = useOutlet();
  const { pathname } = useLocation();
  const isLogin = useUserStore((s) => s.isLogin);
  const isSuper = useUserStore((s) => s.isSuper);
  const menuLoading = useMenuStore((s) => s.menuLoading);
  const allowedPathnames = useMenuStore((s) => s.allowedPathnames);

  if (!isLogin) {
    return outlet;
  }

  if (menuLoading) {
    return outlet;
  }

  if (isSuper) {
    return outlet;
  }

  const normalized = normalizeMenuPath(pathname);
  if (allowedPathnames.includes(normalized)) {
    return outlet;
  }

  return <Forbidden403 />;
};

export default MenuRouteGuard;
