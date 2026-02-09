import { Dropdown } from "antd";
import {
    SunOutlined,
    MoonOutlined,
    DesktopOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useThemeStore } from "../../../store/themeStore";

const themeMenuItems: MenuProps["items"] = [
    {
        key: "light",
        label: "亮色模式",
        icon: <SunOutlined />,
    },
    {
        key: "dark",
        label: "暗色模式",
        icon: <MoonOutlined />,
    },
    {
        key: "system",
        label: "跟随系统",
        icon: <DesktopOutlined />,
    },
];

const ThemeSwitcher = () => {
    const { theme, followSystem, setTheme, setFollowSystem } = useThemeStore();

    console.log('followSystem', followSystem);

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

