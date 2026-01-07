import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, theme } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import {
  getAllChildRoutes,
  getMenuItems,
  getRoutes,
  type RouteItem,
} from "../routes";

const { Header, Sider, Content } = Layout;

const BasicLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 获取动态路由
  const dynamicRoutes = getRoutes();

  // 递归查找路由的完整路径
  const findRoutePath = (
    routes: RouteItem[],
    targetKey: string,
    parentPath: string = ""
  ): string | null => {
    for (const route of routes) {
      const currentPath = parentPath
        ? `${parentPath}/${route.path}`
        : `/${route.path || ""}`;

      if (route.key === targetKey) {
        return currentPath;
      }

      if (route.children) {
        const found = findRoutePath(route.children, targetKey, currentPath);
        if (found) return found;
      }
    }
    return null;
  };

  // 递归查找路由
  const findRoute = (
    routes: RouteItem[],
    targetKey: string
  ): RouteItem | null => {
    for (const route of routes) {
      if (route.key === targetKey) {
        return route;
      }
      if (route.children) {
        const found = findRoute(route.children, targetKey);
        if (found) return found;
      }
    }
    return null;
  };

  // 根据当前路径获取选中的菜单项（支持嵌套）
  const getSelectedKey = () => {
    const pathname = location.pathname;
    const allRoutes = getAllChildRoutes();

    // 精确匹配
    let currentRoute = allRoutes.find((route) => {
      if (route.index) {
        return pathname === "/";
      }
      // 需要构建完整路径来匹配
      const fullPath = findRoutePath(
        dynamicRoutes.find((r) => r.path === "/")?.children || [],
        route.key || ""
      );
      return fullPath && pathname === fullPath;
    });

    // 如果没有精确匹配，尝试前缀匹配（用于嵌套路由）
    if (!currentRoute) {
      currentRoute = allRoutes.find((route) => {
        if (route.path) {
          const fullPath = findRoutePath(
            dynamicRoutes.find((r) => r.path === "/")?.children || [],
            route.key || ""
          );
          return fullPath && pathname.startsWith(fullPath);
        }
        return false;
      });
    }

    return currentRoute?.key ? [currentRoute.key] : [];
  };

  // 菜单点击处理（支持嵌套路由）
  const handleMenuClick = ({ key }: { key: string }) => {
    const layoutRoute = dynamicRoutes.find((r) => r.path === "/");
    if (!layoutRoute?.children) return;

    const route = findRoute(layoutRoute.children, key);
    if (route) {
      const fullPath = findRoutePath(layoutRoute.children, key);
      if (fullPath) {
        navigate(fullPath);
      }
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div
          className="demo-logo-vertical"
          style={{
            height: 32,
            margin: 16,
            background: "rgba(255, 255, 255, 0.3)",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: "bold",
          }}
        >
          {collapsed ? "A" : "Admin"}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKey()}
          items={getMenuItems()}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: "flex",
            alignItems: "center",
            paddingLeft: 16,
          }}
        >
          {collapsed ? (
            <MenuUnfoldOutlined
              className="trigger"
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 18, cursor: "pointer" }}
            />
          ) : (
            <MenuFoldOutlined
              className="trigger"
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 18, cursor: "pointer" }}
            />
          )}
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
