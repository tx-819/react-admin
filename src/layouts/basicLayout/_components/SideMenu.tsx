import { useNavigate, useLocation } from "react-router-dom";
import { Menu } from "antd";
import { useMenuStore } from "@/store/menuStore";
import type { ItemType } from "antd/es/menu/interface";
import { useMemo, useState, useEffect } from "react";

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

// children 为 null 或空数组时不渲染为 submenu
const normalizeMenuItems = (items: ItemType[]): ItemType[] => {
  return items.map((item) => {
    if (!item || typeof item !== "object") return item;
    const next = { ...item };
    if ("children" in next) {
      if (next.children == null || (Array.isArray(next.children) && next.children.length === 0)) {
        delete next.children;
      } else if (Array.isArray(next.children)) {
        next.children = normalizeMenuItems(next.children);
      }
    }
    return next;
  });
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

// 根据路径查找菜单 key 和父级 keys
const findMenuKeysByPath = (
  menuList: ItemType[],
  targetPath: string,
  parentPath = "",
  parentKeys: string[] = []
): { selectedKey: string | null; openKeys: string[] } | null => {
  // 规范化路径
  const normalizePath = (path: string) => {
    const normalized = path.replace(/\/+$/, "");
    return normalized.startsWith("/") ? normalized : `/${normalized}`;
  };

  const normalizedTarget = normalizePath(targetPath);

  for (const item of menuList) {
    if (!item) continue;

    const itemKey = item.key?.toString() || "";
    const currentPath = parentPath
      ? `${parentPath}/${itemKey}`.replace(/\/+/g, "/")
      : `/${itemKey}`;
    const normalizedCurrent = normalizePath(currentPath);

    // 检查当前路径是否匹配目标路径
    if (normalizedCurrent === normalizedTarget) {
      return {
        selectedKey: itemKey,
        openKeys: parentKeys,
      };
    }

    // 如果有子项，递归查找
    if (hasChildren(item)) {
      const result = findMenuKeysByPath(
        item.children,
        targetPath,
        currentPath,
        [...parentKeys, itemKey].filter(Boolean)
      );
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

  // 根据路由路径计算选中的 key 和展开的 keys
  const menuKeys = useMemo(() => {
    const result = findMenuKeysByPath(menuList, location.pathname);
    return result || { selectedKey: null, openKeys: [] };
  }, [menuList, location.pathname]);

  // 计算合并后的 openKeys（路由需要的 + 用户手动展开的）
  const [openKeys, setOpenKeys] = useState<string[]>(menuKeys.openKeys);

  useEffect(() => {
    setOpenKeys(menuKeys.openKeys);
  }, [menuKeys.openKeys]);

  const handleMenuClick = ({ key }: { key: string }) => {
    const fullPath = getFullPath(menuList, key);
    if (fullPath) navigate(`/${fullPath}`);
  };

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  const normalizedItems = useMemo(
    () => normalizeMenuItems(menuList),
    [menuList]
  );

  return (
    <Menu
      theme="light"
      mode="inline"
      items={normalizedItems}
      selectedKeys={menuKeys.selectedKey ? [menuKeys.selectedKey] : []}
      openKeys={openKeys}
      onOpenChange={handleOpenChange}
      onClick={handleMenuClick}
    />
  );
};

export default SideMenu;
