import { ConfigProvider, theme as antdTheme } from "antd";
import zhCN from "antd/locale/zh_CN";
import enUS from "antd/locale/en_US";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { useThemeStore } from "../../../store/themeStore";

const antdLocaleMap = {
  zh: zhCN,
  en: enUS,
};

interface AntdConfigProviderProps {
  children: ReactNode;
}

const AntdConfigProvider = ({ children }: AntdConfigProviderProps) => {
  const { i18n } = useTranslation();
  const { theme } = useThemeStore();
  const currentLanguage = (i18n.language || "zh") as keyof typeof antdLocaleMap;
  const antdLocale = antdLocaleMap[currentLanguage] || zhCN;

  return (
    <ConfigProvider
      theme={{
        algorithm:
          theme === "dark"
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
      }}
      locale={antdLocale}
    >
      {children}
    </ConfigProvider>
  );
};

export default AntdConfigProvider;
