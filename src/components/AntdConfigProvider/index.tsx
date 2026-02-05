import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import enUS from "antd/locale/en_US";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";

const antdLocaleMap = {
  zh: zhCN,
  en: enUS,
};

interface AntdConfigProviderProps {
  children: ReactNode;
}

const AntdConfigProvider = ({ children }: AntdConfigProviderProps) => {
  const { i18n } = useTranslation();

  const currentLanguage = (i18n.language || "zh") as keyof typeof antdLocaleMap;
  const antdLocale = antdLocaleMap[currentLanguage] || zhCN;

  return <ConfigProvider locale={antdLocale}>{children}</ConfigProvider>;
};

export default AntdConfigProvider;
