import { useNavigate, useLocation } from "react-router-dom";
import { Menu } from "antd";
import { useMenuStore } from "../../../../store/menuStore";
import type { ItemType } from "antd/es/menu/interface";

const hasChildren = (
  item: ItemType
): item is ItemType & { children: ItemType[] } => {
  return (
    item !== null &&
    typeof item === "object" &&
    "children" in item &&
    Array.isArray(item.children) &&
    item.children.length > 0
  );
};

const getFullPath = (
  menuList: ItemType[],
  key: string,
  parentPath = ""
): string | null => {
  for (const item of menuList) {
    if (!item) continue;

    const itemKey = item.key?.toString() || "";
    const currentPath = parentPath ? `${parentPath}/${itemKey}` : itemKey;

    if (itemKey === key) {
      return currentPath;
    }

    if (hasChildren(item)) {
      const result = getFullPath(item.children, key, currentPath);
      if (result !== null) {
        return result;
      }
    }
  }
  return null;
};

const SideMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuList = useMenuStore((state) => state.menuList);
  const defaultOpenKeys = location.pathname.split("/").slice(1);
  const defaultSelectedKeys = [defaultOpenKeys.pop() || ""];

  const handleMenuClick = ({ key }: { key: string }) => {
    const fullPath = getFullPath(menuList, key);
    if (fullPath) navigate(`/${fullPath}`);
  };

  return (
    <Menu
      theme="light"
      mode="inline"
      items={menuList}
      defaultSelectedKeys={defaultSelectedKeys}
      defaultOpenKeys={defaultOpenKeys}
      onClick={handleMenuClick}
    />
  );
};

export default SideMenu;
