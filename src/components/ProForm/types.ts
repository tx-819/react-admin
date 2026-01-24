import type { FormProps, FormInstance, FormItemProps } from "antd/es/form";
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
export interface ProFormItemConfig extends FormItemProps {
  /** 表单项类型 */
  type?: ProFormItemType;
  /** 表单项宽度（栅格布局） */
  span?: number;
  /** 输入组件额外属性 */
  fieldProps?: Record<string, unknown>;
  /** 自定义渲染函数 */
  render?: (form: FormInstance) => ReactNode;
  /** Select/Radio/Checkbox 的选项 */
  options?: Array<{ label: string; value: unknown; disabled?: boolean }>;
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
}

/** ProForm 属性 */
export interface ProFormProps extends Omit<FormProps, "onFinish"> {
  /** 表单项配置数组 */
  items: ProFormItemConfig[];
  /** 表单选项配置 */
  options?: ProFormOptions;
  /** 表单提交回调 */
  onSubmit?: (values: Record<string, unknown>) => void | Promise<void>;
  /** 表单重置回调 */
  onReset?: () => void;
}

/** ProForm 引用方法 */
export interface ProFormRef extends Omit<FormInstance, "onSubmit"> {
  onReset: () => void;
}
