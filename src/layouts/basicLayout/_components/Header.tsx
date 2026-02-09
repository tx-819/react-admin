import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
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
import { useTranslation } from "react-i18next";
import BreadcrumbNav from "./BreadcrumbNav";
import { getUser, clearAuth } from "../../../../store/userStore";
import type { UserInfo } from "@/api/auth";
import SelectLang from "@/components/SelectLang";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const iconStyle: CSSProperties = {
  fontSize: 18,
  cursor: "pointer",
};

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Header = ({ collapsed, onToggle }: HeaderProps) => {
  const { t } = useTranslation();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const navigate = useNavigate();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  useEffect(() => {
    // 获取用户信息
    const user = getUser();
    setUserInfo(user);
  }, []);

  const handleLogout = () => {
    clearAuth();
    message.success(t("logoutSuccess"));
    navigate("/login");
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "user-info",
      label: (
        <div style={{ padding: "4px 0" }}>
          <div style={{ fontWeight: 500 }}>
            {userInfo?.nickname || userInfo?.username}
          </div>
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
      label: t("logout"),
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
    <AntHeader style={headerStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {collapsed ? (
          <MenuUnfoldOutlined
            className="trigger"
            onClick={onToggle}
            style={iconStyle}
          />
        ) : (
          <MenuFoldOutlined
            className="trigger"
            onClick={onToggle}
            style={iconStyle}
          />
        )}
        <BreadcrumbNav />
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <SelectLang />
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
            <Text strong>
              {userInfo?.nickname || userInfo?.username || t("user")}
            </Text>
          </Space>
        </Dropdown>
      </div>
    </AntHeader>
  );
};

export default Header;
