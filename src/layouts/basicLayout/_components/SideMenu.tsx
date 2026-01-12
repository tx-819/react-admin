import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu } from "antd";
import {
  getMenuItems,
  useRouteStore,
  findRoutePath,
  findMenuKeysByPath,
  findParentKeys,
} from "../../../routes";

const SideMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dynamicRoutes = useRouteStore((state) => state.routes);

  const menuKeys = useMemo(
    () => findMenuKeysByPath(dynamicRoutes, location.pathname),
    [location.pathname, dynamicRoutes]
  );
  const [openKeys, setOpenKeys] = useState<string[]>(menuKeys.openKeys);

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

