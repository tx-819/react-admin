import { useState } from "react";
import type { CSSProperties } from "react";
import { useOutlet } from "react-router-dom";
import { Layout } from "antd";
import SideMenu from "./_components/SideMenu";
import RouteTransition from "./_components/RouteTransition";
import Header from "./_components/Header";

const { Sider, Content } = Layout;

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

const siderStyle: React.CSSProperties = {
  overflow: "auto",
  height: "100vh",
  position: "sticky",
  insetInlineStart: 0,
  top: 0,
  scrollbarWidth: "thin",
};

const BasicLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const outlet = useOutlet();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        style={siderStyle}
        trigger={null}
        theme="light"
        collapsible
        collapsed={collapsed}
      >
        <div className="demo-logo-vertical" style={logoStyle}>
          {collapsed ? "A" : "Admin"}
        </div>
        <SideMenu />
      </Sider>
      <Layout>
        <Header
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
        <Content className="p-6 overflow-hidden">
          <RouteTransition>{outlet}</RouteTransition>
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
