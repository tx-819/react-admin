import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark";

/**
 * 根据系统时间获取主题
 * 白天：7:00 - 19:00 使用亮色模式
 * 黑夜：19:00 - 次日 7:00 使用暗色模式
 */
export const getSystemTheme = (): ThemeMode => {
    if (typeof window === "undefined") return "light";

    const now = new Date();
    const hour = now.getHours();

    if (hour >= 7 && hour < 19) {
        return "light";
    }
    return "dark";
};

/**
 * 设置 Tailwind 主题
 * @param theme 主题模式
 */
const setTailwindTheme = (theme: ThemeMode) => {
    if (theme === "dark") {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }
};

interface ThemeStore {
    theme: ThemeMode;
    followSystem: boolean;
    setTheme: (theme: ThemeMode) => void;
    setFollowSystem: (follow: boolean) => void;
}

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set) => {
            return {
                theme: "light" as ThemeMode,
                followSystem: false,
                setTheme: (theme: ThemeMode) => {
                    set({ theme, followSystem: false });
                    setTailwindTheme(theme);
                },
                setFollowSystem: (follow: boolean) => {
                    set({ followSystem: follow });
                    if (follow) {
                        // 跟随系统时，更新主题为系统主题
                        const systemTheme = getSystemTheme();
                        set({ theme: systemTheme });
                        setTailwindTheme(systemTheme);
                    }
                },
            };
        },
        {
            name: "app_theme",
            // 从 localStorage 恢复数据后执行初始化
            onRehydrateStorage: () => {
                return (state: ThemeStore | undefined) => {
                    console.log("onRehydrateStorage", state);
                    if (!state) return;
                    // 如果跟随系统，根据当前时间更新主题
                    if (state.followSystem) {
                        const systemTheme = getSystemTheme();
                        // 直接使用 set，但需要通过 store 实例
                        useThemeStore.setState({ theme: systemTheme, followSystem: true });
                        setTailwindTheme(systemTheme);
                    } else {
                        // 不跟随系统时，直接恢复保存的主题，不调用 setTheme 避免重置 followSystem
                        useThemeStore.setState({ theme: state.theme, followSystem: false });
                        setTailwindTheme(state.theme);
                    }
                };
            },
        }
    )
);

