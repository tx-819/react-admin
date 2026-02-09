import { useState } from "react";
import { useOutlet } from "react-router-dom";
import { Layout } from "antd";
import SideMenu from "./_components/SideMenu";
import RouteTransition from "./_components/RouteTransition";
import Header from "./_components/Header";
import { useThemeStore } from "../../../store/themeStore";

const { Sider, Content } = Layout;

const BasicLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const outlet = useOutlet();
  const { theme } = useThemeStore();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        style={{
          overflow: "auto",
          height: "100vh",
          position: "sticky",
          insetInlineStart: 0,
          top: 0,
          scrollbarWidth: "thin",
        }}
        trigger={null}
        theme={theme}
        collapsible
        collapsed={collapsed}
      >
        <div className="text-xl font-bold p-4 text-center">
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
