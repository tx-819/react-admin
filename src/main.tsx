import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { applyThemeFromStorage } from "@/store/themeStore";
import { getIsLogin } from "@/store/userStore";
import { setMenuLoading } from "@/store/menuStore";
import "antd/dist/reset.css";
import "nprogress/nprogress.css";
import "./index.css";
import "@/utils/i18n";
import App from "./App";

// 在 React 挂载前同步恢复 Tailwind dark class，避免刷新后暗色主题丢失/闪烁
applyThemeFromStorage();

// 已登录时标记菜单加载中，SideMenu 可展示骨架
if (getIsLogin()) {
  setMenuLoading(true);
}

// 预连接 API 域名，加速首屏请求
const apiOrigin =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
try {
  const link = document.createElement("link");
  link.rel = "preconnect";
  link.href = new URL(apiOrigin).origin;
  document.head.appendChild(link);
} catch {
  // 无效 URL 时忽略
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
