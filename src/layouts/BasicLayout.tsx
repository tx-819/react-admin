import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Layout, Menu, theme } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { getMenuItems, getRoutes, type RouteItem } from "../routes";

const { Header, Sider, Content } = Layout;

const BasicLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
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

  // 菜单点击处理（支持嵌套路由）
  const handleMenuClick = ({ key }: { key: string }) => {
    const fullPath = findRoutePath(dynamicRoutes, key);
    if (fullPath) {
      navigate(fullPath);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} theme="light" collapsible collapsed={collapsed}>
        <div
          className="demo-logo-vertical"
          style={{
            height: 32,
            margin: 16,
            background: "rgba(0, 0, 0, 0.3)",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#000",
            fontWeight: "bold",
          }}
        >
          {collapsed ? "A" : "Admin"}
        </div>
        <Menu
          theme="light"
          mode="inline"
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
