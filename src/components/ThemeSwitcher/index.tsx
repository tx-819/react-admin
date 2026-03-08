import { useEffect } from "react";
import { Dropdown } from "antd";
import {
    SunOutlined,
    MoonOutlined,
    DesktopOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useTranslation } from "react-i18next";
import {
    getEffectiveTheme,
    getSystemTheme,
    useThemeStore,
} from "../../../store/themeStore";
import {
    injectViewTransitionStyle,
    toggleThemeWithTransition,
} from "../../hooks/useThemeTransition";

const ThemeSwitcher = () => {
    const { t } = useTranslation();
    const { theme, setTheme } = useThemeStore();
    const effectiveTheme = getEffectiveTheme(theme);

    useEffect(() => {
        injectViewTransitionStyle();
    }, []);

    const themeMenuItems: MenuProps["items"] = [
        { key: "light", label: t("theme.light"), icon: <SunOutlined /> },
        { key: "dark", label: t("theme.dark"), icon: <MoonOutlined /> },
        {
            key: "system",
            label: t("theme.system"),
            icon: <DesktopOutlined />,
        },
    ];

    const getThemeIcon = () => {
        if (theme === "system") return <DesktopOutlined />;
        return theme === "dark" ? <MoonOutlined /> : <SunOutlined />;
    };

    const handleThemeChange: MenuProps["onSelect"] = (info) => {
        const key = info.key;
        const event = info.domEvent as React.MouseEvent<HTMLElement>;

        if (key === "system") {
            const systemTheme = getSystemTheme();
            if (systemTheme !== effectiveTheme) {
                toggleThemeWithTransition(event, effectiveTheme === "dark", {
                    setPreferenceToSystem: true,
                });
            } else {
                setTheme("system");
            }
            return;
        }

        const targetTheme = key as "light" | "dark";
        if (targetTheme === theme) return; // 已是该偏好，无需操作

        if (targetTheme !== effectiveTheme) {
            toggleThemeWithTransition(event, effectiveTheme === "dark");
        } else {
            setTheme(targetTheme); // 从 system 锁定为当前效果
        }
    };

    return (
        <Dropdown
            menu={{
                items: themeMenuItems,
                selectable: true,
                selectedKeys: [theme],
                onSelect: handleThemeChange,
            }}
            placement="bottomRight"
        >
            <div className="cursor-pointer text-xl text-gray-500 dark:text-white">
                {getThemeIcon()}
            </div>
        </Dropdown>
    );
};

export default ThemeSwitcher;

