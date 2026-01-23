import type { FormProps, FormInstance } from "antd/es/form";
import type { ProFormItemConfig } from "../ProForm/types";

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
  /** 搜索按钮加载状态 */
  searchLoading?: boolean;
  /** 搜索回调 */
  onSearch?: (values: Record<string, unknown>) => void | Promise<void>;
  /** 重置回调 */
  onReset?: () => void;
  /** 是否支持折叠/展开（当表单项超过默认显示数量时） */
  collapsible?: boolean;
  /** 默认是否折叠 */
  defaultCollapsed?: boolean;
  /** 默认展开时显示的表单项数量 */
  defaultShowItems?: number;
}

/** SearchForm 属性 */
export interface SearchFormProps
  extends Omit<FormProps, "onFinish" | "layout"> {
  /** 表单项配置数组 */
  items: ProFormItemConfig[];
  /** 搜索表单选项配置 */
  options?: SearchFormOptions;
  /** 标签列宽度（horizontal 布局时） */
  labelCol?: { span: number };
  /** 输入列宽度（horizontal 布局时） */
  wrapperCol?: { span: number };
  /** 是否显示搜索按钮 */
  showSearchButton?: boolean;
  /** 是否显示重置按钮 */
  showResetButton?: boolean;
  /** 是否支持折叠/展开 */
  collapsible?: boolean;
}

/** SearchForm 引用方法 */
export interface SearchFormRef {
  /** 获取表单实例 */
  form: FormInstance;
  /** 搜索 */
  search: () => Promise<void>;
  /** 重置表单 */
  reset: () => void;
  /** 获取表单值 */
  getFieldsValue: () => Record<string, unknown>;
  /** 设置表单值 */
  setFieldsValue: (values: Record<string, unknown>) => void;
  /** 验证表单 */
  validateFields: () => Promise<Record<string, unknown>>;
}
