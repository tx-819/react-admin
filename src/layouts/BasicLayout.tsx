import { useState, useMemo } from "react";
import type { CSSProperties } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, theme } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import {
  getMenuItems,
  getRoutes,
  findRoutePath,
  findMenuKeysByPath,
  findParentKeys,
} from "../routes";

const { Header, Sider, Content } = Layout;

// 静态样式
const logoStyle: CSSProperties = {
  height: 32,
  margin: 16,
  background: "rgba(0, 0, 0, 0.3)",
  borderRadius: 6,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#000",
  fontWeight: "bold",
};

const iconStyle: CSSProperties = {
  fontSize: 18,
  cursor: "pointer",
};

const BasicLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const dynamicRoutes = getRoutes();
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

  const headerStyle: CSSProperties = {
    padding: 0,
    background: colorBgContainer,
    display: "flex",
    alignItems: "center",
    paddingLeft: 16,
  };

  const contentStyle: CSSProperties = {
    margin: "24px 16px",
    padding: 24,
    minHeight: 280,
    background: colorBgContainer,
    borderRadius: borderRadiusLG,
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} theme="light" collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" style={logoStyle}>
          {collapsed ? "A" : "Admin"}
        </div>
        <Menu
          theme="light"
          mode="inline"
          items={getMenuItems()}
          selectedKeys={menuKeys.selectedKey ? [menuKeys.selectedKey] : []}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={headerStyle}>
          {collapsed ? (
            <MenuUnfoldOutlined
              className="trigger"
              onClick={() => setCollapsed(!collapsed)}
              style={iconStyle}
            />
          ) : (
            <MenuFoldOutlined
              className="trigger"
              onClick={() => setCollapsed(!collapsed)}
              style={iconStyle}
            />
          )}
        </Header>
        <Content style={contentStyle}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
