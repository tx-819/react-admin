import { useState } from "react";
import type { CSSProperties } from "react";
import { Outlet } from "react-router-dom";
import { Layout, theme } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import BreadcrumbNav from "./_components/BreadcrumbNav";
import SideMenu from "./_components/SideMenu";
import RouteTransition from "./_components/RouteTransition";

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
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const headerStyle: CSSProperties = {
    padding: "0 16px",
    background: colorBgContainer,
    display: "flex",
    alignItems: "center",
  };

  const contentStyle: CSSProperties = {
    margin: "24px 16px",
    padding: 24,
    minHeight: 280,
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} theme="light" collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" style={logoStyle}>
          {collapsed ? "A" : "Admin"}
        </div>
        <SideMenu collapsed={collapsed} />
      </Sider>
      <Layout>
        <Header style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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
            <BreadcrumbNav />
          </div>
        </Header>
        <Content style={contentStyle}>
          <RouteTransition>
            <Outlet />
          </RouteTransition>
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
