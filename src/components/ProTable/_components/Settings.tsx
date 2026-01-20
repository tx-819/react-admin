import { Button, Dropdown, Space, Checkbox } from "antd";
import {
  ReloadOutlined,
  ColumnHeightOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import { getColumnIdentifier } from "../_hooks/useNormalizedProps";

type TableSize = "small" | "middle" | "large";

interface SettingsProps {
  /** 是否显示刷新按钮 */
  showRefresh?: boolean;
  /** 是否显示表格大小切换 */
  showSizeChanger?: boolean;
  /** 是否显示列筛选 */
  showColumnFilter?: boolean;
  /** 加载状态 */
  loading?: boolean;
  /** 当前表格大小 */
  tableSize?: TableSize;
  /** 表格列配置 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns?: ColumnsType<any>;
  /** 可见列的 key 列表 */
  visibleColumnKeys?: string[];
  /** 刷新回调 */
  onRefresh?: () => void;
  /** 表格大小变化回调 */
  onSizeChange?: (size: TableSize) => void;
  /** 列可见性变化回调 */
  onColumnVisibilityChange?: (keys: string[]) => void;
}

const Settings = ({
  showRefresh = true,
  showSizeChanger = true,
  showColumnFilter = true,
  loading = false,
  tableSize = "middle",
  columns = [],
  visibleColumnKeys = [],
  onRefresh,
  onSizeChange,
  onColumnVisibilityChange,
}: SettingsProps) => {
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

  const sizeLabels: Record<TableSize, string> = {
    small: "紧凑",
    middle: "中等",
    large: "宽松",
  };

  // 处理列可见性变化
  const handleColumnVisibilityChange = (key: string, checked: boolean) => {
    if (!onColumnVisibilityChange) return;

    if (checked) {
      // 添加列
      onColumnVisibilityChange([...visibleColumnKeys, key]);
    } else {
      // 移除列
      onColumnVisibilityChange(visibleColumnKeys.filter((k) => k !== key));
    }
  };

  // 处理全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (!onColumnVisibilityChange || !columns) return;

    if (checked) {
      // 全选：获取所有列的标识符（dataIndex 或 key）
      const allKeys = columns
        .map((col) => getColumnIdentifier(col))
        .filter((id): id is string => id !== null);
      onColumnVisibilityChange(allKeys);
    } else {
      // 取消全选
      onColumnVisibilityChange([]);
    }
  };

  // 构建列筛选菜单项
  const getColumnFilterMenuItems = (): MenuProps["items"] => {
    if (!columns || columns.length === 0) {
      return [
        {
          key: "no-columns",
          label: "暂无列配置",
          disabled: true,
        },
      ];
    }

    // 获取所有可筛选的列（有 dataIndex 或 key 的列）
    const filterableColumns = columns.filter(
      (col) => getColumnIdentifier(col) !== null
    );

    if (filterableColumns.length === 0) {
      return [
        {
          key: "no-filterable-columns",
          label: "暂无可筛选的列",
          disabled: true,
        },
      ];
    }

    const allSelected =
      filterableColumns.length > 0 &&
      filterableColumns.every((col) => {
        const identifier = getColumnIdentifier(col);
        return identifier !== null && visibleColumnKeys.includes(identifier);
      });
    const someSelected = filterableColumns.some((col) => {
      const identifier = getColumnIdentifier(col);
      return identifier !== null && visibleColumnKeys.includes(identifier);
    });

    const items: MenuProps["items"] = [
      {
        key: "select-all",
        label: (
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected && !allSelected}
            onChange={(e) => handleSelectAll(e.target.checked)}
            onClick={(e) => e.stopPropagation()}
          >
            全选
          </Checkbox>
        ),
      },
      {
        type: "divider",
      },
      ...filterableColumns
        .map((col) => {
          const identifier = getColumnIdentifier(col);
          if (!identifier) return null;

          const title = col.title as string;
          const isVisible = visibleColumnKeys.includes(identifier);

          return {
            key: `column-${identifier}`,
            label: (
              <Checkbox
                checked={isVisible}
                onChange={(e) => {
                  e.stopPropagation();
                  handleColumnVisibilityChange(identifier, e.target.checked);
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {title || identifier}
              </Checkbox>
            ),
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
    ];

    return items;
  };

  return (
    <Space>
      {showRefresh && (
        <Button
          icon={<ReloadOutlined spin={loading} />}
          onClick={onRefresh}
          loading={loading}
          disabled={loading}
        />
      )}
      {showSizeChanger && (
        <Dropdown menu={{ items: sizeMenuItems }} placement="bottomRight">
          <Button icon={<ColumnHeightOutlined />}>
            {sizeLabels[tableSize]}
          </Button>
        </Dropdown>
      )}
      {showColumnFilter && columns && columns.length > 0 && (
        <Dropdown
          menu={{ items: getColumnFilterMenuItems() }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Button icon={<SettingOutlined />}>列设置</Button>
        </Dropdown>
      )}
    </Space>
  );
};

export default Settings;
