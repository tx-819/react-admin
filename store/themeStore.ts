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
export const setTailwindTheme = (theme: ThemeMode) => {
    if (typeof document === "undefined") return;
    if (theme === "dark") {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }
};

const STORAGE_KEY = "app_theme";

/**
 * 从 localStorage 读取持久化的主题并应用到 html，避免刷新后 dark 类丢失/闪烁。
 * 必须在 React 挂载前（如 main.tsx 最顶部）同步调用。
 */
export const applyThemeFromStorage = () => {
    if (typeof window === "undefined") return;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as { state?: { theme?: ThemeMode; followSystem?: boolean } };
        const state = parsed?.state;
        if (!state) return;
        const theme: ThemeMode = state.followSystem ? getSystemTheme() : (state.theme ?? "light");
        setTailwindTheme(theme);
    } catch {
        // 忽略解析错误，使用默认亮色
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
            name: STORAGE_KEY,
        }
    )
);

