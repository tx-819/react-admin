import { Dropdown } from "antd";
import {
    SunOutlined,
    MoonOutlined,
    DesktopOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useTranslation } from "react-i18next";
import { useThemeStore } from "../../../store/themeStore";

const ThemeSwitcher = () => {
    const { t } = useTranslation();
    const { theme, followSystem, setTheme, setFollowSystem } = useThemeStore();

    const themeMenuItems: MenuProps["items"] = [
        {
            key: "light",
            label: t("theme.light"),
            icon: <SunOutlined />,
        },
        {
            key: "dark",
            label: t("theme.dark"),
            icon: <MoonOutlined />,
        },
        {
            key: "system",
            label: t("theme.system"),
            icon: <DesktopOutlined />,
        },
    ];

    // 获取主题图标
    const getThemeIcon = () => {
        if (followSystem) {
            return <DesktopOutlined />;
        }
        return theme === "dark" ? (
            <MoonOutlined />
        ) : (
            <SunOutlined />
        );
    };

    const handleThemeChange = (item: { key: string }) => {
        switch (item.key) {
            case "system":
                setFollowSystem(true);
                break;
            case "light":
                setTheme("light");
                break;
            case "dark":
                setTheme("dark");
                break;
        }
    };

    return (
        <Dropdown
            menu={{
                items: themeMenuItems,
                selectable: true,
                selectedKeys: followSystem ? ["system"] : [theme],
                onSelect: handleThemeChange,
            }}
            placement="bottomRight"
        >
            <div className="cursor-pointer text-xl text-gray-500 dark:text-white">{getThemeIcon()}</div>
        </Dropdown>
    );
};

export default ThemeSwitcher;

