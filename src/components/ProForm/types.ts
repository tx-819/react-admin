import type { FormProps, FormInstance } from "antd/es/form";
import type { Rule } from "antd/es/form";
import type { ReactNode } from "react";

/** 表单项类型 */
export type ProFormItemType =
  | "input"
  | "password"
  | "textarea"
  | "number"
  | "select"
  | "datePicker"
  | "dateRangePicker"
  | "timePicker"
  | "switch"
  | "checkbox"
  | "radio"
  | "upload"
  | "custom";

/** 表单项配置 */
export interface ProFormItemConfig {
  /** 字段名 */
  name: string | (string | number)[];
  /** 标签 */
  label?: string;
  /** 表单项类型 */
  type?: ProFormItemType;
  /** 验证规则 */
  rules?: Rule[];
  /** 占位符 */
  placeholder?: string;
  /** 初始值 */
  initialValue?: unknown;
  /** 是否必填 */
  required?: boolean;
  /** 是否隐藏 */
  hidden?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 表单项宽度（栅格布局） */
  span?: number;
  /** 表单项响应式宽度（栅格布局） */
  responsiveSpan?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    xxl?: number;
  };
  /** 表单项额外属性 */
  itemProps?: Record<string, unknown>;
  /** 输入组件额外属性 */
  fieldProps?: Record<string, unknown>;
  /** 自定义渲染函数 */
  render?: (form: FormInstance) => ReactNode;
  /** Select/Radio/Checkbox 的选项 */
  options?: Array<{ label: string; value: unknown; disabled?: boolean }>;
  /** 依赖字段，当依赖字段变化时重新渲染 */
  dependencies?: string[];
  /** 自定义渲染条件 */
  shouldUpdate?: (prevValues: unknown, currentValues: unknown) => boolean;
}

/** ProForm 配置选项 */
export interface ProFormOptions {
  /** 是否显示提交按钮 */
  showSubmitButton?: boolean;
  /** 提交按钮文本 */
  submitText?: string;
  /** 是否显示重置按钮 */
  showResetButton?: boolean;
  /** 重置按钮文本 */
  resetText?: string;
  /** 提交按钮加载状态 */
  submitLoading?: boolean;
  /** 提交回调 */
  onSubmit?: (values: Record<string, unknown>) => void | Promise<void>;
  /** 重置回调 */
  onReset?: () => void;
}

/** ProForm 属性 */
export interface ProFormProps extends Omit<FormProps, "onFinish"> {
  /** 表单项配置数组 */
  items: ProFormItemConfig[];
  /** 表单选项配置 */
  options?: ProFormOptions;
  /** 表单布局：horizontal | vertical | inline */
  layout?: "horizontal" | "vertical" | "inline";
  /** 标签列宽度（horizontal 布局时） */
  labelCol?: { span: number };
  /** 输入列宽度（horizontal 布局时） */
  wrapperCol?: { span: number };
  /** 是否显示提交按钮 */
  showSubmitButton?: boolean;
  /** 是否显示重置按钮 */
  showResetButton?: boolean;
}

/** ProForm 引用方法 */
export interface ProFormRef {
  /** 获取表单实例 */
  form: FormInstance;
  /** 提交表单 */
  submit: () => Promise<void>;
  /** 重置表单 */
  reset: () => void;
  /** 获取表单值 */
  getFieldsValue: () => Record<string, unknown>;
  /** 设置表单值 */
  setFieldsValue: (values: Record<string, unknown>) => void;
  /** 验证表单 */
  validateFields: () => Promise<Record<string, unknown>>;
}
