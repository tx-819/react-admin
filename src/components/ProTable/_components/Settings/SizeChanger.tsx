import { Button, Dropdown } from "antd";
import { ColumnHeightOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useTranslation } from "react-i18next";

type TableSize = "small" | "middle" | "large";

interface SizeChangerProps {
  /** 当前表格大小 */
  tableSize?: TableSize;
  /** 表格大小变化回调 */
  onSizeChange?: (size: TableSize) => void;
}

const SizeChanger = ({
  tableSize = "middle",
  onSizeChange,
}: SizeChangerProps) => {
  const { t } = useTranslation();

  // 表格大小菜单项
  const sizeMenuItems: MenuProps["items"] = [
    {
      key: "small",
      label: t("tableSettings.size.small"),
      onClick: () => onSizeChange?.("small"),
    },
    {
      key: "middle",
      label: t("tableSettings.size.middle"),
      onClick: () => onSizeChange?.("middle"),
    },
    {
      key: "large",
      label: t("tableSettings.size.large"),
      onClick: () => onSizeChange?.("large"),
    },
  ];

  return (
    <Dropdown menu={{ items: sizeMenuItems }} placement="bottomRight">
      <Button icon={<ColumnHeightOutlined />}>
        {t(`tableSettings.size.${tableSize}`)}
      </Button>
    </Dropdown>
  );
};

export default SizeChanger;
