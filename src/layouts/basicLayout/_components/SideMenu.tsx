import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu } from "antd";
import {
  getMenuItems,
  useRouteStore,
  findRoutePath,
  findMenuKeysByPath,
  findParentKeys,
} from "../../../routes";

interface SideMenuProps {
  collapsed?: boolean;
}

const SideMenu = ({ collapsed = false }: SideMenuProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dynamicRoutes = useRouteStore((state) => state.routes);
  const prevPathnameRef = useRef<string>(location.pathname);
  const prevCollapsedRef = useRef<boolean>(collapsed);

  const menuKeys = useMemo(
    () => findMenuKeysByPath(dynamicRoutes, location.pathname),
    [location.pathname, dynamicRoutes]
  );
  const [openKeys, setOpenKeys] = useState<string[]>(menuKeys.openKeys);

  // 当路径变化或菜单从折叠变为展开时，确保对应的 submenu 展开
  useEffect(() => {
    const pathChanged = prevPathnameRef.current !== location.pathname;
    const justExpanded = prevCollapsedRef.current && !collapsed; // 从折叠变为展开

    prevPathnameRef.current = location.pathname;
    prevCollapsedRef.current = collapsed;

    if ((pathChanged || justExpanded) && menuKeys.openKeys.length > 0) {
      setOpenKeys((prev) => {
        const merged = [...new Set([...prev, ...menuKeys.openKeys])];
        // 只有当合并后的结果不同时才更新，避免不必要的渲染
        if (
          merged.length !== prev.length ||
          !merged.every((key) => prev.includes(key))
        ) {
          return merged;
        }
        return prev;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, collapsed]);

  const handleMenuClick = ({ key }: { key: string }) => {
    const fullPath = findRoutePath(dynamicRoutes, key);
    if (fullPath) navigate(fullPath);
  };

  const handleOpenChange = (keys: string[]) => {
    const latestOpenKey = keys.find((key) => !openKeys.includes(key));
    if (latestOpenKey) {
      const parentKeys = findParentKeys(dynamicRoutes, latestOpenKey) || [];
      setOpenKeys([...new Set([...parentKeys, latestOpenKey])]);
    } else {
      setOpenKeys(keys);
    }
  };

  return (
    <Menu
      theme="light"
      mode="inline"
      items={getMenuItems()}
      selectedKeys={menuKeys.selectedKey ? [menuKeys.selectedKey] : []}
      openKeys={openKeys}
      onOpenChange={handleOpenChange}
      onClick={handleMenuClick}
    />
  );
};

export default SideMenu;
