import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Breadcrumb } from "antd";
import type { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import {
  useRouteStore,
  getBreadcrumbItems,
  getFirstChildPath,
} from "../../../routes";

const BreadcrumbNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dynamicRoutes = useRouteStore((state) => state.routes);

  const breadcrumbItems = useMemo(() => {
    const items = getBreadcrumbItems(dynamicRoutes, location.pathname);
    if (!items || items.length === 0) return [];
    return items.map((item, index) => {
      const isLast = index === items.length - 1;
      const breadcrumbItem: BreadcrumbItemType = {
        title: item.title,
      };

      // 如果不是最后一项，添加点击跳转功能
      if (!isLast && item.path) {
        breadcrumbItem.onClick = () => {
          // 检查该路径是否有子路由，如果有则跳转到第一个子页面
          const firstChildPath = getFirstChildPath(dynamicRoutes, item.path);
          const targetPath = firstChildPath || item.path;
          // 如果目标路径和当前路径相同，则不跳转
          if (targetPath !== location.pathname) {
            navigate(targetPath);
          }
        };
      }

      return breadcrumbItem;
    });
  }, [dynamicRoutes, location.pathname, navigate]);

  return <Breadcrumb items={breadcrumbItems} />;
};

export default BreadcrumbNav;
