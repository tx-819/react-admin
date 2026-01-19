import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { useOutlet, useNavigate } from "react-router-dom";
import {
  Layout,
  theme,
  Avatar,
  Dropdown,
  Space,
  Typography,
  message,
} from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import BreadcrumbNav from "./_components/BreadcrumbNav";
import SideMenu from "./_components/SideMenu";
import RouteTransition from "./_components/RouteTransition";
import { getUserInfo, clearAuth } from "../../utils/storage";
import type { UserInfo } from "../../api/auth";

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

const { Text } = Typography;

const BasicLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const outlet = useOutlet();
  const navigate = useNavigate();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  useEffect(() => {
    // 获取用户信息
    const user = getUserInfo();
    setUserInfo(user);
  }, []);

  const handleLogout = () => {
    clearAuth();
    message.success("已退出登录");
    navigate("/login");
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "user-info",
      label: (
        <div style={{ padding: "4px 0" }}>
          <div style={{ fontWeight: 500 }}>{userInfo?.nickname || userInfo?.username}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {userInfo?.username}
          </Text>
        </div>
      ),
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "退出登录",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  const headerStyle: CSSProperties = {
    padding: "0 16px",
    background: colorBgContainer,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} theme="light" collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" style={logoStyle}>
          {collapsed ? "A" : "Admin"}
        </div>
        <SideMenu />
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
          <div style={{ display: "flex", alignItems: "center" }}>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space
                style={{ cursor: "pointer", padding: "0 8px" }}
                onClick={(e) => e.preventDefault()}
              >
                <Avatar
                  src={userInfo?.avatar}
                  icon={!userInfo?.avatar && <UserOutlined />}
                  size="default"
                />
                <Text strong>{userInfo?.nickname || userInfo?.username || "用户"}</Text>
              </Space>
            </Dropdown>
          </div>
        </Header>
        <Content className="p-6 overflow-hidden">
          <RouteTransition>{outlet}</RouteTransition>
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
