import { Button, Dropdown } from "antd";
import { ColumnHeightOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";

type TableSize = "small" | "middle" | "large";

interface SizeChangerProps {
  /** 当前表格大小 */
  tableSize?: TableSize;
  /** 表格大小变化回调 */
  onSizeChange?: (size: TableSize) => void;
}

const sizeLabels: Record<TableSize, string> = {
  small: "紧凑",
  middle: "中等",
  large: "宽松",
};

const SizeChanger = ({
  tableSize = "middle",
  onSizeChange,
}: SizeChangerProps) => {
  // 表格大小菜单项
  const sizeMenuItems: MenuProps["items"] = [
    {
      key: "small",
      label: "紧凑",
      onClick: () => onSizeChange?.("small"),
    },
    {
      key: "middle",
      label: "中等",
      onClick: () => onSizeChange?.("middle"),
    },
    {
      key: "large",
      label: "宽松",
      onClick: () => onSizeChange?.("large"),
    },
  ];

  return (
    <Dropdown menu={{ items: sizeMenuItems }} placement="bottomRight">
      <Button icon={<ColumnHeightOutlined />}>
        {sizeLabels[tableSize]}
      </Button>
    </Dropdown>
  );
};

export default SizeChanger;

