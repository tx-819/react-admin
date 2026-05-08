import { getCurrentUser, getUserMenus } from "@/api/auth";
import { useEffect } from "react";
import { setUser, useUserStore } from "@/store/userStore";
import { setMenuList } from "@/store/menuStore";

async function fetchUserAndMenus() {
  const [user, userMenus] = await Promise.all([
    getCurrentUser(),
    getUserMenus(),
  ]);
  return { user, userMenus };
}

const useInitUser = () => {
  const isLogin = useUserStore((s) => s.isLogin);

  useEffect(() => {
    if (!isLogin) return;
    let cancelled = false;
    fetchUserAndMenus()
      .then(({ user, userMenus }) => {
        if (cancelled) return;
        setUser(user);
        setMenuList(userMenus);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
      });
    return () => {
      cancelled = true;
    };
  }, [isLogin]);
};

export default useInitUser;
