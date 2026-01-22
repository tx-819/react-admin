import type { TableProps } from "antd/es/table";

export interface ProTableOptions {
  /** 是否显示刷新按钮 */
  showRefresh?: boolean;
  /** 刷新按钮文本 */
  refreshText?: string;
  /** 刷新回调 */
  onRefresh?: () => void | Promise<void>;
  /** 是否显示表格大小切换 */
  showSizeChanger?: boolean;
  /** 是否显示列筛选 */
  showColumnFilter?: boolean;
}

export interface ProTableProps<T = unknown>
  extends Omit<TableProps<T>, "dataSource" | "loading" | "title"> {
  /** 数据源 */
  dataSource?: T[];
  /** 加载状态 */
  loading?: boolean;
  /** 数据请求函数 */
  request?: (
    params?: Record<string, unknown>
  ) => Promise<{ data: T[]; total?: number }>;
  /** 请求参数 */
  params?: Record<string, unknown>;
  /** 表格选项配置 */
  options?: ProTableOptions;
  /** 表格标题 */
  title?: string | TableProps<T>["title"];
}

export interface ProTableRef {
  /** 刷新数据 */
  refresh: () => Promise<void>;
}
