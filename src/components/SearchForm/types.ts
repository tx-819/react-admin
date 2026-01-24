import type {
  ProFormItemConfig,
  ProFormProps,
  ProFormRef,
} from "../ProForm/types";

/** SearchForm 配置选项 */
export interface SearchFormOptions {
  /** 是否显示搜索按钮 */
  showSearchButton?: boolean;
  /** 搜索按钮文本 */
  searchText?: string;
  /** 是否显示重置按钮 */
  showResetButton?: boolean;
  /** 重置按钮文本 */
  resetText?: string;
  /** 是否支持折叠/展开（当表单项超过默认显示数量时） */
  showCollapseButton?: boolean;
  /** 默认是否折叠 */
  defaultCollapsed?: boolean;
  /** 默认展开时显示的表单项数量 */
  defaultShowItems?: number;
}

/** SearchForm 属性 */
export interface SearchFormProps
  extends Omit<ProFormProps, "layout" | "options" | "onSubmit"> {
  /** 表单项配置数组 */
  items: ProFormItemConfig[];
  /** 搜索表单选项配置 */
  options?: SearchFormOptions;
  /** 搜索回调 */
  onSearch?: (values: Record<string, unknown>) => void | Promise<void>;
}

/** SearchForm 引用方法 */
export interface SearchFormRef extends ProFormRef {
  /** 搜索 */
  onSearch: () => Promise<void>;
}
