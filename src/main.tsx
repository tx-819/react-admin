import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { applyThemeFromStorage } from "@/store/themeStore";
import "antd/dist/reset.css";
import "nprogress/nprogress.css";
import "./index.css";
import "@/utils/i18n";
import App from "./App";

// 在 React 挂载前同步恢复 Tailwind dark class，避免刷新后暗色主题丢失/闪烁
applyThemeFromStorage();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
