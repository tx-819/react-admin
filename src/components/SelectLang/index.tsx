import { useTranslation } from "react-i18next";
import { Button, Dropdown } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";

type Language = "zh" | "en";

const languageOptions: Record<Language, string> = {
  zh: "中文",
  en: "English",
};

const SelectLang = () => {
  const { i18n } = useTranslation();

  const currentLanguage = (i18n.language || "zh") as Language;

  const handleLanguageChange = (lang: Language) => {
    i18n.changeLanguage(lang);
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "zh",
      label: "中文",
      onClick: () => handleLanguageChange("zh"),
    },
    {
      key: "en",
      label: "English",
      onClick: () => handleLanguageChange("en"),
    },
  ];

  return (
    <Dropdown menu={{ items: menuItems }} placement="bottomRight">
      <Button icon={<GlobalOutlined />} type="text">
        {languageOptions[currentLanguage]}
      </Button>
    </Dropdown>
  );
};

export default SelectLang;
